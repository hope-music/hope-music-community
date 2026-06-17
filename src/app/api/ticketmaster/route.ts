import { NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const CONSUMER_KEY = "G0AVxK4c8bvtFMp0pJapkWEYlyu8DtIE";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";

// 每个前台子板块对应一组 Ticketmaster 抓取目标
// 同一个 category 可能对应多个 (segmentName, genreName) 组合
interface FetchTarget {
  segmentName: string;
  genreName?: string;
}

const CATEGORY_FETCH_MAP: Record<string, FetchTarget[]> = {
  musical: [
    { segmentName: "Arts & Theatre", genreName: "Broadway" },
    { segmentName: "Arts & Theatre", genreName: "Theater" },
  ],
  opera: [
    { segmentName: "Arts & Theatre", genreName: "Opera" },
  ],
  classical: [
    { segmentName: "Arts & Theatre", genreName: "Classical" },
    { segmentName: "Music", genreName: "Classical" },
  ],
  music: [
    { segmentName: "Arts & Theatre", genreName: "Music" },
  ],
  electronic: [
    { segmentName: "Music", genreName: "Dance/Electronic" },
  ],
  "pop-rock": [
    { segmentName: "Music", genreName: "Alternative" },
    { segmentName: "Music", genreName: "Blues" },
    { segmentName: "Music", genreName: "Country" },
    { segmentName: "Music", genreName: "Folk" },
    { segmentName: "Music", genreName: "Hip-Hop/Rap" },
    { segmentName: "Music", genreName: "Jazz" },
    { segmentName: "Music", genreName: "Latin" },
    { segmentName: "Music", genreName: "Medieval/Renaissance" },
    { segmentName: "Music", genreName: "Metal" },
    { segmentName: "Music", genreName: "New Age" },
    { segmentName: "Music", genreName: "Other" },
    { segmentName: "Music", genreName: "Pop" },
    { segmentName: "Music", genreName: "R&B" },
    { segmentName: "Music", genreName: "Reggae" },
    { segmentName: "Music", genreName: "Religious" },
    { segmentName: "Music", genreName: "Rock" },
    { segmentName: "Music", genreName: "World" },
  ],
  "performance-art": [
    { segmentName: "Arts & Theatre", genreName: "Performance Art" },
    { segmentName: "Arts & Theatre", genreName: "Variety" },
  ],
  dance: [
    { segmentName: "Arts & Theatre", genreName: "Dance" },
  ],
  other: [
    { segmentName: "Music", genreName: "Ballads/Romantic" },
    { segmentName: "Music", genreName: "Children's Music" },
    { segmentName: "Music", genreName: "Holiday" },
    { segmentName: "Arts & Theatre", genreName: "Children's Theater" },
    { segmentName: "Arts & Theatre", genreName: "Circus & Specialty Acts" },
    { segmentName: "Arts & Theatre", genreName: "Comedy" },
    { segmentName: "Arts & Theatre", genreName: "Cultural" },
    { segmentName: "Arts & Theatre", genreName: "Espectaculo" },
    { segmentName: "Arts & Theatre", genreName: "Fashion" },
    { segmentName: "Arts & Theatre", genreName: "Fine Art" },
    { segmentName: "Arts & Theatre", genreName: "Magic & Illusion" },
    { segmentName: "Arts & Theatre", genreName: "Miscellaneous" },
    { segmentName: "Arts & Theatre", genreName: "Multimedia" },
    { segmentName: "Arts & Theatre", genreName: "Puppetry" },
    { segmentName: "Arts & Theatre", genreName: "Spectacular" },
  ],
};

// 每个分类的输出文件路径
function getOutputPath(category: string): string {
  return path.join(process.cwd(), "public", "data", "ticketmaster", category, "events.json");
}

interface TmEvent {
  id: string;
  name: string;
  url: string;
  images: Array<{ url: string; width: number; height: number }>;
  dates: {
    start?: { localDate?: string; localTime?: string };
    status?: { code?: string };
  };
  _embedded?: {
    venues?: Array<{
      name?: string;
      city?: { name?: string };
    }>;
    attractions?: Array<{
      name?: string;
      classification?: Array<{
        segment?: { name?: string };
        genre?: { name?: string };
        subGenre?: { name?: string };
      }>;
    }>;
  };
  priceRanges?: Array<{ min?: number; max?: number; currency?: string }>;
  info?: string;
  pleaseNote?: string;
}

interface PerformanceItem {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  description: string;
  content: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
  venue?: string;
  city?: string;
  priceRange?: string;
  url?: string;
  sourceUrl?: string;
  createdAt: number;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  musical: [
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&q=80",
    "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
  ],
  opera: [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&q=80",
    "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
  ],
  classical: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  ],
  music: [
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
  ],
  electronic: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
  ],
  "pop-rock": [
    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=800&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
  ],
  "performance-art": [
    "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&q=80",
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&q=80",
    "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=80",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80",
    "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
  ],
  dance: [
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80",
    "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
    "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800&q=80",
    "https://images.unsplash.com/photo-1485814837398-ed2048f57499?w=800&q=80",
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80",
    "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&q=80",
  ],
  other: [
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&q=80",
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&q=80",
  ],
};

function getCategoryImage(category: string, eventId: string): string {
  const pool = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["other"];
  const index = Math.abs(eventId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % pool.length;
  return pool[index];
}

async function fetchTm(url: string): Promise<any | null> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const fullUrl = `${url}${url.includes("?") ? "&" : "?"}apikey=${CONSUMER_KEY}`;
      const res = await fetch(fullUrl, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(20_000),
      });
      if (res.status === 429) {
        console.log(`[TM] 429 rate limited on attempt ${attempt + 1}, waiting...`);
        await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) {
        console.log(`[TM] HTTP ${res.status}`);
        return null;
      }
      return await res.json();
    } catch {
      if (attempt === 2) return null;
    }
  }
  return null;
}

function normalizeEvent(event: TmEvent, category: string): PerformanceItem {
  const venue = event._embedded?.venues?.[0];

  const priceRange = event.priceRanges
    ? `${event.priceRanges[0].currency || "USD"} ${event.priceRanges[0].min?.toFixed(0)}–${event.priceRanges[0].max?.toFixed(0)}`
    : undefined;

  const now = new Date();
  const localDate = event.dates.start?.localDate;
  const localTime = event.dates.start?.localTime;
  let status: "upcoming" | "past" | "draft" = "upcoming";
  if (localDate) {
    const eventTime = new Date(localDate);
    if (eventTime < now) status = "past";
  }

  const eventDate = localDate
    ? localTime ? `${localDate}T${localTime}` : localDate
    : undefined;

  return {
    id: event.id,
    title: event.name,
    category,
    coverImage: getCategoryImage(category, event.id),
    description: event.info || event.pleaseNote || "",
    content: event.info || event.pleaseNote || "",
    status,
    eventDate,
    venue: venue?.name,
    city: venue?.city?.name,
    priceRange,
    url: event.url,
    sourceUrl: event.url,
    createdAt: Date.now(),
  };
}

async function fetchCategoryEvents(
  category: string,
  targets: FetchTarget[]
): Promise<PerformanceItem[]> {
  const seen = new Set<string>();
  const events: PerformanceItem[] = [];
  const pageSize = 50;

  for (const target of targets) {
    for (let page = 0; page < 10; page++) {
      const url = new URL(`${BASE_URL}/events.json`);
      url.searchParams.set("segmentName", target.segmentName);
      if (target.genreName) url.searchParams.set("genreName", target.genreName);
      url.searchParams.set("size", String(pageSize));
      url.searchParams.set("page", String(page));
      url.searchParams.set("sort", "date,asc");
      url.searchParams.set("countryCode", "US");

      const data = await fetchTm(url.toString());
      if (!data?._embedded?.events?.length) break;

      for (const event of data._embedded.events as TmEvent[]) {
        if (!seen.has(event.id)) {
          seen.add(event.id);
          events.push(normalizeEvent(event, category));
        }
      }

      if (page >= (data.page?.totalPages || 1) - 1) break;
    }
  }

  events.sort((a, b) => {
    if (a.status === "upcoming" && b.status !== "upcoming") return -1;
    if (a.status !== "upcoming" && b.status === "upcoming") return 1;
    return (a.eventDate || "").localeCompare(b.eventDate || "");
  });

  return events;
}

export async function POST() {
  try {
    const baseDir = path.join(process.cwd(), "public", "data", "ticketmaster");
    if (!existsSync(baseDir)) {
      await mkdir(baseDir, { recursive: true });
    }

    let grandTotal = 0;
    const results: Record<string, { total: number; fetchedAt: string }> = {};

    for (const [category, targets] of Object.entries(CATEGORY_FETCH_MAP)) {
      const events = await fetchCategoryEvents(category, targets);
      const payload = {
        events,
        total: events.length,
        fetchedAt: new Date().toISOString(),
      };

      const outDir = path.join(baseDir, category);
      if (!existsSync(outDir)) {
        await mkdir(outDir, { recursive: true });
      }
      await writeFile(getOutputPath(category), JSON.stringify(payload, null, 2), "utf-8");

      grandTotal += events.length;
      results[category] = { total: events.length, fetchedAt: payload.fetchedAt };
    }

    return NextResponse.json({
      success: true,
      total: grandTotal,
      categories: results,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Ticketmaster sync error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Sync failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), "public", "data", "ticketmaster");

    if (!existsSync(baseDir)) {
      return NextResponse.json(
        { success: false, error: "No cached data. Run a sync first." },
        { status: 404 }
      );
    }

    const categories = Object.keys(CATEGORY_FETCH_MAP);
    let grandTotal = 0;
    const categoryDetails: Record<string, { total: number; fetchedAt: string }> = {};
    let latestFetchedAt = "";

    for (const category of categories) {
      const filePath = getOutputPath(category);
      if (existsSync(filePath)) {
        const raw = await readFile(filePath, "utf-8");
        const payload = JSON.parse(raw);
        categoryDetails[category] = {
          total: payload.total || 0,
          fetchedAt: payload.fetchedAt || "",
        };
        grandTotal += categoryDetails[category].total;
        if (categoryDetails[category].fetchedAt > latestFetchedAt) {
          latestFetchedAt = categoryDetails[category].fetchedAt;
        }
      }
    }

    if (grandTotal === 0) {
      return NextResponse.json(
        { success: false, error: "No cached data. Run a sync first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      total: grandTotal,
      fetchedAt: latestFetchedAt,
      categories: categoryDetails,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Fetch failed" },
      { status: 500 }
    );
  }
}
