/**
 * POST /api/ticketmaster-sync
 *
 * Fetches events from Ticketmaster Discovery API v2 and upserts them into
 * the Supabase `stage_productions` table.
 *
 * Modes:
 *   preview  – count pages & estimate rows, no writes
 *   sync     – fetch all pages and upsert rows
 *
 * Body: { category: string, mode: "preview" | "sync" }
 */

import { createSupabaseAdmin } from "@/lib/supabase";

const API_KEY = process.env.TICKETMASTER_API_KEY!;
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

// ── Category → Ticketmaster classificationName mappings ──────────────────────
const CATEGORY_MAP: Record<string, string[]> = {
  musical:       ["Theatre", "Musicals"],
  opera:         ["Opera"],
  classical:     ["Classical"],
  music:         ["Music"],
  electronic:    ["Electronic"],
  "pop-rock":    [
    "Alternative", "Blues", "Country", "Folk", "Hip-Hop/Rap", "Jazz",
    "Latin", "Medieval/Renaissance", "Metal", "New Age", "Other",
    "Pop", "R&B", "Reggae", "Religious", "Rock", "World",
  ],
  "performance-art": ["Performance Art", "Variety"],
  dance:         ["Dance"],
  other: [
    "Ballads/Romantic", "Children's Music", "Holiday",
    "Children's Theater", "Circus & Specialty Acts", "Comedy",
    "Cultural", "Espectaculo", "Fashion", "Fine Art",
    "Magic & Illusion", "Miscellaneous", "Multimedia", "Puppetry", "Spectacular",
  ],
};

const PAGE_SIZE = 200;
const MAX_PAGES = 4; // 5 pages × 200 = 1000 per classificationName (API limit)

// ── Sleep helper ─────────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Fetch one page from Ticketmaster ─────────────────────────────────────────
async function fetchPage(classificationName: string, page: number) {
  const url = `${BASE_URL}/events.json?classificationName=${encodeURIComponent(classificationName)}&size=${PAGE_SIZE}&page=${page}&sort=date,asc&countryCode=US&apikey=${API_KEY}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.status === 429 || res.status >= 500) {
      const wait = (attempt + 1) * 2000;
      console.log(`  [!] ${res.status} — retrying in ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
    }
    return res.json();
  }
  throw new Error("Failed after 3 attempts");
}

// ── Parse a raw Ticketmaster event into a stage_productions row ──────────────
function parseEvent(raw: any, category: string): Record<string, unknown> {
  const tmId = raw.id as string;

  // Date / time
  const localDate = raw.dates?.start?.localDate;       // "YYYY-MM-DD"
  const localTime = raw.dates?.start?.localTime;        // "HH:MM:SS"
  const eventDateMs = localDate
    ? new Date(`${localDate}T${localTime || "00:00:00"}`).getTime()
    : null;

  // Cover image — pick the first landscape image
  const images: Array<{ url: string; width: number; height: number }> = raw.images || [];
  const sorted = [...images].sort((a, b) => (b.width * b.height) - (a.width * a.height));
  const coverImage = sorted[0]?.url || "";

  // Description / info
  const description = (raw.info || raw.pleaseNote || "").slice(0, 1000);

  // Status
  const statusCode = raw.dates?.status?.code as string | undefined;
  let status: "draft" | "upcoming" | "past" = "draft";
  if (statusCode === "onsale" || statusCode === "offsale") {
    if (localDate) {
      const now = new Date().toISOString().split("T")[0];
      status = localDate >= now ? "upcoming" : "past";
    } else {
      status = "upcoming";
    }
  } else if (statusCode === "canceled" || statusCode === "postponed") {
    status = "draft";
  }

  // Source URL
  const url = raw.url || "";

  // Content: embed key venue info
  const venue = raw._embedded?.venues?.[0];
  const content = venue
    ? `<p><strong>Venue:</strong> ${venue.name || "TBA"}${venue.city?.name ? `, ${venue.city.name}` : ""}</p>`
    : "";

  return {
    id: `${category}_${tmId}`,
    title: (raw.name || "Untitled").slice(0, 500),
    description,
    content,
    cover_image: coverImage,
    url,
    category,
    status,
    event_date: eventDateMs,
    event_time: localTime || "",
    media_links: [],
    is_featured: false,
    created_at: Date.now(),
    updated_at: null,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!API_KEY) {
    return Response.json({ error: "TICKETMASTER_API_KEY not configured" }, { status: 500 });
  }

  let body: { category?: string; mode?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { category, mode = "preview" } = body;

  if (!category || !CATEGORY_MAP[category]) {
    return Response.json(
      { error: `Unknown category. Valid: ${Object.keys(CATEGORY_MAP).join(", ")}` },
      { status: 400 }
    );
  }

  const classificationNames = CATEGORY_MAP[category];
  const supabase = createSupabaseAdmin();

  // ── Phase 1: fetch + deduplicate ──────────────────────────────────────────
  const allEvents: any[] = [];

  for (const cls of classificationNames) {
    console.log(`[ticketmaster-sync] Fetching [${cls}]...`);
    for (let page = 0; page <= MAX_PAGES; page++) {
      try {
        const data = await fetchPage(cls, page);
        const pageData = data._embedded?.events || [];
        allEvents.push(...pageData);
        console.log(`  [${cls}] page ${page}: +${pageData.length} events`);
        if (pageData.length === 0) break;
        await sleep(300);
      } catch (err: any) {
        console.error(`  [${cls}] page ${page} error:`, err.message);
        break;
      }
      await sleep(1000);
    }
  }

  // Deduplicate by TM id
  const seen = new Set<string>();
  const unique = allEvents.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });

  // ── Phase 2: parse ────────────────────────────────────────────────────────
  const rows = unique.map((raw) => parseEvent(raw, category));

  if (mode === "preview") {
    return Response.json({
      mode: "preview",
      category,
      totalFetched: allEvents.length,
      afterDedup: unique.length,
      classificationNames,
    });
  }

  // ── Phase 3: upsert (sync mode) ───────────────────────────────────────────
  const BATCH = 500;
  let upserted = 0;
  let errors = 0;
  const errorMessages: string[] = [];

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);

    // Supabase upsert on id — match on conflict, update existing
    const { data, error } = await supabase
      .from("stage_productions")
      .upsert(batch, {
        onConflict: "id",
        ignoreDuplicates: false,
      });

    if (error) {
      errors += batch.length;
      errorMessages.push(error.message);
      console.error("[ticketmaster-sync] Upsert batch error:", error.message);
    } else {
      upserted += batch.length;
    }

    // Rate-limit between batches
    if (i + BATCH < rows.length) await sleep(500);
  }

  return Response.json({
    mode: "sync",
    category,
    totalFetched: allEvents.length,
    afterDedup: unique.length,
    upserted,
    errors,
    errorMessages: errorMessages.slice(0, 5),
  });
}
