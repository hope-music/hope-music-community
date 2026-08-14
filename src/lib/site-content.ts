/**
 * Site content indexer
 *
 * Aggregates ALL static / hardcoded / localStorage-backed text on the
 * site into a single searchable stream. Used by /search so that users
 * can find content that lives in component defaults (Hope Studio
 * sections, placeholder posts, demo content, navigation labels, footer
 * text, avatar labels) in addition to the Supabase / dynamic
 * localStorage data.
 */

import { INTERACTION_CATEGORY_LABELS } from "@/lib/constants";

// ─── Types shared with SearchPageClient ──────────────────────────────────────

interface BaseHit {
  type: string;
  id: string;
  title?: string;
  description?: string;
  url: string;
}

export interface StaticSectionHit extends BaseHit {
  type: "site_section";
  title: string;
  description: string;
  url: string;
  group: string;
}

export interface StaticPlaceholderHit extends BaseHit {
  type: "placeholder_post";
  title: string;
  description: string;
  url: string;
  category: string;
}

export interface SiteNavHit extends BaseHit {
  type: "site_nav";
  title: string;
  description: string;
  url: string;
}

export type SiteHit = StaticSectionHit | StaticPlaceholderHit | SiteNavHit;

// ─── Hardcoded site sections (Hope Studio + Welcome + Cooperation) ────────────

const HOPE_STUDIO_SECTIONS: Array<{ id: string; title: string; description: string; url: string; group: string; html?: string }> = [
  {
    id: "hope-studio",
    title: "Hope Studio",
    description:
      "Hope Studio is an entertainment studio specializing in musical performance, pioneering forms of tourism entertainment, and multimedia production. Founded by Jesse Liu, our innovative sound blends traditional orchestral music with modern electronic music, creating immersive musical experiences.",
    url: "/hope-studio",
    group: "Hope Studio",
  },
  {
    id: "hope-studio/welcome",
    title: "Welcome to Hope Music Community",
    description:
      "Hope Music Community is home to music lovers from every corner of the world. You don't need to be a prodigy or pay for lessons. All you need is a dream — start here, where the music dreams of ordinary people come alive, simply because you love music.",
    url: "/hope-studio/welcome",
    group: "Hope Studio",
  },
  {
    id: "hope-studio/studio",
    title: "Hope Studio — Music dream we create!",
    description:
      "Hope Studio is an entertainment studio specializing in musical performance, innovative tourism entertainment, and multimedia production. Shangri-La, a musical produced by Hope Studio, is set to be a landmark work in the genre, blending traditional orchestral music with modern electronic music. AI-powered VR visuals deliver a breathtaking feast for the eyes.",
    url: "/hope-studio/studio",
    group: "Hope Studio",
  },
  {
    id: "hope-studio/jesse-liu",
    title: "Jesse Liu — Vocalist, Composer, Music Producer & AI Musician",
    description:
      "As one of the most revered music artists of our time, Jesse Liu is a crossover musician reshaping the industry through his masterful fusion of symphonic grandeur and electronic fashion. AI represents a landmark achievement in modern technology, and Jesse Liu harnesses AI as a creative tool, broadening his channels for musical inspiration and elevating the efficiency of his production process.",
    url: "/hope-studio/jesse-liu",
    group: "Hope Studio",
  },
  {
    id: "hope-studio/shangri-la",
    title: "Shangri-La — Musical",
    description:
      "The musical Shangri-La is a proof of concept that people from various walks of life can come together to build meaningful friendships. The vision behind Cultural Fusion events has always centred on uniting people through the shared joy of song and dance. In the musical, audiences are treated not only to beautiful music and stunning visuals, but also to a profound exploration of love. It is a touching story that showcases love's remarkable power to transcend time and space.",
    url: "/hope-studio/shangri-la",
    group: "Hope Studio",
  },
  {
    id: "hope-studio/works",
    title: "Cooperation — Join Our Creative Team",
    description:
      "Production is officially underway for the musical Shangri-La! We warmly welcome talented singers, instrumentalists, and dancers from all over the world to join our creative team. Whether you represent an agency, performance group, theater, or other organization — or are an individual artist — we would love to explore a partnership with you.",
    url: "/hope-studio/works",
    group: "Hope Studio",
  },
  {
    id: "shangri-la-team-daisy",
    title: "Daisy Li — Book and Lyrics by",
    description:
      "Daisy Li is a masterful storyteller. She conceived the story within a fictional musical kingdom called Shangri-La, transporting its setting to the future to give full expression to the grandeur of its electronic soundscape. The result is an epic space journey to rescue the music kingdom. At the heart of the story lies Daisy Li's inspired invention: the \"Music Seeds,\" whose transformation drives the entire arc of the plot.",
    url: "/hope-studio/shangri-la",
    group: "Hope Studio Team",
  },
  {
    id: "shangri-la-team-jesse",
    title: "Jesse Liu — Music and Lyrics by",
    description:
      "Music and Lyrics by Jesse Liu. Crossover musician reshaping the industry through his masterful fusion of symphonic grandeur and electronic fashion.",
    url: "/hope-studio/jesse-liu",
    group: "Hope Studio Team",
  },
  {
    id: "jesse-liu-works-reshape",
    title: "RESHAPE: Music Industry Needs",
    description:
      "RESHAPE: Music Industry Needs — a visionary perspective on the future of the music industry by Jesse Liu. A book that explores how AI is reshaping the music business.",
    url: "/hope-studio/jesse-liu",
    group: "Hope Studio Works",
  },
  {
    id: "jesse-liu-works-shangri-la",
    title: "Shangri-La Musical by Jesse Liu",
    description:
      "Shangri-La Musical by Jesse Liu — an immersive musical experience blending symphonic grandeur with electronic fashion. Music and Lyrics by Jesse Liu, Book and Lyrics by Daisy Li.",
    url: "/hope-studio/shangri-la",
    group: "Hope Studio Works",
  },
];

const HOME_BANNER: StaticSectionHit = {
  type: "site_section",
  id: "home-cta-banner",
  title: "Shangri-La — Featured Banner",
  description:
    "Fusing diverse musical genres with immersive audio and visuals, the innovative Shangri-La sits at the cutting edge of modern musical theater.",
  url: "/hope-studio/shangri-la",
  group: "Home",
};

const FOOTER_HIT: StaticSectionHit = {
  type: "site_section",
  id: "site-footer",
  title: "Hope Music Community — Contact & Copyright",
  description:
    "Contact Email: hope_music@outlook.com. Copyright © 2026 Hope Music Community. All rights reserved.",
  url: "/",
  group: "Site",
};

// ─── Nav / category labels (from constants + InteractionSection) ─────────────

const NAV_HITS: SiteNavHit[] = [
  { type: "site_nav", id: "nav-performance",   title: "Performance",     description: "Browse upcoming performance events across all genres: Musical, Opera, Classical, Concert, Electronic, Pop, Rock, Hip-Hop/Rap, Country, Latin, Dance, and more.", url: "/performance" },
  { type: "site_nav", id: "nav-interaction",   title: "Interaction",     description: "Join the community — discussion categories: Live Performance, DJ & EDM, Ambient Music, Pop & Rock, Classical, Film Music, Fusion Music, Music Production, Others.", url: "/interaction" },
  { type: "site_nav", id: "nav-hope-studio",   title: "Hope Studio",     description: "Discover Hope Studio's musical productions, including the Shangri-La musical, and learn about founder Jesse Liu.", url: "/hope-studio" },
  { type: "site_nav", id: "nav-insights",      title: "Insights",        description: "Industry insights, trends, and analysis across musical genres, music production, and the music business.", url: "/insights" },
  { type: "site_nav", id: "nav-news",          title: "News",            description: "Latest news, press releases, and updates from the Hope Music Community.", url: "/news" },
  { type: "site_nav", id: "nav-community",     title: "Community",       description: "Welcome to our music community — discover performances, collaborations, and creative resources.", url: "/" },
];

// ─── Placeholder post titles from constants.ts (used in home + interaction) ───

const PLACEHOLDER_POSTS_BY_CATEGORY: Array<{ category: string; title: string; id: string }> = [
  // Software
  { category: "music-production", id: "ph-soft-1",  title: "ISAT Interaction 2023 v1.0.4 Released" },
  { category: "music-production", id: "ph-soft-2",  title: "How to optimize latent settings in DAW Soundworks" },
  { category: "music-production", id: "ph-soft-3",  title: "MIDI controller mapping tutorial for live performance" },
  { category: "music-production", id: "ph-soft-4",  title: "Best free VST plugins for orchestral composition" },
  { category: "music-production", id: "ph-soft-5",  title: "Audio interface latency troubleshooting guide" },
  { category: "music-production", id: "ph-soft-6",  title: "Setting up multi-monitor workspace for mixing" },
  { category: "music-production", id: "ph-soft-7",  title: "Cloud collaboration tools for remote music production" },
  { category: "music-production", id: "ph-soft-8",  title: "Automating reverb sends with sidechain compression" },
  { category: "music-production", id: "ph-soft-9",  title: "Exporting stems correctly for film scoring projects" },
  { category: "music-production", id: "ph-soft-10", title: "Building a custom macro pad for live DJ sets" },
  // Hardware
  { category: "music-production", id: "ph-hard-1",  title: "Best audio interfaces of 2026 — comprehensive comparison" },
  { category: "music-production", id: "ph-hard-2",  title: "Monitor speaker placement guide — acoustics for small rooms" },
  { category: "music-production", id: "ph-hard-3",  title: "Understanding microphone polar patterns" },
  { category: "music-production", id: "ph-hard-4",  title: "DI box explained: active vs passive" },
  { category: "music-production", id: "ph-hard-5",  title: "Audio cabling basics — balanced vs unbalanced" },
  { category: "music-production", id: "ph-hard-6",  title: "DIY acoustic treatment on a budget" },
  { category: "music-production", id: "ph-hard-7",  title: "Headphone amplifier pairing guide" },
  { category: "music-production", id: "ph-hard-8",  title: "How to choose the right MIDI keyboard" },
  { category: "music-production", id: "ph-hard-9",  title: "Studio furniture and desk setup essentials" },
  { category: "music-production", id: "ph-hard-10", title: "Power conditioning and surge protection guide" },
  // Music
  { category: "music-production", id: "ph-music-1",  title: "Songwriting 101: Finding your unique melodic voice" },
  { category: "music-production", id: "ph-music-2",  title: "Orchestral arrangement tips for small ensembles" },
  { category: "music-production", id: "ph-music-3",  title: "Understanding modal scales beyond major and minor" },
  { category: "music-production", id: "ph-music-4",  title: "Music theory for producers" },
  { category: "music-production", id: "ph-music-5",  title: "Creating emotional chord progressions" },
  { category: "music-production", id: "ph-music-6",  title: "Rhythm and groove fundamentals" },
  { category: "music-production", id: "ph-music-7",  title: "Melody writing techniques" },
  { category: "music-production", id: "ph-music-8",  title: "Harmonic color — using extended chords" },
  { category: "music-production", id: "ph-music-9",  title: "Arranging for different ensembles" },
  { category: "music-production", id: "ph-music-10", title: "Music production workflow optimization" },
  // Production
  { category: "music-production", id: "ph-prod-1",  title: "Lighting design fundamentals for live stage" },
  { category: "music-production", id: "ph-prod-2",  title: "Sound reinforcement setup for live theater" },
  { category: "music-production", id: "ph-prod-3",  title: "Stage rigging safety standards" },
  { category: "music-production", id: "ph-prod-4",  title: "Projection mapping techniques" },
  { category: "music-production", id: "ph-prod-5",  title: "Set design and construction on a budget" },
  { category: "music-production", id: "ph-prod-6",  title: "AV system integration for venues" },
  { category: "music-production", id: "ph-prod-7",  title: "Backstage communication protocols" },
  { category: "music-production", id: "ph-prod-8",  title: "Pyrotechnics and special effects safety" },
  { category: "music-production", id: "ph-prod-9",  title: "Live mixing techniques for bands" },
  { category: "music-production", id: "ph-prod-10", title: "Stage management best practices" },
  // Article
  { category: "music-production", id: "ph-art-1",  title: "The rich history of musical theater" },
  { category: "music-production", id: "ph-art-2",  title: "The evolution of recording technology" },
  { category: "music-production", id: "ph-art-3",  title: "The 10 most influential composers of the 21st century" },
  { category: "music-production", id: "ph-art-4",  title: "Psychoacoustics: how the brain processes music" },
  { category: "music-production", id: "ph-art-5",  title: "Music therapy research — evidence-based practice" },
  { category: "music-production", id: "ph-art-6",  title: "Copyright law for independent musicians" },
  { category: "music-production", id: "ph-art-7",  title: "The streaming era — understanding music economics" },
  { category: "music-production", id: "ph-art-8",  title: "AI in music composition" },
  { category: "music-production", id: "ph-art-9",  title: "The future of live music performances" },
  { category: "music-production", id: "ph-art-10", title: "Music education trends and innovations" },
  // Others
  { category: "others", id: "ph-oth-1",  title: "Community guidelines — keeping our forum respectful" },
  { category: "others", id: "ph-oth-2",  title: "Community event calendar — meetups and sessions" },
  { category: "others", id: "ph-oth-3",  title: "Introduce yourself to the Hope Music Community!" },
  { category: "others", id: "ph-oth-4",  title: "Resources and tutorials master list" },
  { category: "others", id: "ph-oth-5",  title: "Collaboration opportunities" },
  { category: "others", id: "ph-oth-6",  title: "Gear marketplace — buy, sell, and trade" },
  { category: "others", id: "ph-oth-7",  title: "Feedback welcome — share your thoughts" },
  { category: "others", id: "ph-oth-8",  title: "Support and help desk" },
  { category: "others", id: "ph-oth-9",  title: "Weekly listening sessions schedule" },
  { category: "others", id: "ph-oth-10", title: "Feature requests and suggestions board" },
];

// ─── InteractionSection category prompts (footer copy per category) ────────────

const INTERACTION_PROMPTS: Array<{ id: string; category: string; title: string; description: string }> = [
  { id: "prompt-live-performance", category: "live-performance", title: "Live Performance", description: "For anything about live performance. Please post your information here." },
  { id: "prompt-dj-edm",            category: "dj-edm",            title: "DJ & EDM",          description: "For anything about DJ and EDM. Please post your information here." },
  { id: "prompt-ambient-music",     category: "ambient-music",     title: "Ambient Music",     description: "For anything about ambient and atmospheric music. Please post your information here." },
  { id: "prompt-pop-rock",          category: "pop-rock",          title: "Pop & Rock",        description: "For anything about pop and rock music. Please post your information here." },
  { id: "prompt-classical",         category: "classical",         title: "Classical",         description: "For anything about classical (musical, opera, concert, and ballet, etc). Please post your information here." },
  { id: "prompt-film-music",        category: "film-music",        title: "Film Music",        description: "For anything about film scores and soundtracks. Please post your information here." },
  { id: "prompt-fusion-music",      category: "fusion-music",      title: "Fusion Music",      description: "For anything about contemporary fusion (orchestral & electronic). Please post your information here." },
  { id: "prompt-music-production",  category: "music-production",  title: "Music Production",  description: "For anything about audio production and technology. Please post your information here." },
  { id: "prompt-others",            category: "others",            title: "Others",            description: "If there is no suitable category above, please post your information here." },
];

// ─── Demo post HTML content (used on /interaction/[category]/[id] for ph-soft-N) ─

const DEMO_POSTS: Array<{ id: string; title: string; category: string; description: string }> = [
  {
    id: "ph-soft-1",
    title: "ISAT Interaction 2023 v1.0.4 Released",
    category: "music-production",
    description:
      "ISAT Interaction 2023 v1.0.4 release notes. New timeline visualization with improved performance, enhanced MIDI learn functionality, support for the latest audio interface protocols, bug fixes and stability improvements. Download the update from our website.",
  },
  {
    id: "ph-soft-2",
    title: "How to optimize latent settings in DAW Soundworks",
    category: "music-production",
    description:
      "A comprehensive guide to reducing latency in DAW Soundworks. Lower buffer sizes reduce latency but increase CPU usage. Use ASIO drivers for Windows, Core Audio for Mac. Enable direct monitoring when possible. Freeze or bounce tracks with heavy plugins.",
  },
];

// ─── Default comments shown when a forum post has no real comments ────────────

const DEFAULT_COMMENTS = [
  { id: "demo-comment-1", author: "Sarah Johnson", content: "Great post! This is exactly what I was looking for." },
  { id: "demo-comment-2", author: "Mike Chen",      content: "I agree! Very helpful information." },
  { id: "demo-comment-3", author: "Emily Davis",    content: "Thanks for sharing this! Really appreciate it." },
  { id: "demo-comment-4", author: "Alex Thompson",  content: "This is interesting. Looking forward to more posts like this." },
];

// ─── Avatar labels (CHARACTER_AVATARS + INSTRUMENT_AVATARS) ───────────────────

const AVATAR_HITS: SiteNavHit[] = [
  { type: "site_nav", id: "avatar-violet",         title: "Violet (Avatar)",           description: "Profile avatar — character with violet theme.", url: "/" },
  { type: "site_nav", id: "avatar-blue-headphones",title: "Blue Headphones (Avatar)",  description: "Profile avatar — character with blue headphones.", url: "/" },
  { type: "site_nav", id: "avatar-red-bandanna",   title: "Red Bandanna (Avatar)",     description: "Profile avatar — character with red bandanna.", url: "/" },
  { type: "site_nav", id: "avatar-grey-hair",      title: "Grey Hair (Avatar)",        description: "Profile avatar — character with grey hair.", url: "/" },
  { type: "site_nav", id: "avatar-silver-curly",   title: "Silver Curly (Avatar)",     description: "Profile avatar — character with silver curly hair.", url: "/" },
  { type: "site_nav", id: "avatar-purple-beanie",  title: "Purple Beanie (Avatar)",    description: "Profile avatar — character with purple beanie.", url: "/" },
  { type: "site_nav", id: "avatar-green-hat",      title: "Green Hat (Avatar)",        description: "Profile avatar — character with green hat.", url: "/" },
  { type: "site_nav", id: "avatar-yellow-theme",   title: "Yellow Theme (Avatar)",     description: "Profile avatar — character with yellow theme.", url: "/" },
  { type: "site_nav", id: "avatar-dark-levi",      title: "Dark Levi (Avatar)",        description: "Profile avatar — character with dark Levi theme.", url: "/" },
  { type: "site_nav", id: "avatar-orange-kid",     title: "Orange Kid (Avatar)",       description: "Profile avatar — orange kid character.", url: "/" },
  { type: "site_nav", id: "avatar-acoustic-guitar",title: "Acoustic Guitar (Avatar)",  description: "Profile avatar — acoustic guitar instrument.", url: "/" },
  { type: "site_nav", id: "avatar-piano-keys",     title: "Piano Keys (Avatar)",       description: "Profile avatar — piano keys instrument.", url: "/" },
  { type: "site_nav", id: "avatar-drum-kit",       title: "Drum Kit (Avatar)",         description: "Profile avatar — drum kit instrument.", url: "/" },
  { type: "site_nav", id: "avatar-dynamic-mic",    title: "Dynamic Microphone (Avatar)",description: "Profile avatar — dynamic microphone instrument.", url: "/" },
];

// ─── localStorage-backed content (overrides defaults if present) ──────────────

interface HopeStudioItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  content?: string;
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function readLocalSectionOverrides(): StaticSectionHit[] {
  const out: StaticSectionHit[] = [];

  // Welcome
  const welcome = readJson<{ heroTitle?: string; heroSubtitle?: string; introText1?: string; introText2?: string; songTitle?: string; songLyricsText?: string }>("welcome_content");
  if (welcome) {
    out.push({
      type: "site_section",
      id: "hope-studio/welcome-local",
      title: welcome.heroTitle || "Welcome to Hope Music Community",
      description: [welcome.heroSubtitle, welcome.introText1, welcome.introText2, welcome.songLyricsText].filter(Boolean).join(" "),
      url: "/hope-studio/welcome",
      group: "Hope Studio",
    });
  }

  // Studio
  const studio = readJson<{ subtitle?: string; introText?: string; musicalShowsContent?: string; multimediaContent?: string }>("studio_content");
  if (studio) {
    out.push({
      type: "site_section",
      id: "hope-studio/studio-local",
      title: "Hope Studio",
      description: [studio.subtitle, studio.introText, studio.musicalShowsContent, studio.multimediaContent].filter(Boolean).join(" "),
      url: "/hope-studio/studio",
      group: "Hope Studio",
    });
  }

  // Jesse Liu
  const jesse = readJson<{ subtitle?: string; introText?: string; quoteText?: string }>("jesse_liu_content");
  if (jesse) {
    out.push({
      type: "site_section",
      id: "hope-studio/jesse-liu-local",
      title: "Jesse Liu",
      description: [jesse.subtitle, jesse.introText, jesse.quoteText].filter(Boolean).join(" "),
      url: "/hope-studio/jesse-liu",
      group: "Hope Studio",
    });
  }

  // Shangri-La
  const shangri = readJson<{ introText1?: string; introText2?: string }>("shangri_la_content");
  if (shangri) {
    out.push({
      type: "site_section",
      id: "hope-studio/shangri-la-local",
      title: "Shangri-La",
      description: [shangri.introText1, shangri.introText2].filter(Boolean).join(" "),
      url: "/hope-studio/shangri-la",
      group: "Hope Studio",
    });
  }

  // Cooperation
  const cooperation = readJson<{ heroTitle?: string; introText1?: string; introText2?: string }>("cooperation_content");
  if (cooperation) {
    out.push({
      type: "site_section",
      id: "hope-studio/works-local",
      title: cooperation.heroTitle || "Join Our Creative Team",
      description: [cooperation.introText1, cooperation.introText2].filter(Boolean).join(" "),
      url: "/hope-studio/works",
      group: "Hope Studio",
    });
  }

  // Admin-edited Hope Studio items
  const hsItems = readJson<HopeStudioItem[]>("hope_studio_content");
  if (Array.isArray(hsItems)) {
    for (const item of hsItems) {
      if (!item?.id || item.id === "schedule") continue;
      const desc = (item.description || item.content || "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      out.push({
        type: "site_section",
        id: `hope-studio/${item.id}-admin`,
        title: item.title || item.id,
        description: desc || item.title || "",
        url: `/hope-studio/${item.id}`,
        group: "Hope Studio",
      });
    }
  }

  return out;
}

// ─── Filter / search logic ────────────────────────────────────────────────────

function normalize(s: unknown): string {
  return (s == null ? "" : String(s)).toLowerCase();
}

function matches(hit: { title?: string; description?: string }, q: string): boolean {
  return normalize(hit.title).includes(q) || normalize(hit.description).includes(q);
}

/**
 * Returns all static / hardcoded / localStorage site content that
 * matches the query (case-insensitive substring match on title +
 * description).
 */
export function buildStaticSiteContent(query: string): SiteHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SiteHit[] = [];

  // 1. Hope Studio + welcome + cooperation + team + works sections
  for (const s of HOPE_STUDIO_SECTIONS) {
    if (matches({ title: s.title, description: s.description }, q)) {
      hits.push({
        type: "site_section",
        id: s.id,
        title: s.title,
        description: s.description,
        url: s.url,
        group: s.group,
      });
    }
  }

  // 2. Home CTA banner
  if (matches(HOME_BANNER, q)) hits.push(HOME_BANNER);

  // 3. Footer
  if (matches(FOOTER_HIT, q)) hits.push(FOOTER_HIT);

  // 4. Nav / category labels
  for (const n of NAV_HITS) {
    if (matches(n, q)) hits.push(n);
  }

  // 5. Avatar labels
  for (const a of AVATAR_HITS) {
    if (matches(a, q)) hits.push(a);
  }

  // 6. InteractionSection category prompts (footer copy)
  for (const p of INTERACTION_PROMPTS) {
    if (matches({ title: p.title, description: p.description }, q)) {
      hits.push({
        type: "site_section",
        id: p.id,
        title: p.title,
        description: p.description,
        url: `/interaction/${p.category}`,
        group: "Community",
      });
    }
  }

  // 7. Placeholder post titles (60 hardcoded titles)
  for (const p of PLACEHOLDER_POSTS_BY_CATEGORY) {
    if (matches({ title: p.title, description: "" }, q)) {
      hits.push({
        type: "placeholder_post",
        id: p.id,
        title: p.title,
        description: `Community discussion in ${INTERACTION_CATEGORY_LABELS[p.category] ?? p.category}.`,
        url: `/interaction/${p.category}/${p.id}`,
        category: p.category,
      });
    }
  }

  // 8. Demo posts with HTML content (ph-soft-1, ph-soft-2)
  for (const d of DEMO_POSTS) {
    if (matches({ title: d.title, description: d.description }, q)) {
      hits.push({
        type: "placeholder_post",
        id: d.id,
        title: d.title,
        description: d.description,
        url: `/interaction/${d.category}/${d.id}`,
        category: d.category,
      });
    }
  }

  // 9. Default comments (only shown when real comments missing)
  for (const c of DEFAULT_COMMENTS) {
    const title = `Comment by ${c.author}`;
    const desc = c.content;
    if (matches({ title, description: desc }, q)) {
      hits.push({
        type: "site_section",
        id: c.id,
        title,
        description: desc,
        url: "/interaction",
        group: "Community",
      });
    }
  }

  // 10. localStorage-overridden content (admin edits)
  for (const local of readLocalSectionOverrides()) {
    if (matches(local, q)) hits.push(local);
  }

  return hits;
}
