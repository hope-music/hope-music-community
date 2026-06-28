import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// "Musical → Broadway" uses the dedicated Broadway mode above.

// Music genres for genreId-based categories
const MUSIC_GENRE_IDS: Array<{ id: string; name: string }> = [
  { id: "KnvZfZ7vAev", name: "Pop" },
  { id: "KnvZfZ7vAeA", name: "Rock" },
  { id: "KnvZfZ7vAv1", name: "Hip-Hop/Rap" },
  { id: "KnvZfZ7vAv6", name: "Country" },
  { id: "KnvZfZ7vAJ6", name: "Latin" },
];

type SyncConfig =
  | { mode: "classificationName"; classificationName: string; segmentId?: string; segmentName?: string }
  | { mode: "broadway" }
  | { mode: "genreIds"; genres: Array<{ id: string; name: string }>; segmentId?: string };

const CATEGORIES: Array<{ key: string; config: SyncConfig; scopes: ("US" | "International")[] }> = [
  // Musical → Arts, Theater & Comedy → Broadway (US only)
  { key: "musical",      config: { mode: "broadway" },                                                    scopes: ["US"] },
  // Opera → Arts, Theater & Comedy → Opera (US + International)
  { key: "opera",        config: { mode: "classificationName", classificationName: "Opera", segmentId: "KZFzniwnSyZfZ7v7na" }, scopes: ["US", "International"] },
  // Classical → Arts, Theater & Comedy → Classical (US + International)
  { key: "classical",    config: { mode: "classificationName", classificationName: "Classical", segmentId: "KZFzniwnSyZfZ7v7na" }, scopes: ["US", "International"] },
  // Concert → Concerts → Classical (US + International)
  // Concert uses genreId-mode (Classical under Music segment is a genre, not a classification).
  { key: "concert", config: { mode: "genreIds", genres: [{ id: "KnvZfZ7vAeJ", name: "Classical" }] }, scopes: ["US", "International"] },
  { key: "electronic",   config: { mode: "classificationName", classificationName: "Dance/Electronic" },  scopes: ["US", "International"] },
  { key: "pop",          config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Pop") },           scopes: ["US", "International"] },
  { key: "rock",         config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Rock") },          scopes: ["US", "International"] },
  { key: "hip-hop-rap",  config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Hip-Hop/Rap") },   scopes: ["US", "International"] },
  { key: "country",      config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Country") },       scopes: ["US", "International"] },
  { key: "latin",        config: { mode: "genreIds", genres: MUSIC_GENRE_IDS.filter(g => g.name === "Latin") },         scopes: ["US", "International"] },
  { key: "dance",        config: { mode: "classificationName", classificationName: "Dance" },             scopes: ["US", "International"] },
  { key: "other",        config: { mode: "classificationName", classificationName: "Variety" },          scopes: ["US", "International"] },
];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase configuration missing");
  return createClient(url, key);
}

function emit(controller: ReadableStreamDefaultController, data: unknown) {
  const chunk = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(chunk));
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry<T>(
  url: string,
  retries = 2,
  delayMs = 500
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url);
    if (response.ok) {
      return response.json();
    }
    const body = await response.text().catch(() => "");
    const detail = body ? `: ${body.slice(0, 200)}` : "";
    if (response.status === 429 || response.status === 400) {
      if (attempt < retries) {
        const wait = delayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
    }
    throw new Error(`Ticketmaster API error: ${response.status}${detail}`);
  }
  throw new Error(`Ticketmaster API error after retries`);
}

async function fetchTicketmasterEvents(
  apiKey: string,
  countryCode: string,
  classificationName: string | undefined,
  genreId: string | undefined,
  page: number = 0,
  segmentName?: string,
  segmentId?: string
) {
  const params = new URLSearchParams({
    apikey: apiKey,
    size: "200",
    page: page.toString(),
    sort: "date,asc",
  });

  if (genreId) {
    params.append("genreId", genreId);
  } else if (classificationName) {
    params.append("classificationName", classificationName);
  }

  if (segmentId) {
    params.append("segmentId", segmentId);
  } else if (segmentName) {
    params.append("segmentName", segmentName);
  }

  if (countryCode === "US") {
    params.append("countryCode", "US");
  } else {
    params.append("countryCode", "GB,AU,CA,DE,FR,IT,ES,NL,BE,AT,CH,JP,KR,MX,BR,AR");
  }

  const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;
  await sleep(250); // rate-limit protection
  return fetchWithRetry(url);
}

function pickEventFields(event: any, region: "US" | "international") {
  const start = event.dates?.start;
  const priceRanges = event.priceRanges?.[0];
  const venue = event._embedded?.venues?.[0];
  const venueCountry = venue?.country?.countryCode || null;
  const resolvedRegion: "US" | "international" =
    venueCountry === "US" ? "US" : "international";
  const classification = event.classifications?.[0];

  return {
    ticketmaster_id: event.id,
    title: event.name || "Unknown",
    event_date: start?.localDate || null,
    image_url:
      event.images?.find((img: any) => img.width >= 300)?.url ||
      event.images?.[0]?.url ||
      null,
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
  // concert_events table has no sub_category column; whitelist explicitly to
  // drop the always-null sub_category from pickEventFields before upsert.
  concert: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "segment",
    "genre",
  ],
  musical: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "sub_category",
  ],
  pop: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "sub_category",
  ],
  rock: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "sub_category",
  ],
  "hip-hop-rap": [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "sub_category",
  ],
  country: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "sub_category",
  ],
  latin: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "sub_category",
  ],
  // Legacy classification-based tables: only whitelist columns that exist.
  // Without explicit entries, applyFieldMap returns the full raw payload
  // and any column missing in the table schema will break the bulk upsert.
  classical: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "segment",
    "genre",
    "sub_category",
  ],
  electronic: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "segment",
    "genre",
    "sub_category",
  ],
  dance: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "segment",
    "genre",
    "sub_category",
  ],
  other: [
    "ticketmaster_id",
    "title",
    "event_date",
    "image_url",
    "venue",
    "city",
    "state",
    "country",
    "region",
    "price_min",
    "price_max",
    "currency",
    "ticket_url",
    "segment",
    "genre",
    "sub_category",
  ],
};

function applyFieldMap(
  raw: Record<string, unknown>,
  categoryKey: string,
  genreName?: string
): Record<string, unknown> {
  const fields = FIELD_MAPS[categoryKey];
  if (!fields) return raw;
  const result: Record<string, unknown> = { ticketmaster_id: raw.ticketmaster_id };
  for (const f of fields) {
    if (f !== "ticketmaster_id" && f in raw) {
      result[f] = raw[f];
    }
  }
  if (categoryKey === "musical") {
    result.sub_category = "Broadway";
  } else if (
    ["pop", "rock", "hip-hop-rap", "country", "latin"].includes(categoryKey) &&
    genreName
  ) {
    result.sub_category = genreName;
  }
  return result;
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
  let totalUpserted = 0;
  let totalErrors = 0;

  emit(controller, {
    type: "start",
    category: categoryKey,
    scope: countryScope,
    message: `Starting ${categoryKey} (${countryScope})…`,
  });

  // Pre-sync purge: delete all existing rows for this (table, scope) so the
  // upserted count equals exactly what Ticketmaster returned. This is the
  // only way to verify the fetch logic by comparing the displayed number
  // against TM's own website count. Scope-scoped via `region` so we never
  // touch the other scope's data.
  {
    const { count: deletedCount, error: deleteError } = await supabase
      .from(tableName)
      .delete({ count: "exact" })
      .eq("region", region);
    if (deleteError) {
      emit(controller, {
        type: "error",
        category: categoryKey,
        scope: countryScope,
        message: `Pre-sync purge failed: ${deleteError.message}`,
      });
    } else {
      emit(controller, {
        type: "info",
        category: categoryKey,
        scope: countryScope,
        message: `Purged ${deletedCount ?? 0} existing rows for ${tableName} (region=${region})`,
      });
    }
  }

  if (config.mode === "broadway") {
    for (let page = 0; page < 4; page++) {
      const params = new URLSearchParams({
        apikey: apiKey,
        size: "200",
        page: page.toString(),
        sort: "date,asc",
        segmentId: "KZFzniwnSyZfZ7v7na",
        subGenreId: "KZazBEonSMnZfZ7vAve",
      });
      if (countryScope === "US") {
        params.append("stateCode", "NY");
      } else {
        params.append("countryCode", "GB,AU,CA,DE,FR,IT,ES,NL,BE,AT,CH,JP,KR,MX,BR,AR");
      }

      await sleep(250);
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;
      let tmData: any;
      try {
        tmData = await fetchWithRetry(url);
      } catch {
        break;
      }

      if (!tmData._embedded?.events?.length) break;

      const rawEvents = tmData._embedded.events.map((e: any) =>
        pickEventFields(e, region)
      );
      const events = rawEvents.map((e) => applyFieldMap(e, categoryKey));

      const { data: upsertData, error: bulkError } = await supabase
        .from(tableName)
        .upsert(events, { onConflict: "ticketmaster_id" })
        .select("id");

      if (bulkError) {
        for (const event of events) {
          const { error } = await supabase
            .from(tableName)
            .upsert(event, { onConflict: "ticketmaster_id" });
          if (error) totalErrors++;
          else totalUpserted++;
        }
      } else {
        totalUpserted += upsertData?.length ?? events.length;
      }

      emit(controller, {
        type: "progress",
        category: categoryKey,
        scope: countryScope,
        page: page + 1,
        eventCount: events.length,
        upserted: totalUpserted,
        errors: totalErrors,
        message: `Broadway page ${page + 1}: ${events.length} fetched`,
      });

      const totalPages = tmData.page?.totalPages || 1;
      if (page >= totalPages - 1) break;
    }
  } else if (config.mode === "genreIds") {
    for (const genre of config.genres) {
      let genreUpserted = 0;
      let genreErrors = 0;

      emit(controller, {
        type: "info",
        category: categoryKey,
        scope: countryScope,
        message: `Fetching genre: ${genre.name}`,
      });

      let lastTotalPages = 1;
      for (let page = 0; page < lastTotalPages; page++) {
        const tmData = await fetchTicketmasterEvents(
          apiKey,
          countryScope === "US" ? "US" : "INTL",
          undefined,
          genre.id,
          page,
          undefined,
          config.mode === "genreIds" ? config.segmentId : undefined
        );

        const totalElements = tmData.page?.totalElements ?? 0;
        const totalPagesApi = tmData.page?.totalPages ?? 0;
        emit(controller, {
          type: "info",
          category: categoryKey,
          scope: countryScope,
          message: `${genre.name} page ${page + 1}: API says totalElements=${totalElements}, totalPages=${totalPagesApi}, returned=${tmData._embedded?.events?.length ?? 0}`,
        });

        if (!tmData._embedded?.events?.length) break;

        const rawEvents = tmData._embedded.events.map((e: any) =>
          pickEventFields(e, region)
        );
        const events = rawEvents.map((e) =>
          applyFieldMap(e, categoryKey, genre.name)
        );

        const { data: upsertData, error: bulkError } = await supabase
          .from(tableName)
          .upsert(events, { onConflict: "ticketmaster_id" })
          .select("id");

        // Track this page's deltas (not the genre running total) so the
        // grand total reflects exactly what we fetched, not a cumulative
        // sum that doubles per page.
        let pageUpserted = 0;
        let pageErrors = 0;

        if (bulkError) {
          emit(controller, {
            type: "error",
            category: categoryKey,
            scope: countryScope,
            message: `Bulk upsert failed for ${genre.name} page ${page + 1}: ${bulkError.message}`,
          });
          for (const event of events) {
            const { error } = await supabase
              .from(tableName)
              .upsert(event, { onConflict: "ticketmaster_id" });
            if (error) pageErrors++;
            else pageUpserted++;
          }
        } else {
          pageUpserted = upsertData?.length ?? events.length;
        }

        genreUpserted += pageUpserted;
        genreErrors += pageErrors;
        totalUpserted += pageUpserted;
        totalErrors += pageErrors;

        emit(controller, {
          type: "progress",
          category: categoryKey,
          scope: countryScope,
          genre: genre.name,
          page: page + 1,
          eventCount: events.length,
          upserted: pageUpserted,
          errors: pageErrors,
          message: `${genre.name} page ${page + 1}: ${events.length} fetched → ${pageUpserted} upserted`,
        });

        const totalPages = tmData.page?.totalPages || 1;
        lastTotalPages = totalPages;
      }

      emit(controller, {
        type: "info",
        category: categoryKey,
        scope: countryScope,
        message: `${genre.name}: ${genreUpserted} upserted, ${genreErrors} errors`,
      });
    }
  } else {
    let lastTotalPages = 1;
    for (let page = 0; page < lastTotalPages; page++) {
      const tmData = await fetchTicketmasterEvents(
        apiKey,
        countryScope === "US" ? "US" : "INTL",
        config.classificationName,
        undefined,
        page,
        config.segmentName,
        config.segmentId
      );

      if (!tmData._embedded?.events?.length) {
        emit(controller, {
          type: "info",
          category: categoryKey,
          scope: countryScope,
          message: `No events for ${categoryKey} (${countryScope})`,
        });
        break;
      }

      const rawEvents = tmData._embedded.events.map((e: any) =>
        pickEventFields(e, region)
      );
      const events = rawEvents.map((e) => applyFieldMap(e, categoryKey));

      const { data: upsertData, error: bulkError } = await supabase
        .from(tableName)
        .upsert(events, { onConflict: "ticketmaster_id" })
        .select("id");

      if (bulkError) {
        console.error(`[sync] Bulk upsert error for ${tableName} page ${page + 1}:`, bulkError);
        emit(controller, {
          type: "error",
          category: categoryKey,
          scope: countryScope,
          message: `Bulk upsert failed: ${bulkError.message}`,
        });
        for (const event of events) {
          const { error } = await supabase
            .from(tableName)
            .upsert(event, { onConflict: "ticketmaster_id" });
          if (error) {
            console.error(`[sync] Single upsert error for ${event.ticketmaster_id}:`, error);
            totalErrors++;
          } else {
            totalUpserted++;
          }
        }
      } else {
        totalUpserted += upsertData?.length ?? events.length;
      }

      emit(controller, {
        type: "progress",
        category: categoryKey,
        scope: countryScope,
        page: page + 1,
        eventCount: events.length,
        upserted: totalUpserted,
        errors: totalErrors,
        message: `Page ${page + 1}: ${events.length} fetched → ${upsertData?.length ?? 0} upserted (${totalErrors} errors)`,
      });

      const totalPages = tmData.page?.totalPages || 1;
      lastTotalPages = totalPages;
    }
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
    if (!catEntry) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
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
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
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
        const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
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
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
}
