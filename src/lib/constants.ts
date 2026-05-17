export const SITE_NAME = "HOPE MUSIC COMMUNITY";
export const SITE_TAGLINE = "CREATING THE BEST MUSIC";

export const MAIN_NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "PERFORMANCE", href: "/performance" },
  { label: "INTERACTION", href: "/interaction" },
  { label: "NEWS", href: "/news" },
  { label: "ABOUT US", href: "/about" },
] as const;

export const SUB_NAV_LINKS = [
  { label: "OVERVIEW", href: "/performance" },
  { label: "MUSICALS", href: "/performance#musical" },
  { label: "OPERA", href: "/performance#opera" },
  { label: "CONCERT", href: "/performance#concert" },
  { label: "BALLET", href: "/performance#ballet" },
  { label: "EDM", href: "/performance#edm" },
  { label: "FESTIVAL", href: "/performance#festival" },
] as const;

export const PERFORMANCE_CATEGORIES = [
  "Musical",
  "Opera",
  "Concert",
  "EDM",
  "Rock & Roll",
  "Festival",
  "Ballet",
  "Tourist Performance",
  "Others",
] as const;

export const INTERACTION_CATEGORIES = [
  "Software",
  "Hardware",
  "Music",
  "Stage Production",
  "Artical",
  "Others",
] as const;

export const PLACEHOLDER_ARTICLE = {
  title:
    "Celebrate Teacher Appreciation Week by Announcing New Back to School Campaign",
  date: "May 15, 2024",
} as const;

export const SOFTWARE_PLACEHOLDER_ITEMS = [
  "ISAT Interaction 2023 v1.0.4",
  "ISAT Interaction 2023 v1.0.3",
  "ISAT Interaction 2023 v1.0.2",
] as const;

export const CTA_COPY =
  "Fusing diverse musical genres with immersive audio and visuals, the innovative Shangri-La sits at the cutting edge of modern musical theater.";

export const HERO_CAPTION =
  "(Shangri-La: Revolutionizing immersive musical theater)";
