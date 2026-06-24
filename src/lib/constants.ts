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
  "Music",
  "Electronic",
  "Pop & Rock",
  "Performance Art",
  "Dance",
  "Other",
] as const;

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Musical:         "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500",
  Opera:           "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500",
  Classical:       "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500",
  Music:           "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500",
  Electronic:      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500",
  "Pop & Rock":    "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500",
  "Performance Art": "https://images.unsplash.com/photo-1503095396549-807759245b35?w=500",
  Dance:           "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500",
  Other:           "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500",
};

export const PERFORMANCE_CATEGORY_OPTIONS = [
  { value: "musical", label: "Musical" },
  { value: "opera", label: "Opera" },
  { value: "classical", label: "Classical" },
  { value: "music", label: "Music" },
  { value: "electronic", label: "Electronic" },
  { value: "pop-rock", label: "Pop & Rock" },
  { value: "performance-art", label: "Performance Art" },
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

export const SOFTWARE_PLACEHOLDER_ITEMS = [
  { id: "isat-2023-released", title: "ISAT Interaction 2023 v1.0.4 Released" },
  { id: "optimize-latent-daw", title: "How to optimize latent settings in DAW Soundworks" },
  { id: "midi-controller-mapping", title: "MIDI controller mapping tutorial for live performance" },
  { id: "free-vst-orchestral", title: "Best free VST plugins for orchestral composition" },
  { id: "audio-latency-troubleshooting", title: "Audio interface latency troubleshooting guide" },
  { id: "multi-monitor-mixing", title: "Setting up multi-monitor workspace for mixing" },
  { id: "cloud-collab-music", title: "Cloud collaboration tools for remote music production" },
  { id: "reverb-sidechain", title: "Automating reverb sends with sidechain compression" },
  { id: "export-stems-film", title: "Exporting stems correctly for film scoring projects" },
  { id: "custom-macro-pad", title: "Building a custom macro pad for live DJ sets" },
] as const;

export const HARDWARE_PLACEHOLDER_ITEMS = [
  { id: "interface-comparison-2026", title: "Best audio interfaces of 2026 — comprehensive comparison" },
  { id: "monitor-speaker-placement", title: "Monitor speaker placement guide — acoustics for small rooms" },
  { id: "microphone-polar-patterns", title: "Understanding microphone polar patterns — when to use each type" },
  { id: "di-box-explained", title: "DI box explained: active vs passive, and when to use each" },
  { id: "cabling-basics", title: "Audio cabling basics — balanced vs unbalanced, XLR vs TRS" },
  { id: "acoustic-treatment-diy", title: "DIY acoustic treatment on a budget — panels and bass traps" },
  { id: "headphone-amplifier-pairing", title: "Headphone amplifier pairing guide — getting the most from your cans" },
  { id: "midi-keyboard-selection", title: "How to choose the right MIDI keyboard — keys, pads, knobs" },
] as const;

export const MUSIC_PLACEHOLDER_ITEMS = [
  { id: "songwriting-101", title: "Songwriting 101: Finding your unique melodic voice" },
  { id: "orchestral-arrangement-tips", title: "Orchestral arrangement tips for small ensembles" },
  { id: "understanding-modal-scales", title: "Understanding modal scales beyond major and minor" },
  { id: "music-theory-production", title: "Music theory for producers — bridging theory and practice" },
  { id: "chord-progression-creation", title: "Creating emotional chord progressions step by step" },
  { id: "rhythm-groove-fundamentals", title: "Rhythm and groove fundamentals for all genres" },
  { id: "melody-writing-techniques", title: "Melody writing techniques used by professional composers" },
  { id: "harmonic-color-extended-chords", title: "Harmonic color — using extended chords for emotional impact" },
] as const;

export const STAGE_PRODUCTION_PLACEHOLDER_ITEMS = [
  { id: "lighting-design-fundamentals", title: "Lighting design fundamentals for live stage productions" },
  { id: "sound-reinforcement-live", title: "Sound reinforcement setup for live theater and concerts" },
  { id: "stage-rigging-safety", title: "Stage rigging safety standards and best practices" },
  { id: "projection-mapping-theater", title: "Projection mapping techniques for immersive theater experiences" },
  { id: "set-design-construction", title: "Set design and construction on a limited budget" },
  { id: "av-system-integration", title: "AV system integration for multi-purpose venues" },
  { id: "backstage-communication", title: "Backstage communication protocols for smooth show flow" },
  { id: "pyrotechnics-special-effects", title: "Pyrotechnics and special effects — safety and regulations" },
] as const;

export const ARTICAL_PLACEHOLDER_ITEMS = [
  { id: "history-musical-theater", title: "The rich history of musical theater — from Broadway to global stages" },
  { id: "evolution-recording-technology", title: "The evolution of recording technology over five decades" },
  { id: "influential-composers-21st-century", title: "The 10 most influential composers of the 21st century" },
  { id: "psychoacoustics-music-perception", title: "Psychoacoustics: how the brain processes music and sound" },
  { id: "music-therapy-research", title: "Music therapy research — evidence-based practice and outcomes" },
  { id: "copyright-law-musicians", title: "Copyright law for independent musicians — protecting your work" },
  { id: "streaming-era-music-economics", title: "The streaming era — understanding music economics today" },
  { id: "ai-composition-future", title: "AI in music composition — opportunity or threat to artists?" },
] as const;

export const OTHERS_PLACEHOLDER_ITEMS = [
  { id: "community-guidelines", title: "Community guidelines — keeping our forum respectful and helpful" },
  { id: "event-calendar-community", title: "Community event calendar — upcoming meetups and online sessions" },
  { id: "introduce-yourself-thread", title: "Introduce yourself to the Hope Music Community!" },
  { id: "resources-tutorials", title: "Resources and tutorials master list — curated community collection" },
  { id: "collaboration-opportunities", title: "Collaboration opportunities — find your next creative partner" },
  { id: "gear-marketplace", title: "Gear marketplace — buy, sell, and trade with community members" },
  { id: "feedback-welcome", title: "Feedback welcome — share your thoughts on site improvements" },
  { id: "support-help-desk", title: "Support and help desk — technical issues and account questions" },
] as const;

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
