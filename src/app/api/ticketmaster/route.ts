import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const CONSUMER_KEY = "G0AVxK4c8bvtFMp0pJapkWEYlyu8DtIE";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2";
const OUTPUT_FILE = path.join(process.cwd(), "public", "data", "ticketmaster-events.json");

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
  const pool = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["others"];
  const index = Math.abs(eventId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % pool.length;
  return pool[index];
}

async function fetchTm(url: string): Promise<any | null> {
  try {
    const fullUrl = `${url}${url.includes("?") ? "&" : "?"}apikey=${CONSUMER_KEY}`;
    const res = await fetch(fullUrl, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function mapEvent(event: TmEvent): PerformanceItem {
  const venue = event._embedded?.venues?.[0];
  const attraction = event._embedded?.attractions?.[0];
  const genre = attraction?.classification?.[0];

  const segmentName = genre?.segment?.name || "";
  const genreName = genre?.genre?.name || "";
  const subGenreName = genre?.subGenre?.name || "";
  const eventName = event.name.toLowerCase();
  const combined = `${genreName} ${subGenreName} ${eventName}`;

  let category = "other";

  const ticketmasterToSiteCategory: Record<string, string> = {
    // 1. Musical
    "Arts, Theater & Comedy -> Broadway": "musical",
    "Arts, Theater & Comedy -> Theater": "musical",
    
    // 2. Opera
    "Arts, Theater & Comedy -> Opera": "opera",
    
    // 3. Classical
    "Arts, Theater & Comedy -> Classical": "classical",
    "Concerts -> Classical": "classical",
    
    // 4. Music
    "Arts, Theater & Comedy -> Music": "music",
    
    // 5. Electronic
    "Concerts -> Dance/Electronic": "electronic",
    
    // 6. Pop & Rock
    "Concerts -> Alternative": "pop-rock",
    "Concerts -> Blues": "pop-rock",
    "Concerts -> Country": "pop-rock",
    "Concerts -> Folk": "pop-rock",
    "Concerts -> Hip-Hop/Rap": "pop-rock",
    "Concerts -> Jazz": "pop-rock",
    "Concerts -> Latin": "pop-rock",
    "Concerts -> Medieval/Renaissance": "pop-rock",
    "Concerts -> Metal": "pop-rock",
    "Concerts -> New Age": "pop-rock",
    "Concerts -> Other": "pop-rock",
    "Concerts -> Pop": "pop-rock",
    "Concerts -> R&B": "pop-rock",
    "Concerts -> Reggae": "pop-rock",
    "Concerts -> Religious": "pop-rock",
    "Concerts -> Rock": "pop-rock",
    "Concerts -> World": "pop-rock",
    
    // 7. Performance Art
    "Arts, Theater & Comedy -> Performance Art": "performance-art",
    "Arts, Theater & Comedy -> Variety": "performance-art",
    
    // 8. Dance
    "Arts, Theater & Comedy -> Dance": "dance",
    
    // 9. Other
    "Concerts -> Ballads/Romantic": "other",
    "Concerts -> Children's Music": "other",
    "Concerts -> Holiday": "other",
    "Arts, Theater & Comedy -> Children's Theater": "other",
    "Arts, Theater & Comedy -> Circus & Specialty Acts": "other",
    "Arts, Theater & Comedy -> Comedy": "other",
    "Arts, Theater & Comedy -> Cultural": "other",
    "Arts, Theater & Comedy -> Espectaculo": "other",
    "Arts, Theater & Comedy -> Fashion": "other",
    "Arts, Theater & Comedy -> Fine Art": "other",
    "Arts, Theater & Comedy -> Magic & Illusion": "other",
    "Arts, Theater & Comedy -> Miscellaneous": "other",
    "Arts, Theater & Comedy -> Multimedia": "other",
    "Arts, Theater & Comedy -> Puppetry": "other",
    "Arts, Theater & Comedy -> Spectacular": "other",
  };

  const tmKey = `${segmentName} -> ${genreName}`;
  const tmSubKey = `${segmentName} -> ${subGenreName}`;
  
  category = ticketmasterToSiteCategory[tmSubKey] || ticketmasterToSiteCategory[tmKey] || "other";

  const knownMusical = [
    "hamilton", "lion king", "aladdin", "phantom of", "wicked", "moulin rouge",
    "chicago", "mama mia", "mamma mia", "rent", "hadestown", "cats",
    "les mis", "lesmis", "lesmiz", "blue man group", "blue-man", "kinky boots",
    "book of mormon", "dear evan hansen", "hello dolly", "waitress",
    "beetlejuice", "mean girls", "peter pan", "frozen", "pippin",
    "little shop of horrors", "beaches", "funny girl", "funnygirl",
    "death becomes her", "sweeney todd", "sweeney", "harry potter", "hedwig",
    "rocky horror", "wizard of oz at sphere", "wizard of oz",
    "juliet", "frida", "rat pack is back", "second city", "atomic saloon",
    "the lost boys", "dog day afternoon",
  ];
  const knownOpera = [
    "opera", "la traviata", "carmen", "madama butterfly", "tosca",
    "figaro", "don giovanni", "magic flute", "ring cycle", "wagner",
  ];
  const knownClassical = [
    "max richter", "vivaldi", "bach", "mozart", "beethoven",
    "pavarotti", "andrea bocelli", "lang lang", "yuja wang",
    "anime soundtracks", "yoko kanno", "classical", "symphony",
    "orchestra", "philharmonic", "ballet",
  ];

  if (category === "other") {
    if (knownMusical.some(n => eventName.includes(n))) {
      category = "musical";
    } else if (knownOpera.some(n => eventName.includes(n))) {
      category = "opera";
    } else if (knownClassical.some(n => eventName.includes(n))) {
      category = "classical";
    }
  }

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

async function fetchAllEvents(): Promise<PerformanceItem[]> {
  const seen = new Set<string>();
  const events: PerformanceItem[] = [];
  const pageSize = 50;
  const segments = ["Music", "Arts & Theatre"];

  for (const segment of segments) {
    for (let page = 0; page < 5; page++) {
      const url = `${BASE_URL}/events.json?segmentName=${encodeURIComponent(segment)}&size=${pageSize}&page=${page}&sort=date,asc&countryCode=US`;
      const data = await fetchTm(url);
      if (!data?._embedded?.events?.length) break;

      for (const event of data._embedded.events as TmEvent[]) {
        if (!seen.has(event.id)) {
          seen.add(event.id);
          events.push(mapEvent(event));
        }
      }

      if (page >= (data.page?.totalPages || 1) - 1) break;
    }
  }

  // Extra pages without segment filter to catch remaining events
  for (let page = 0; page < 3; page++) {
    const url = `${BASE_URL}/events.json?size=${pageSize}&page=${page}&sort=date,asc&countryCode=US`;
    const data = await fetchTm(url);
    if (!data?._embedded?.events?.length) break;

    for (const event of data._embedded.events as TmEvent[]) {
      if (!seen.has(event.id)) {
        seen.add(event.id);
        events.push(mapEvent(event));
      }
    }

    if (page >= (data.page?.totalPages || 1) - 1) break;
  }

  // Sort: upcoming first, then by date
  events.sort((a, b) => {
    if (a.status === "upcoming" && b.status !== "upcoming") return -1;
    if (a.status !== "upcoming" && b.status === "upcoming") return 1;
    return (a.eventDate || "").localeCompare(b.eventDate || "");
  });

  return events;
}

export async function POST() {
  try {
    const dir = path.join(process.cwd(), "public", "data");
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    const events = await fetchAllEvents();

    const payload = {
      events,
      total: events.length,
      fetchedAt: new Date().toISOString(),
    };

    await writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      total: events.length,
      fetchedAt: payload.fetchedAt,
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
    const events = await fetchAllEvents();
    return NextResponse.json({
      success: true,
      total: events.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Fetch failed" },
      { status: 500 }
    );
  }
}
