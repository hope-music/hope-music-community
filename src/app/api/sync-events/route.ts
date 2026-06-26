import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const CATEGORIES = [
  { key: "opera", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Opera" },
  { key: "musical", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Broadway" },
  { key: "classical", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Classical" },
  { key: "music", segmentId: "KZFzniwnSyZfZ7v7nE", classificationName: "Music" },
  { key: "dance", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Dance" },
  { key: "electronic", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Dance/Electronic" },
  { key: "pop-rock", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Pop" },
  { key: "performance-art", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Performance Art" },
  { key: "other", segmentId: "KZFzniwnSyZfZ7v7nJ", classificationName: "Variety" },
];

const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase configuration missing");
  return createClient(url, key);
};

const getTableName = (category: string) => `${category}_events`;

async function fetchTicketmasterEvents(
  classificationName: string,
  countryCode: string,
  page: number = 0
) {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) throw new Error("TICKETMASTER_API_KEY not configured");

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

function parseEvent(event: any, category: string, region: "US" | "international"): any {
  const start = event.dates?.start;
  const priceRanges = event.priceRanges?.[0];
  const venue = event._embedded?.venues?.[0];

  return {
    ticketmaster_id: event.id,
    title: event.name || "Unknown",
    event_date: start?.localDate || null,
    event_time: start?.localTime || null,
    image_url: event.images?.find((img: any) => img.width >= 300)?.url || event.images?.[0]?.url || null,
    venue: venue?.name || null,
    city: venue?.city?.name || null,
    state: venue?.state?.stateCode || venue?.state?.name || null,
    country: venue?.country?.countryCode || (region === "US" ? "US" : "Unknown"),
    region: region,
    price_min: priceRanges?.min || null,
    price_max: priceRanges?.max || null,
    currency: priceRanges?.currency || "USD",
    ticket_url: event.url || null,
    category: category,
  };
}

async function syncCategory(
  supabase: any,
  categoryKey: string,
  classificationName: string,
  countryScope: "US" | "International",
  onProgress?: (msg: string) => void
) {
  const region = countryScope === "US" ? "US" : "international";
  const tableName = getTableName(categoryKey);
  let totalUpserted = 0;
  let totalErrors = 0;
  const maxPages = 10;

  onProgress?.(`Starting ${categoryKey} (${countryScope})...`);

  for (let page = 0; page < maxPages; page++) {
    try {
      onProgress?.(`Fetching ${categoryKey} page ${page + 1}...`);
      const data = await fetchTicketmasterEvents(classificationName, countryScope === "US" ? "US" : "INTL", page);

      if (!data._embedded?.events?.length) {
        onProgress?.(`No more events for ${categoryKey} (${countryScope})`);
        break;
      }

      const events = data._embedded.events.map((e: any) => parseEvent(e, categoryKey, region));

      for (const event of events) {
        try {
          const { error } = await supabase
            .from(tableName)
            .upsert(
              { ...event, category: categoryKey },
              { onConflict: "ticketmaster_id" }
            );

          if (error) {
            console.error(`Error upserting ${event.ticketmaster_id}:`, error);
            totalErrors++;
          } else {
            totalUpserted++;
          }
        } catch (err) {
          totalErrors++;
        }
      }

      const totalPages = data.page?.totalPages || 1;
      if (page >= totalPages - 1) break;
    } catch (err: any) {
      onProgress?.(`Error on page ${page + 1}: ${err.message}`);
      totalErrors++;
    }
  }

  return { upserted: totalUpserted, errors: totalErrors };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, countryScope, mode } = body;

    if (mode === "syncAll") {
      const results = [];
      for (const cat of CATEGORIES) {
        for (const scope of ["US", "International"] as const) {
          try {
            const supabase = getSupabaseClient();
            const result = await syncCategory(supabase, cat.key, cat.classificationName, scope);
            results.push({ category: cat.key, scope, ...result });
          } catch (err: any) {
            results.push({ category: cat.key, scope, error: err.message });
          }
        }
      }
      return NextResponse.json({ success: true, results });
    }

    if (!category || !countryScope) {
      return NextResponse.json({ error: "Missing category or countryScope" }, { status: 400 });
    }

    const catConfig = CATEGORIES.find((c) => c.key === category);
    if (!catConfig) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const result = await syncCategory(supabase, category, catConfig.classificationName, countryScope);

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
