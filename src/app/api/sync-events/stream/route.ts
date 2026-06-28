import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Music genres for genreId-based categories
const MUSIC_GENRE_IDS: Array<{ id: string; name: string }> = [
  { id: "KnvZfZ7vAev", name: "Pop" },
  { id: "KnvZfZ7vAeA", name: "Rock" },
  { id: "KnvZfZ7vAv1", name: "Hip-Hop/Rap" },
  { id: "KnvZfZ7vAv6", name: "Country" },
  { id: "KnvZfZ7vAJ6", name: "Latin" },
  { id: "KnvZfZ7vAvF", name: "Dance/Electronic" },
];

// TM Arts & Theatre segment ID
const ARTS_THEATRE_SEGMENT_ID = "KZFzniwnSyZfZ7v7na";
// TM Music segment ID
const MUSIC_SEGMENT_ID = "KZFzniwnSyZfZ7v7nJ";

type SyncConfig =
  | { mode: "classificationName"; classificationName: string; segmentId?: string; segmentName?: string; genreId?: string }
  | { mode: "broadway" }
  | { mode: "genreIds"; genres: Array<{ id: string; name: string }>; segmentId?: string };

const CATEGORIES: Array<{ key: string; config: SyncConfig; scopes: ("US" | "International")[] }> = [
  { key: "musical",      config: { mode: "broadway" },                                                    scopes: ["US", "International"] },
  // Opera → Arts & Theatre segment + Opera genre (KnvZfZ7v7lk)
  { key: "opera",        config: { mode: "classificationName", classificationName: "Opera", segmentId: ARTS_THEATRE_SEGMENT_ID, genreId: "KnvZfZ7v7lk" }, scopes: ["US", "International"] },
  // Classical → Arts & Theatre segment + Classical genre (KnvZfZ7v7nJ)
  { key: "classical",    config: { mode: "classificationName", classificationName: "Classical", segmentId: ARTS_THEATRE_SEGMENT_ID, genreId: "KnvZfZ7v7nJ" }, scopes: ["US", "International"] },
  // Concert → Music segment + Classical genre (KnvZfZ7vAeJ)
  { key: "concert",      config: { mode: "genreIds", genres: [{ id: "KnvZfZ7vAeJ", name: "Classical" }], segmentId: MUSIC_SEGMENT_ID }, scopes: ["US", "International"] },
  { key: "electronic",   config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Dance/Electronic") }, scopes: ["US", "International"] },
  { key: "pop",          config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Pop") },           scopes: ["US", "International"] },
  { key: "rock",         config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Rock") },          scopes: ["US", "International"] },
  { key: "hip-hop-rap",  config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Hip-Hop/Rap") },   scopes: ["US", "International"] },
  { key: "country",      config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Country") },       scopes: ["US", "International"] },
  { key: "latin",        config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Latin") },         scopes: ["US", "International"] },
  // Dance → Arts & Theatre segment + Dance genre (KnvZfZ7v7nI)
  { key: "dance",        config: { mode: "classificationName", classificationName: "Dance", segmentId: ARTS_THEATRE_SEGMENT_ID, genreId: "KnvZfZ7v7nI" }, scopes: ["US", "International"] },
  // Other → empty table; you fill this manually with non-Ticketmaster content
  { key: "other",        config: { mode: "skip" },                                                          scopes: ["US", "International"] },
];

const PAGE_SIZE = 100; // large → fewer API calls, but risk hitting TM 1000 paging limit
const MAX_PER_WINDOW = 900; // < TM 1000 hard cap, safety margin
const WINDOW_DAYS_INITIAL = 30;
const MIN_WINDOW_DAYS = 1;

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase configuration missing");
  return createClient(url, key);
}

function emit(controller: ReadableStreamDefaultController, data: unknown) {
  const chunk = `data: ${JSON.stringify(data)}\n\n`;
  try { controller.enqueue(new TextEncoder().encode(chunk)); } catch {}
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry<T>(url: string, retries = 3, delayMs = 600): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url);
    if (response.ok) return response.json();
    const body = await response.text().catch(() => "");
    if ((response.status === 429 || response.status === 400) && attempt < retries) {
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
      continue;
    }
    throw new Error(`TM API ${response.status}: ${body.slice(0, 200)}`);
  }
  throw new Error("TM API retries exhausted");
}

function isoNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function isoAt(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function buildTmParams(apiKey: string, opts: {
  classificationName?: string;
  genreId?: string;
  segmentId?: string;
  segmentName?: string;
  stateCode?: string;
  countryCode: string;
  startDateTime?: string;
  endDateTime?: string;
  page: number;
  size?: number;
}): URLSearchParams {
  const p = new URLSearchParams({
    apikey: apiKey,
    size: (opts.size ?? PAGE_SIZE).toString(),
    page: opts.page.toString(),
    sort: "date,asc",
  });
  if (opts.genreId) p.append("genreId", opts.genreId);
  else if (opts.classificationName) p.append("classificationName", opts.classificationName);
  if (opts.segmentId) p.append("segmentId", opts.segmentId);
  else if (opts.segmentName) p.append("segmentName", opts.segmentName);
  if (opts.stateCode) p.append("stateCode", opts.stateCode);
  if (opts.startDateTime) p.append("startDateTime", opts.startDateTime);
  if (opts.endDateTime)   p.append("endDateTime",   opts.endDateTime);
  p.append("countryCode", opts.countryCode);
  return p;
}

function pickEventFields(event: any, region: "US" | "international") {
  const start = event.dates?.start;
  const priceRanges = event.priceRanges?.[0];
  const venue = event._embedded?.venues?.[0];
  const venueCountry = venue?.country?.countryCode || null;
  const resolvedRegion: "US" | "international" = venueCountry === "US" ? "US" : "international";
  const classification = event.classifications?.[0];

  return {
    ticketmaster_id: event.id,
    title: event.name || "Unknown",
    event_date: start?.localDate || null,
    image_url: event.images?.find((img: any) => img.width >= 300)?.url || event.images?.[0]?.url || null,
    venue: venue?.name || null,
    city: venue?.city?.name || null,
    state: venue?.state?.stateCode || venue?.state?.name || null,
    country: venueCountry || (region === "US" ? "US" : "Unknown"),
    region: resolvedRegion,
    price_min: priceRanges?.min || null,
    price_max: priceRanges?.max || null,
    currency: priceRanges?.currency || "USD",
    ticket_url: event.url || null,
    segment: classification?.segment?.name || null,
    genre: classification?.genre?.name || null,
    sub_category: null,
  };
}

const FIELD_MAPS: Record<string, string[]> = {
  concert: ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","segment","genre"],
  musical: ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","sub_category"],
  pop:     ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","sub_category"],
  rock:    ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","sub_category"],
  "hip-hop-rap": ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","sub_category"],
  country: ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","sub_category"],
  latin:   ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","sub_category"],
  classical: ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","segment","genre","sub_category"],
  electronic: ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","segment","genre","sub_category"],
  dance:   ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","segment","genre","sub_category"],
  other:   ["ticketmaster_id","title","event_date","image_url","venue","city","state","country","region","price_min","price_max","currency","ticket_url","segment","genre","sub_category"],
};

function applyFieldMap(raw: Record<string, unknown>, categoryKey: string, genreName?: string): Record<string, unknown> {
  const fields = FIELD_MAPS[categoryKey];
  if (!fields) return raw;
  const result: Record<string, unknown> = { ticketmaster_id: raw.ticketmaster_id };
  for (const f of fields) {
    if (f !== "ticketmaster_id" && f in raw) result[f] = raw[f];
  }
  if (categoryKey === "musical") result.sub_category = "Broadway";
  else if (["pop","rock","hip-hop-rap","country","latin"].includes(categoryKey) && genreName) result.sub_category = genreName;
  return result;
}

async function upsertBatch(supabase: any, tableName: string, events: any[]): Promise<{ upserted: number; errors: number }> {
  if (!events.length) return { upserted: 0, errors: 0 };
  const { data, error } = await supabase
    .from(tableName)
    .upsert(events, { onConflict: "ticketmaster_id" })
    .select("id");
  if (!error) return { upserted: data?.length ?? events.length, errors: 0 };
  // fallback one-by-one
  let ok = 0, err = 0;
  for (const ev of events) {
    const { error: e } = await supabase.from(tableName).upsert(ev, { onConflict: "ticketmaster_id" });
    if (e) err++; else ok++;
  }
  return { upserted: ok, errors: err };
}

/**
 * Generic TM page fetcher. Used by both broadway (with stateCode) and
 * classificationName / genreIds branches (without stateCode).
 */
async function fetchTmPage(apiKey: string, countryScope: "US" | "International", opts: {
  classificationName?: string;
  genreId?: string;
  segmentId?: string;
  segmentName?: string;
  stateCode?: string;
  startDateTime?: string;
  endDateTime?: string;
  page: number;
  size?: number;
}): Promise<any> {
  const params = buildTmParams(apiKey, {
    ...opts,
    countryCode: countryScope === "US" ? "US" : "GB,AU,CA,DE,FR,IT,ES,NL,BE,AT,CH,JP,KR,MX,BR,AR",
  });
  await sleep(200);
  return fetchWithRetry(`https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`);
}

/**
 * Self-adaptive recursive window fetcher.
 *
 * - Tries one window of [start, end].
 * - If TM reports totalElements > MAX_PER_WINDOW (or > size * pages available),
 *   splits the window in half and recurses on each half.
 * - Otherwise paginates page-by-page until done.
 *
 * Returns the total events successfully upserted across all leaves.
 */
type FetchOpts = {
  classificationName?: string;
  genreId?: string;
  segmentId?: string;
  segmentName?: string;
  stateCode?: string;
  startDateTime?: string; // ISO
  endDateTime?: string;   // ISO (exclusive)
};

async function fetchWindowRecursive(
  apiKey: string,
  countryScope: "US" | "International",
  supabase: any,
  tableName: string,
  categoryKey: string,
  genreName: string | undefined,
  region: "US" | "international",
  controller: ReadableStreamDefaultController,
  opts: FetchOpts,
  windowDays: number,
  depth: number,
): Promise<{ upserted: number; errors: number }> {
  // Probe page 0 to learn totalElements
  let tmData: any;
  try {
    tmData = await fetchTmPage(apiKey, countryScope, { ...opts, page: 0 });
  } catch (e: any) {
    const msg = `[sync] ${categoryKey}/${countryScope}/${genreName ?? ""} probe FAILED: ${e.message}`;
    console.log(msg);
    emit(controller, { type: "error", category: categoryKey, scope: countryScope, message: msg });
    return { upserted: 0, errors: 1 };
  }

  const totalElements: number = tmData.page?.totalElements ?? 0;
  const totalPages: number    = tmData.page?.totalPages ?? 0;

  const winLabel = `[${opts.startDateTime ?? "-∞"},${opts.endDateTime ?? "+∞"}] (window=${windowDays}d, depth=${depth})`;
  console.log(`[sync] ${categoryKey}/${countryScope}/${genreName ?? ""} ${winLabel} totalElements=${totalElements} totalPages=${totalPages}`);
  emit(controller, { type: "info", category: categoryKey, scope: countryScope, message: `${genreName ?? categoryKey} ${winLabel} totalElements=${totalElements} totalPages=${totalPages}` });

  // Hard floor: window is already 1 day. If still > MAX, fall back to paging
  // through (we'll still lose data past 1000, but log loudly).
  if (totalElements > MAX_PER_WINDOW && windowDays > MIN_WINDOW_DAYS) {
    const startMs = opts.startDateTime ? new Date(opts.startDateTime).getTime() : Date.now();
    const endMs   = opts.endDateTime   ? new Date(opts.endDateTime).getTime()   : startMs + 365 * 24 * 60 * 60 * 1000 * 10;
    const midMs   = Math.floor((startMs + endMs) / 2);
    const mid = new Date(midMs);
    const leftOpts  = { ...opts, endDateTime: isoAt(mid) };
    const rightOpts = { ...opts, startDateTime: isoAt(mid) };
    const halfDays  = Math.max(MIN_WINDOW_DAYS, Math.floor(windowDays / 2));
    console.log(`[sync] ${categoryKey}/${countryScope}/${genreName ?? ""} SPLIT window ${windowDays}d → 2× ${halfDays}d`);
    emit(controller, { type: "info", category: categoryKey, scope: countryScope, message: `${genreName ?? categoryKey} SPLIT ${windowDays}d → 2× ${halfDays}d` });
    const left  = await fetchWindowRecursive(apiKey, countryScope, supabase, tableName, categoryKey, genreName, region, controller, leftOpts,  halfDays, depth + 1);
    const right = await fetchWindowRecursive(apiKey, countryScope, supabase, tableName, categoryKey, genreName, region, controller, rightOpts, halfDays, depth + 1);
    return { upserted: left.upserted + right.upserted, errors: left.errors + right.errors };
  }

  // Leaf: paginate through all pages of this window, but HARD CAP at TM's
  // 1000 paging limit (page * size < 1000). Past that, stop and log.
  // Also filter out events whose localDate < today (timezone skew: TM
  // filters by UTC startDateTime but returns venue-local date).
  const PAGE_HARD_CAP = Math.floor(1000 / PAGE_SIZE); // = 10 when size=100
  const today = new Date().toISOString().slice(0, 10);
  const truncatedNote = totalElements > PAGE_HARD_CAP * PAGE_SIZE
    ? ` [TRUNCATED at TM limit ${PAGE_HARD_CAP * PAGE_SIZE}/${totalElements}]`
    : "";
  let upserted = 0;
  let filteredPast = 0;
  let errors = 0;
  const maxPages = totalPages > 0 ? Math.min(totalPages, PAGE_HARD_CAP) : 1;
  for (let page = 0; page < maxPages; page++) {
    let pageData: any;
    try {
      pageData = page === 0 ? tmData : await fetchTmPage(apiKey, countryScope, { ...opts, page });
    } catch (e: any) {
      console.log(`[sync] ${categoryKey}/${countryScope}/${genreName ?? ""} ${winLabel} page=${page} ERROR: ${e.message}`);
      emit(controller, { type: "error", category: categoryKey, scope: countryScope, message: `${genreName ?? categoryKey} page ${page + 1}: ${e.message}` });
      errors++;
      continue;
    }
    const events = pageData._embedded?.events ?? [];
    if (!events.length) break;
    const rawEvents = events
      .map((e: any) => pickEventFields(e, region))
      .filter((e: any) => !e.event_date || e.event_date >= today);
    filteredPast += events.length - rawEvents.length;
    if (!rawEvents.length) {
      emit(controller, {
        type: "progress",
        category: categoryKey, scope: countryScope, genre: genreName,
        page: page + 1, eventCount: 0, upserted: 0, errors: 0,
        message: `${genreName ?? categoryKey} page ${page + 1}/${maxPages}: 0 future (${events.length} skipped as past)`,
      });
      continue;
    }
    const mapped   = rawEvents.map((e: any) => applyFieldMap(e, categoryKey, genreName));
    const r = await upsertBatch(supabase, tableName, mapped);
    upserted += r.upserted;
    errors   += r.errors;
    console.log(`[sync] ${categoryKey}/${countryScope}/${genreName ?? ""} ${winLabel} page=${page} returned=${events.length} future=${rawEvents.length} upserted=${r.upserted} errors=${r.errors}${truncatedNote}`);
    emit(controller, {
      type: "progress",
      category: categoryKey,
      scope: countryScope,
      genre: genreName,
      page: page + 1,
      eventCount: rawEvents.length,
      upserted: r.upserted,
      errors: r.errors,
      message: `${genreName ?? categoryKey} page ${page + 1}/${maxPages}: ${rawEvents.length} future (of ${events.length} fetched) → ${r.upserted} upserted${truncatedNote}`,
    });
  }
  if (truncatedNote) {
    console.log(`[sync] ${categoryKey}/${countryScope}/${genreName ?? ""} ${winLabel} TRUNCATED — TM paging limit reached`);
    emit(controller, { type: "info", category: categoryKey, scope: countryScope, message: `${genreName ?? categoryKey}${truncatedNote}` });
  }
  if (filteredPast > 0) {
    emit(controller, { type: "info", category: categoryKey, scope: countryScope, message: `${genreName ?? categoryKey} filtered out ${filteredPast} past events (localDate < ${today})` });
  }
  return { upserted, errors };
}

async function syncCategory(
  supabase: any,
  apiKey: string,
  categoryKey: string,
  countryScope: "US" | "International",
  config: SyncConfig,
  controller: ReadableStreamDefaultController
) {
  const region = countryScope === "US" ? "US" : "international";
  const tableName = `${categoryKey.replace(/-/g, "_")}_events`;
  const now = new Date();
  const initialOpts = { startDateTime: isoAt(now) }; // no endDateTime → all future

  emit(controller, {
    type: "start",
    category: categoryKey,
    scope: countryScope,
    message: `Starting ${categoryKey} (${countryScope})…`,
  });

  // Skip mode: clear table and exit (e.g. "other" = manual fill)
  if (config.mode === "skip") {
    const { count: deletedCount, error: deleteError } = await supabase
      .from(tableName)
      .delete({ count: "exact" })
      .eq("region", region);
    if (deleteError) {
      emit(controller, { type: "error", category: categoryKey, scope: countryScope, message: `Pre-sync purge failed: ${deleteError.message}` });
    } else {
      emit(controller, { type: "info", category: categoryKey, scope: countryScope, message: `Skipped ${categoryKey} (${countryScope}) — table cleared, manual content only. Purged ${deletedCount ?? 0} rows.` });
    }
    emit(controller, {
      type: "done",
      category: categoryKey,
      scope: countryScope,
      upserted: 0,
      errors: 0,
      message: `⏭ ${categoryKey} (${countryScope}) skipped (manual content)`,
    });
    return { upserted: 0, errors: 0 };
  }

  // Pre-sync purge
  {
    const { count: deletedCount, error: deleteError } = await supabase
      .from(tableName)
      .delete({ count: "exact" })
      .eq("region", region);
    if (deleteError) {
      emit(controller, { type: "error", category: categoryKey, scope: countryScope, message: `Pre-sync purge failed: ${deleteError.message}` });
    } else {
      console.log(`[sync] ${categoryKey}/${countryScope} PURGED ${deletedCount ?? 0} rows`);
      emit(controller, { type: "info", category: categoryKey, scope: countryScope, message: `Purged ${deletedCount ?? 0} existing rows for ${tableName} (region=${region})` });
    }
  }

  let totalUpserted = 0;
  let totalErrors = 0;

  if (config.mode === "broadway") {
    // Broadway uses subGenreId (not classificationName/genreId), with no
    // segment-name split. Pass it through the same self-adaptive window logic.
    const baseOpts = {
      segmentId: "KZFzniwnSyZfZ7v7na",
      stateCode: countryScope === "US" ? "NY" : undefined,
    };
    const r = await fetchWindowRecursive(
      apiKey, countryScope, supabase, tableName, categoryKey, undefined, region, controller,
      { ...baseOpts, ...initialOpts }, WINDOW_DAYS_INITIAL, 0
    );
    totalUpserted += r.upserted;
    totalErrors   += r.errors;
  } else if (config.mode === "genreIds") {
    for (const genre of config.genres) {
      emit(controller, { type: "info", category: categoryKey, scope: countryScope, message: `Fetching genre: ${genre.name}` });
      const r = await fetchWindowRecursive(
        apiKey, countryScope, supabase, tableName, categoryKey, genre.name, region, controller,
        { genreId: genre.id, segmentId: config.segmentId, ...initialOpts },
        WINDOW_DAYS_INITIAL, 0
      );
      totalUpserted += r.upserted;
      totalErrors   += r.errors;
    }
  } else {
    // classificationName (with optional segmentId + genreId for precise targeting)
    const r = await fetchWindowRecursive(
      apiKey, countryScope, supabase, tableName, categoryKey, undefined, region, controller,
      {
        classificationName: config.classificationName,
        segmentId: config.segmentId,
        segmentName: config.segmentName,
        genreId: config.genreId,
        ...initialOpts,
      },
      WINDOW_DAYS_INITIAL, 0
    );
    totalUpserted += r.upserted;
    totalErrors   += r.errors;
  }

  emit(controller, {
    type: "done",
    category: categoryKey,
    scope: countryScope,
    upserted: totalUpserted,
    errors: totalErrors,
    message: `✓ ${categoryKey} (${countryScope}) → ${totalUpserted} upserted, ${totalErrors} errors`,
  });

  return { upserted: totalUpserted, errors: totalErrors };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TICKETMASTER_API_KEY not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const { category, countryScope, mode } = body;
  const supabase = getSupabaseClient();

  if (category && countryScope) {
    const catEntry = CATEGORIES.find((c) => c.key === category);
    if (!catEntry || !catEntry.scopes.includes(countryScope)) {
      return NextResponse.json({ error: "Invalid category or scope" }, { status: 400 });
    }
    const stream = new ReadableStream({
      start(controller) {
        syncCategory(supabase, apiKey, category, countryScope, catEntry.config, controller)
          .then(() => controller.close())
          .catch((err: any) => {
            console.error("[sync] Category sync error:", err);
            emit(controller, { type: "error", message: err.message });
            controller.close();
          });
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  if (mode === "syncAll") {
    const stream = new ReadableStream({
      async start(controller) {
        const results: any[] = [];
        for (const catEntry of CATEGORIES) {
          for (const scope of catEntry.scopes) {
            try {
              const result = await syncCategory(supabase, apiKey, catEntry.key, scope, catEntry.config, controller);
              results.push({ category: catEntry.key, scope, ...result });
            } catch (err: any) {
              console.error(`[sync] Error syncing ${catEntry.key} (${scope}):`, err);
              emit(controller, { type: "error", category: catEntry.key, scope, message: err.message });
              results.push({ category: catEntry.key, scope, error: err.message });
            }
          }
        }
        const totalUpserted = results.reduce((sum, r) => sum + (r.upserted || 0), 0);
        const totalErrors   = results.reduce((sum, r) => sum + (r.errors || 0), 0);
        emit(controller, {
          type: "complete",
          results,
          totalUpserted,
          totalErrors,
          message: `All done: ${totalUpserted} upserted, ${totalErrors} errors`,
        });
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
}