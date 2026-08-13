export const SITE_NAME = "HOPE MUSIC COMMUNITY";
export const SITE_TAGLINE = "BECAUSE YOU LOVE MUSIC";

export const MAIN_NAV_LINKS = [
  { label: "PERFORMANCE", href: "/performance", variant: "default" as const },
  { label: "INTERACTION", href: "/interaction", variant: "default" as const },
  { label: "HOPE STUDIO", href: "/hope-studio", variant: "hope-studio" as const },
  { label: "INSIGHTS", href: "/insights", variant: "default" as const },
  { label: "NEWS", href: "/news", variant: "default" as const, external: true as const },
  { label: "COMMUNITY", href: "/", variant: "default" as const },
] as const;

export const COMMUNITY_TICKER_MESSAGE =
  "Welcome to our music community — discover performances, collaborations, and creative resources.";

export const PERFORMANCE_CATEGORIES = [
  "Musical",
  "Opera",
  "Classical",
  "Concert",
  "Electronic",
  "Pop",
  "Rock",
  "Hip-Hop/Rap",
  "Country",
  "Latin",
  "Dance",
  "Other",
] as const;

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Musical:         "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500",
  Opera:           "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500",
  Classical:       "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500",
  Concert:         "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500",
  Electronic:      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
  Pop:             "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500",
  Rock:            "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500",
  "Hip-Hop/Rap":   "https://images.unsplash.com/photo-1571266028243-d220c6a01777?w=500",
  Country:         "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500",
  Latin:           "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=500",
  Dance:           "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500",
  Other:           "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500",
};

export const PERFORMANCE_CATEGORY_OPTIONS = [
  { value: "musical", label: "Musical" },
  { value: "opera", label: "Opera" },
  { value: "classical", label: "Classical" },
  { value: "concert", label: "Concert" },
  { value: "electronic", label: "Electronic" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hip-hop-rap", label: "Hip-Hop/Rap" },
  { value: "country", label: "Country" },
  { value: "latin", label: "Latin" },
  { value: "dance", label: "Dance" },
  { value: "other", label: "Other" },
] as const;

export const STAGE_PRODUCTION_CATEGORY_OPTIONS = [
  { value: "stage", label: "Stage" },
  { value: "video", label: "Video" },
  { value: "lighting", label: "Lighting" },
  { value: "audio", label: "Audio" },
  { value: "effects", label: "Effects" },
  { value: "costumes", label: "Costumes" },
  { value: "props", label: "Props" },
  { value: "makeup", label: "Makeup" },
  { value: "others", label: "Others" },
] as const;

export const STAGE_PRODUCTION_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  STAGE_PRODUCTION_CATEGORY_OPTIONS.map(({ value, label }) => [value, label])
);

export const PERFORMANCE_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  PERFORMANCE_CATEGORY_OPTIONS.map(({ value, label }) => [value, label])
);

export const PERFORMANCE_CATEGORY_SLUG_MAP: Record<string, string> = Object.fromEntries(
  PERFORMANCE_CATEGORY_OPTIONS.map(({ value, label }) => [label, value])
);

export const INTERACTION_CATEGORY_OPTIONS = [
  { value: "live-performance", label: "Live Performance" },
  { value: "dj-edm", label: "DJ & EDM" },
  { value: "ambient-music", label: "Ambient Music" },
  { value: "pop-rock", label: "Pop & Rock" },
  { value: "classical", label: "Classical" },
  { value: "film-music", label: "Film Music" },
  { value: "fusion-music", label: "Fusion Music" },
  { value: "music-production", label: "Music Production" },
  { value: "others", label: "Others" },
] as const;

export const INTERACTION_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  INTERACTION_CATEGORY_OPTIONS.map(({ value, label }) => [value, label])
);

export const LEGACY_INTERACTION_CATEGORY_MAP: Record<string, string> = {
  software: "music-production",
  hardware: "music-production",
  music: "music-production",
  production: "music-production",
  article: "music-production",
  resources: "music-production",
  artical: "music-production",
  other: "others",
  others: "others",
};

export const INTERACTION_CATEGORIES = [
  "Live Performance",
  "DJ & EDM",
  "Ambient Music",
  "Pop & Rock",
  "Classical",
  "Film Music",
  "Fusion Music",
  "Music Production",
  "Others",
] as const;

export const PLACEHOLDER_ARTICLE = {
  title:
    "Celebrate Teacher Appreciation Week by Announcing New Back to School Campaign",
  date: "May 15, 2026",
} as const;

export const CTA_COPY =
  "Fusing diverse musical genres with immersive audio and visuals, the innovative Shangri-La sits at the cutting edge of modern musical theater.";

// ── City groups (shared between frontend and admin) ────────────────────────────
export const GLOBAL_CITY_GROUPS = [
  {
    label: "North America",
    cities: [
      "Atlanta", "Boston", "Chicago", "Dallas", "Denver", "Detroit",
      "Houston", "Las Vegas", "Los Angeles", "Mexico City", "Miami",
      "Minneapolis", "Montreal", "Nashville", "New York", "Philadelphia",
      "San Francisco", "Seattle", "Toronto", "Vancouver", "Washington",
    ],
  },
  {
    label: "Europe",
    cities: [
      "Amsterdam", "Athens", "Barcelona", "Berlin", "Brussels", "Budapest",
      "Copenhagen", "Dublin", "Edinburgh", "Frankfurt", "Geneva",
      "Istanbul", "Lisbon", "London", "Madrid", "Milan", "Munich",
      "Paris", "Prague", "Rome", "Stockholm", "Vienna", "Warsaw", "Zurich",
    ],
  },
  {
    label: "Asia",
    cities: [
      "Bangkok", "Beijing", "Delhi", "Dubai", "Hong Kong", "Jakarta",
      "Kuala Lumpur", "Manila", "Mumbai", "Osaka", "Seoul",
      "Shanghai", "Singapore", "Taipei", "Tokyo",
    ],
  },
  {
    label: "Oceania",
    cities: ["Brisbane", "Melbourne", "Sydney"],
  },
  {
    label: "South America",
    cities: ["Bogota", "Buenos Aires", "Rio de Janeiro", "Santiago", "Sao Paulo"],
  },
  {
    label: "Africa",
    cities: ["Cairo", "Cape Town", "Johannesburg"],
  },
] as const;
