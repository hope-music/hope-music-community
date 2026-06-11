"use client";

import Link from "next/link";
import { useQuery } from "@/lib/convex";
import { normalizeInteractionCategory, parseInteractionItems, INTERACTION_STORAGE_KEY } from "@/lib/interaction";
import { useEffect, useMemo, useState } from "react";
import {
  PERFORMANCE_CATEGORY_LABELS,
  STAGE_PRODUCTION_CATEGORY_LABELS,
  INTERACTION_CATEGORY_LABELS,
} from "@/lib/constants";
import { api } from "@/lib/convex";

type SearchResult = {
  id: string;
  title: string;
  href: string;
  description: string;
  section: string;
  meta?: string;
  searchText: string;
};

type SearchPageClientProps = {
  initialQuery: string;
};

type PerformanceEvent = {
  id: string;
  title: string;
  category: string;
  description?: string;
  coverImage?: string;
  eventDate?: string;
  city?: string;
  status?: string;
};

type StageProductionItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  status?: "upcoming" | "past" | "draft";
  eventDate?: string;
};

type InteractionItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  author?: string;
};

type HopeStudioItem = {
  id: string;
  title: string;
  description: string;
  content?: string;
  hidden?: boolean;
};

type NewsArticle = {
  _id: string;
  title: string;
  excerpt?: string;
  publishDate?: number;
};

const SECTION_RESULTS: SearchResult[] = [
  {
    id: "section-performance",
    title: "Performance",
    href: "/performance",
    description: "Browse featured shows and live performances across categories and cities.",
    section: "Section",
    meta: "Performance",
    searchText: "performance featured shows live performances categories cities",
  },
  {
    id: "section-stage-production",
    title: "Stage Production",
    href: "/stage-production",
    description: "Explore stage, lighting, audio, effects, costumes, props, and related production work.",
    section: "Section",
    meta: "Stage Production",
    searchText: "stage production lighting audio effects costumes props production",
  },
  {
    id: "section-interaction",
    title: "Interaction",
    href: "/interaction",
    description: "Join discussions about software, hardware, music, and stage production topics.",
    section: "Section",
    meta: "Interaction",
    searchText: "interaction software hardware music production discussions forum",
  },
  {
    id: "section-hope-studio",
    title: "Hope Studio",
    href: "/hope-studio",
    description: "Discover Hope Studio projects, services, and featured creative work.",
    section: "Section",
    meta: "Hope Studio",
    searchText: "hope studio projects services creative work recording mixing mastering",
  },
  {
    id: "section-community",
    title: "Community",
    href: "/community",
    description: "See community discussions, member content, and upcoming participation spaces.",
    section: "Section",
    meta: "Community",
    searchText: "community discussions member content participation spaces",
  },
  {
    id: "section-information",
    title: "Information",
    href: "/information",
    description: "Find site information, announcements, and general updates.",
    section: "Section",
    meta: "Information",
    searchText: "information announcements updates general site info",
  },
  {
    id: "section-about",
    title: "About",
    href: "/about",
    description: "Learn more about Hope Music Community and its mission.",
    section: "Section",
    meta: "About",
    searchText: "about hope music community mission",
  },
  {
    id: "section-news",
    title: "News",
    href: "/news",
    description: "Read the latest articles, announcements, and editorial updates.",
    section: "Section",
    meta: "News",
    searchText: "news articles announcements editorial updates",
  },
];

const STAGE_CATEGORY_LABELS: Record<string, string> = {
  ...STAGE_PRODUCTION_CATEGORY_LABELS,
  sets: "Stage",
  sound: "Audio",
  projection: "Video",
  scenery: "Effects",
};

const INTERACTION_CATEGORY_LABELS_LOCAL = INTERACTION_CATEGORY_LABELS;

const DEFAULT_HOPE_STUDIO_ITEMS: HopeStudioItem[] = [
  {
    id: "welcome",
    title: "Welcome to Hope Music Community",
    description: "Discover the vibrant world of Hope Music Community, where music lovers unite.",
    content: "",
    hidden: false,
  },
  {
    id: "studio",
    title: "Hope Studio",
    description: "Professional recording, mixing, and mastering services in our state-of-the-art facility.",
    content: "",
    hidden: false,
  },
  {
    id: "jesse-liu",
    title: "Jesse Liu",
    description: "Meet Jesse Liu, our founder and creative director.",
    content: "",
    hidden: false,
  },
  {
    id: "shangri-la",
    title: "Shangri-La",
    description: "An immersive musical experience that transports you to another world.",
    content: "",
    hidden: false,
  },
  {
    id: "works",
    title: "Cooperation",
    description: "Explore our portfolio of completed projects and collaborations.",
    content: "",
    hidden: false,
  },
  {
    id: "schedule",
    title: "Performance Schedule",
    description: "Stay updated with our upcoming performances and events.",
    content: "",
    hidden: true,
  },
];

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
}

function stripHtml(value: string | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value?: string | number) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function loadPerformanceResults(): Promise<SearchResult[]> {
  try {
    const response = await fetch("/data/ticketmaster-events.json");
    if (!response.ok) return [];
    const data = await response.json();
    const events: PerformanceEvent[] = Array.isArray(data?.events) ? data.events : [];

    const categoryResults = Object.entries(PERFORMANCE_CATEGORY_LABELS).map(([slug, label]) => ({
      id: `performance-category-${slug}`,
      title: label,
      href: `/performance/${slug}`,
      description: `Browse ${label} performances and related event listings.`,
      section: "Performance",
      meta: "Category",
      searchText: normalizeSearchText(`${label} performance category ${slug}`),
    }));

    const eventResults = events.map((event) => {
      const categoryLabel = PERFORMANCE_CATEGORY_LABELS[event.category] ?? event.category;
      const description = stripHtml(event.description) || `Performance in ${event.city || "multiple cities"}`;
      const metaParts = [categoryLabel, event.city, formatDate(event.eventDate)].filter(Boolean);
      return {
        id: `performance-${event.id}`,
        title: event.title,
        href: `/performance/${event.category}/${event.id}`,
        description,
        section: "Performance",
        meta: metaParts.join(" • "),
        searchText: normalizeSearchText(
          `${event.title} ${description} ${categoryLabel} ${event.city ?? ""} ${event.status ?? ""} ${event.category}`
        ),
      } satisfies SearchResult;
    });

    return [...categoryResults, ...eventResults];
  } catch {
    return [];
  }
}

function loadStageProductionResults(): SearchResult[] {
  try {
    const stored = localStorage.getItem("admin_stage_production");
    const parsed: StageProductionItem[] = stored ? JSON.parse(stored) : [];
    const items = Array.isArray(parsed) ? parsed.filter((item) => item.status !== "draft") : [];

    return items.map((item) => {
      const categoryLabel = STAGE_CATEGORY_LABELS[item.category] ?? item.category;
      const description = stripHtml(item.description) || `${categoryLabel} stage production item`;
      return {
        id: `stage-production-${item.id}`,
        title: item.title,
        href: `/stage-production/${item.category}/${item.id}`,
        description,
        section: "Stage Production",
        meta: [categoryLabel, formatDate(item.eventDate)].filter(Boolean).join(" • "),
        searchText: normalizeSearchText(
          `${item.title} ${description} ${categoryLabel} stage production ${item.category}`
        ),
      } satisfies SearchResult;
    });
  } catch {
    return [];
  }
}

function loadInteractionResults(): SearchResult[] {
  try {
    const items = parseInteractionItems<InteractionItem>(localStorage.getItem(INTERACTION_STORAGE_KEY));

    return items.map((item) => {
      const normalizedCat = normalizeInteractionCategory(item.category);
      const categoryLabel = INTERACTION_CATEGORY_LABELS[normalizedCat] ?? INTERACTION_CATEGORY_LABELS[item.category] ?? item.category;
      const description = stripHtml(item.description) || `${categoryLabel} discussion topic`;
      return {
        id: `interaction-${item.id}`,
        title: item.title,
        href: `/interaction/${normalizedCat}/${item.id}`,
        description,
        section: "Interaction",
        meta: [categoryLabel, item.author].filter(Boolean).join(" • "),
        searchText: normalizeSearchText(
          `${item.title} ${description} ${categoryLabel} interaction forum ${item.author ?? ""}`
        ),
      } satisfies SearchResult;
    });
  } catch {
    return [];
  }
}

function loadHopeStudioResults(): SearchResult[] {
  try {
    const stored = localStorage.getItem("hope_studio_content");
    const parsed: HopeStudioItem[] = stored ? JSON.parse(stored) : DEFAULT_HOPE_STUDIO_ITEMS;
    const items = (Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HOPE_STUDIO_ITEMS)
      .filter(item => item.hidden !== true);

    return items.map((item) => {
      const description = stripHtml(item.description) || stripHtml(item.content) || "Hope Studio content";
      return {
        id: `hope-studio-${item.id}`,
        title: item.title,
        href: `/hope-studio/${item.id}`,
        description,
        section: "Hope Studio",
        meta: "Studio content",
        searchText: normalizeSearchText(
          `${item.title} ${description} ${stripHtml(item.content)} hope studio`
        ),
      } satisfies SearchResult;
    });
  } catch {
    return DEFAULT_HOPE_STUDIO_ITEMS
      .filter(item => item.hidden !== true)
      .map((item) => ({
        id: `hope-studio-${item.id}`,
        title: item.title,
        href: `/hope-studio/${item.id}`,
        description: item.description,
        section: "Hope Studio",
        meta: "Studio content",
        searchText: normalizeSearchText(`${item.title} ${item.description} hope studio`),
      }));
  }
}

function buildNewsResults(articles: NewsArticle[] | undefined): SearchResult[] {
  if (!articles?.length) return [];

  return articles.map((article) => ({
    id: `news-${article._id}`,
    title: article.title,
    href: `/news/${article._id}`,
    description: stripHtml(article.excerpt) || "Published news article",
    section: "News",
    meta: formatDate(article.publishDate),
    searchText: normalizeSearchText(
      `${article.title} ${article.excerpt ?? ""} news article ${formatDate(article.publishDate)}`
    ),
  }));
}

export default function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const [performanceResults, setPerformanceResults] = useState<SearchResult[]>([]);
  const [stageProductionResults, setStageProductionResults] = useState<SearchResult[]>([]);
  const [interactionResults, setInteractionResults] = useState<SearchResult[]>([]);
  const [hopeStudioResults, setHopeStudioResults] = useState<SearchResult[]>([]);
  const [loadingLocalResults, setLoadingLocalResults] = useState(true);
  const publishedNews = useQuery(api.admin.getPublishedNews, {}) as NewsArticle[] | undefined;

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      const [performance] = await Promise.all([loadPerformanceResults()]);
      if (cancelled) return;

      setPerformanceResults(performance);
      setStageProductionResults(loadStageProductionResults());
      setInteractionResults(loadInteractionResults());
      setHopeStudioResults(loadHopeStudioResults());
      setLoadingLocalResults(false);
    }

    loadResults();

    const handleStorage = () => {
      setStageProductionResults(loadStageProductionResults());
      setInteractionResults(loadInteractionResults());
      setHopeStudioResults(loadHopeStudioResults());
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const newsResults = useMemo(() => buildNewsResults(publishedNews), [publishedNews]);
  const allResults = useMemo(
    () => [
      ...SECTION_RESULTS,
      ...performanceResults,
      ...stageProductionResults,
      ...interactionResults,
      ...hopeStudioResults,
      ...newsResults,
    ],
    [performanceResults, stageProductionResults, interactionResults, hopeStudioResults, newsResults]
  );

  const query = initialQuery.trim();
  const normalizedQuery = normalizeSearchText(query);
  const results = useMemo(() => {
    if (!normalizedQuery) return allResults;
    return allResults.filter((result) => {
      const haystack = normalizeSearchText(
        `${result.title} ${result.description} ${result.href} ${result.section} ${result.meta ?? ""} ${result.searchText}`
      );
      return haystack.includes(normalizedQuery);
    });
  }, [allResults, normalizedQuery]);

  const groupedResults = useMemo(() => {
    return results.reduce<Record<string, SearchResult[]>>((groups, result) => {
      if (!groups[result.section]) {
        groups[result.section] = [];
      }
      groups[result.section].push(result);
      return groups;
    }, {});
  }, [results]);

  const isLoading = loadingLocalResults || publishedNews === undefined;

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">Search</h1>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-hmc-orange/15 bg-[#FFF7F3] p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Search query</p>
          <p className="mt-2 text-xl font-semibold text-gray-900">
            {query ? `“${query}”` : "Browse all searchable content"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {isLoading
              ? "Building search index..."
              : query
                ? `${results.length} result${results.length === 1 ? "" : "s"} found across ${Object.keys(groupedResults).length || 0} section${Object.keys(groupedResults).length === 1 ? "" : "s"}.`
                : `Search across ${allResults.length} indexed entries from site sections and content.`}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(groupedResults).map(([section, sectionResults]) => (
            <span
              key={section}
              className="rounded-full bg-hmc-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-hmc-orange"
            >
              {section} · {sectionResults.length}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-8">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-800">Preparing search results</h2>
              <p className="mt-2 text-sm text-gray-500">
                Loading searchable content from performances, discussions, studio items, and news.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-800">No matching results</h2>
              <p className="mt-2 text-sm text-gray-500">
                Try broader keywords like performance, studio, lighting, software, or news.
              </p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([section, sectionResults]) => (
              <section key={section}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{section}</h2>
                    <p className="text-sm text-gray-500">
                      {sectionResults.length} matching result{sectionResults.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {sectionResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-hmc-orange/40 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-hmc-orange/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-hmc-orange">
                              {result.section}
                            </span>
                            {result.meta ? (
                              <span className="text-xs font-medium text-gray-400">{result.meta}</span>
                            ) : null}
                          </div>
                          <h3 className="mt-3 text-lg font-semibold text-gray-900">{result.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-gray-600">{result.description}</p>
                          <p className="mt-3 text-xs text-gray-400">{result.href}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-hmc-orange/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-hmc-orange">
                          Open
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
