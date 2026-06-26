import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = [
  { key: "opera", classificationName: "Opera" },
  { key: "musical", classificationName: "Broadway" },
  { key: "classical", classificationName: "Classical" },
  { key: "music", classificationName: "Music" },
  { key: "dance", classificationName: "Dance" },
  { key: "electronic", classificationName: "Dance/Electronic" },
  { key: "pop-rock", classificationName: "Pop" },
  { key: "performance-art", classificationName: "Performance Art" },
  { key: "other", classificationName: "Variety" },
];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase configuration missing");
  return createClient(url, key);
}

async function ensureTable(supabase: any, tableName: string) {
  const { error } = await supabase.from(tableName).select("id").limit(1);
  if (error?.code === "42P01") {
    console.warn(`[sync] Table ${tableName} does not exist. Create it in Supabase dashboard.`);
  }
}

function emit(controller: ReadableStreamDefaultController, data: unknown) {
  const chunk = `data: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(chunk));
}

async function fetchTicketmasterEvents(
  apiKey: string,
  classificationName: string,
  countryCode: string,
  page: number = 0
) {
  const params = new URLSearchParams({
    apikey: apiKey,
    classificationName,
    size: "200",
    page: page.toString(),
    sort: "date,asc",
  });

  if (countryCode === "US") {
    params.append("countryCode", "US");
  } else {
    params.append("countryCode", "GB,AU,CA,DE,FR,IT,ES,NL,BE,AT,CH,JP,KR,MX,BR,AR");
  }

  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Ticketmaster API error: ${response.status}`);
  }

  return response.json();
}

function parseEvent(event: any, region: "US" | "international") {
  const start = event.dates?.start;
  const priceRanges = event.priceRanges?.[0];
  const venue = event._embedded?.venues?.[0];

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
    country: venue?.country?.countryCode || (region === "US" ? "US" : "Unknown"),
    region,
    price_min: priceRanges?.min || null,
    price_max: priceRanges?.max || null,
    currency: priceRanges?.currency || "USD",
    ticket_url: event.url || null,
    segment: event.classifications?.[0]?.segment?.name || null,
    genre: event.classifications?.[0]?.genre?.name || null,
  };
}

async function syncCategory(
  supabase: any,
  apiKey: string,
  categoryKey: string,
  classificationName: string,
  countryScope: "US" | "International",
  controller: ReadableStreamDefaultController
) {
  const region = countryScope === "US" ? "US" : "international";
  const tableName = `${categoryKey}_events`;
  let totalUpserted = 0;
  let totalErrors = 0;
  const maxPages = 10;

  emit(controller, {
    type: "start",
    category: categoryKey,
    scope: countryScope,
    message: `Starting ${categoryKey} (${countryScope})…`,
  });

  await ensureTable(supabase, tableName);

  for (let page = 0; page < maxPages; page++) {
    const tmData = await fetchTicketmasterEvents(
      apiKey,
      classificationName,
      countryScope === "US" ? "US" : "INTL",
      page
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

    const events = tmData._embedded.events.map((e: any) =>
      parseEvent(e, region)
    );

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
        message: `Upsert failed: ${bulkError.message}`,
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
    if (page >= totalPages - 1) break;
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
    const catConfig = CATEGORIES.find((c) => c.key === category);
    if (!catConfig) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const stream = new ReadableStream({
      start(controller) {
        syncCategory(supabase, apiKey, category, catConfig.classificationName, countryScope, controller)
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
        for (const cat of CATEGORIES) {
          for (const scope of ["US", "International"] as const) {
            try {
              const result = await syncCategory(supabase, apiKey, cat.key, cat.classificationName, scope, controller);
              results.push({ category: cat.key, scope, ...result });
            } catch (err: any) {
              console.error(`[sync] Error syncing ${cat.key} (${scope}):`, err);
              emit(controller, { type: "error", category: cat.key, scope, message: err.message });
              results.push({ category: cat.key, scope, error: err.message });
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
