"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@/lib/convex";
import { api } from "@/lib/convex";
import { readInteractionItems } from "@/lib/interaction";
import {
  PERFORMANCE_CATEGORY_OPTIONS,
  PERFORMANCE_CATEGORY_LABELS,
  CATEGORY_FALLBACK_IMAGES,
  INTERACTION_CATEGORY_LABELS,
} from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventHit {
  type: "event";
  id: string;
  title: string;
  event_date: string | null;
  image_url: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  ticket_url: string | null;
  category: string;
  categoryLabel: string;
}

interface NewsHit {
  type: "news";
  id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishDate?: number;
  category?: string;
}

interface InsightHit {
  type: "insight";
  id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  publishDate?: number;
  eventDate?: number;
  category?: string;
}

interface StageProductionHit {
  type: "stage_production";
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  category?: string;
}

interface InteractionHit {
  type: "interaction";
  id: string;
  title: string;
  description?: string;
  category: string;
  categoryLabel: string;
}

type SearchHit = EventHit | NewsHit | InsightHit | StageProductionHit | InteractionHit;

interface SearchPageClientProps {
  initialQuery: string;
}

type Status = "idle" | "loading" | "ready" | "error";

// ─── Utilities ────────────────────────────────────────────────────────────────

function escapeIlike(input: string) {
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function normalizeText(raw: unknown): string {
  return (raw == null ? "" : String(raw)).toLowerCase();
}

function textMatch(item: Record<string, unknown>, fields: string[], pattern: string): boolean {
  const p = pattern.toLowerCase();
  return fields.some((f) => normalizeText(item[f]).includes(p));
}

// ─── Sub-search functions ─────────────────────────────────────────────────────

async function searchEvents(query: string): Promise<EventHit[]> {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${escapeIlike(q)}%`;
  const results = await Promise.all(
    PERFORMANCE_CATEGORY_OPTIONS.map(async (cat) => {
      const table = `${cat.value.replace(/-/g, "_")}_events`;
      const { data, error } = await supabase
        .from(table)
        .select(
          "ticketmaster_id,title,event_date,image_url,venue,city,state,ticket_url"
        )
        .or(
          `title.ilike.${pattern},venue.ilike.${pattern},city.ilike.${pattern}`
        )
        .order("event_date", { ascending: true })
        .limit(20);
      if (error) return [];
      return (data ?? []).map(
        (row: any): EventHit => ({
          type: "event",
          id: row.ticketmaster_id,
          title: row.title,
          event_date: row.event_date,
          image_url: row.image_url,
          venue: row.venue,
          city: row.city,
          state: row.state,
          ticket_url: row.ticket_url,
          category: cat.value,
          categoryLabel: cat.label,
        })
      );
    })
  );
  return results
    .flat()
    .sort((a, b) => {
      const ad = a.event_date ? new Date(a.event_date).getTime() : Infinity;
      const bd = b.event_date ? new Date(b.event_date).getTime() : Infinity;
      return ad - bd;
    });
}

function searchNews(news: any[] | undefined, query: string): NewsHit[] {
  const q = query.trim().toLowerCase();
  if (!q || !news?.length) return [];
  return news
    .filter((n) =>
      textMatch(n as Record<string, unknown>, ["title", "excerpt", "content", "authorName"], q)
    )
    .map((n): NewsHit => ({
      type: "news",
      id: n._id as string,
      title: n.title ?? "",
      excerpt: n.excerpt,
      coverImage: n.coverImage,
      publishDate: n.publishDate,
      category: "News",
    }));
}

function searchInsights(insights: any[] | undefined, query: string): InsightHit[] {
  const q = query.trim().toLowerCase();
  if (!q || !insights?.length) return [];
  return insights
    .filter((i) =>
      textMatch(i as Record<string, unknown>, ["title", "excerpt", "content", "authorName"], q)
    )
    .map((i): InsightHit => ({
      type: "insight",
      id: i._id as string,
      title: i.title ?? "",
      excerpt: i.excerpt,
      coverImage: i.coverImage,
      publishDate: i.publishDate,
      eventDate: i.eventDate,
      category: i.category ?? "Insight",
    }));
}

function searchStageProductions(
  productions: any[] | undefined,
  query: string
): StageProductionHit[] {
  const q = query.trim().toLowerCase();
  if (!q || !productions?.length) return [];
  return productions
    .filter((p) =>
      textMatch(p as Record<string, unknown>, ["title", "description"], q)
    )
    .map((p): StageProductionHit => ({
      type: "stage_production",
      id: p._id as string,
      title: p.title ?? "",
      description: p.description,
      coverImage: p.coverImage,
      category: p.category,
    }));
}

function searchInteraction(query: string): InteractionHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const items = readInteractionItems<{ id?: string; title?: string; description?: string; category?: string }>();
  return items
    .filter((item) =>
      textMatch(item as Record<string, unknown>, ["title", "description"], q)
    )
    .map((item): InteractionHit => ({
      type: "interaction",
      id: item.id ?? "",
      title: item.title ?? "",
      description: item.description,
      category: item.category ?? "others",
      categoryLabel: INTERACTION_CATEGORY_LABELS[item.category ?? "others"] ?? item.category ?? "Other",
    }));
}

// ─── Section label helpers ────────────────────────────────────────────────────

const TYPE_LABELS: Record<SearchHit["type"], string> = {
  event: "Performance",
  news: "News",
  insight: "Insight",
  stage_production: "Stage Production",
  interaction: "Community",
};

const TYPE_HREF: Record<SearchHit["type"], string> = {
  event: (hit: SearchHit) =>
    hit.type === "event" ? `/performance/${hit.category}` : "/performance",
  news: "/news",
  insight: (hit: SearchHit) =>
    hit.type === "insight" ? `/insights/${hit.category ?? "general"}` : "/insights",
  stage_production: "/performance/stage",
  interaction: (hit: SearchHit) =>
    hit.type === "interaction" ? `/interaction/${hit.category}` : "/interaction",
};

// ─── Result card renderers ───────────────────────────────────────────────────

function EventCard({ hit }: { hit: EventHit }) {
  const fallback = CATEGORY_FALLBACK_IMAGES[hit.categoryLabel] ?? CATEGORY_FALLBACK_IMAGES["Other"];
  const img = hit.image_url?.startsWith("http") ? hit.image_url : fallback;
  const venueLine = [hit.venue, hit.city, hit.state].filter(Boolean).join(" · ");
  const href = hit.ticket_url ?? `/performance/${hit.category}`;
  return (
    <li className="flex flex-col border border-hmc-placeholder-border bg-white">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 cursor-pointer flex-col gap-2 p-2 transition-opacity hover:opacity-85"
      >
        <h3 className="line-clamp-3 text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
          {hit.title}
        </h3>
        <time className="text-[10px] text-hmc-text-muted">
          {hit.event_date ? `Date: ${hit.event_date}` : "Date TBA"}
        </time>
        {venueLine && <p className="line-clamp-2 text-[10px] text-hmc-text-muted">{venueLine}</p>}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
          <Image src={img} alt={hit.title} width={500} height={375} className="h-full w-full object-cover" unoptimized />
        </div>
      </Link>
      <div className="flex w-full justify-center border-t border-hmc-placeholder-border bg-white">
        <Link
          href={`/performance/${hit.category}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90"
        >
          View More {hit.categoryLabel}
        </Link>
      </div>
    </li>
  );
}

function NewsCard({ hit }: { hit: NewsHit }) {
  const dateStr = hit.publishDate
    ? new Date(hit.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const img = hit.coverImage?.startsWith("http") ? hit.coverImage : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500";
  return (
    <li className="flex flex-col border border-hmc-placeholder-border bg-white">
      <Link
        href={`/news/${hit.id}`}
        className="flex flex-1 cursor-pointer flex-col gap-2 p-2 transition-opacity hover:opacity-85"
      >
        <h3 className="line-clamp-3 text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
          {hit.title}
        </h3>
        {dateStr && <time className="text-[10px] text-hmc-text-muted">{dateStr}</time>}
        {hit.excerpt && (
          <p className="line-clamp-2 text-[10px] text-hmc-text-muted">{hit.excerpt}</p>
        )}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
          <Image src={img} alt={hit.title} width={500} height={375} className="h-full w-full object-cover" unoptimized />
        </div>
      </Link>
      <div className="flex w-full justify-center border-t border-hmc-placeholder-border bg-white">
        <Link
          href="/news"
          className="flex-1 bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90"
        >
          More News
        </Link>
      </div>
    </li>
  );
}

function InsightCard({ hit }: { hit: InsightHit }) {
  const dateStr = hit.publishDate
    ? new Date(hit.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";
  const img = hit.coverImage?.startsWith("http") ? hit.coverImage : "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500";
  const categorySlug = hit.category?.toLowerCase().replace(/\s+/g, "-") ?? "general";
  return (
    <li className="flex flex-col border border-hmc-placeholder-border bg-white">
      <Link
        href={`/insights/${categorySlug}/${hit.id}`}
        className="flex flex-1 cursor-pointer flex-col gap-2 p-2 transition-opacity hover:opacity-85"
      >
        <h3 className="line-clamp-3 text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
          {hit.title}
        </h3>
        {dateStr && <time className="text-[10px] text-hmc-text-muted">{dateStr}</time>}
        {hit.excerpt && (
          <p className="line-clamp-2 text-[10px] text-hmc-text-muted">{hit.excerpt}</p>
        )}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
          <Image src={img} alt={hit.title} width={500} height={375} className="h-full w-full object-cover" unoptimized />
        </div>
      </Link>
      <div className="flex w-full justify-center border-t border-hmc-placeholder-border bg-white">
        <Link
          href={`/insights/${categorySlug}`}
          className="flex-1 bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90"
        >
          More Insights
        </Link>
      </div>
    </li>
  );
}

function StageProductionCard({ hit }: { hit: StageProductionHit }) {
  const img = hit.coverImage?.startsWith("http") ? hit.coverImage : "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500";
  const slug = hit.category?.toLowerCase().replace(/\s+/g, "-") ?? "stage";
  return (
    <li className="flex flex-col border border-hmc-placeholder-border bg-white">
      <Link
        href={`/performance/${slug}/${hit.id}`}
        className="flex flex-1 cursor-pointer flex-col gap-2 p-2 transition-opacity hover:opacity-85"
      >
        <h3 className="line-clamp-3 text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
          {hit.title}
        </h3>
        {hit.description && (
          <p className="line-clamp-2 text-[10px] text-hmc-text-muted">{hit.description}</p>
        )}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
          <Image src={img} alt={hit.title} width={500} height={375} className="h-full w-full object-cover" unoptimized />
        </div>
      </Link>
      <div className="flex w-full justify-center border-t border-hmc-placeholder-border bg-white">
        <Link
          href="/performance/stage"
          className="flex-1 bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90"
        >
          Stage Productions
        </Link>
      </div>
    </li>
  );
}

function InteractionCard({ hit }: { hit: InteractionHit }) {
  return (
    <li className="flex flex-col border border-hmc-placeholder-border bg-white">
      <Link
        href={`/interaction/${hit.category}/${hit.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 cursor-pointer flex-col gap-2 p-2 transition-opacity hover:opacity-85"
      >
        <span className="self-start rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
          {hit.categoryLabel}
        </span>
        <h3 className="line-clamp-3 text-xs font-semibold leading-snug text-hmc-text">
          {hit.title}
        </h3>
        {hit.description && (
          <p className="line-clamp-3 text-[10px] text-hmc-text-muted">{hit.description}</p>
        )}
      </Link>
      <div className="flex w-full justify-center border-t border-hmc-placeholder-border bg-white">
        <Link
          href={`/interaction/${hit.category}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90"
        >
          More in {hit.categoryLabel}
        </Link>
      </div>
    </li>
  );
}

function HitCard({ hit }: { hit: SearchHit }) {
  switch (hit.type) {
    case "event":          return <EventCard hit={hit} />;
    case "news":           return <NewsCard hit={hit} />;
    case "insight":        return <InsightCard hit={hit} />;
    case "stage_production": return <StageProductionCard hit={hit} />;
    case "interaction":    return <InteractionCard hit={hit} />;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Convex data — these re-render when data arrives.
  // They are always called unconditionally (hooks rules).
  const convexNews = useQuery(api.admin.getPublishedNews, {});
  const convexInsights = useQuery(api.admin.getPublishedInsights, {});
  const convexStageProductions = useQuery(api.admin.getAllPublicStageProductions);

  useEffect(() => {
    const q = submittedQuery.trim();
    if (!q) {
      setHits([]);
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setErrorMsg(null);

    const run = async () => {
      try {
        const [events, interaction] = await Promise.all([
          searchEvents(q),
          Promise.resolve(searchInteraction(q)),
        ]);

        if (cancelled) return;

        // Convex data is already available via useQuery (above) — filter synchronously.
        const news = searchNews(convexNews as any[] | undefined, q);
        const insights = searchInsights(convexInsights as any[] | undefined, q);
        const stageProductions = searchStageProductions(convexStageProductions as any[] | undefined, q);

        if (cancelled) return;

        setHits([...events, ...news, ...insights, ...stageProductions, ...interaction]);
        setStatus("ready");
      } catch (e: any) {
        if (cancelled) return;
        setErrorMsg(e?.message ?? "Search failed");
        setStatus("error");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [submittedQuery, convexNews, convexInsights, convexStageProductions]);

  // Group hits by type for sectioned display
  const grouped = useMemo(() => {
    const map: Record<SearchHit["type"], SearchHit[]> = {
      event: [],
      news: [],
      insight: [],
      stage_production: [],
      interaction: [],
    };
    for (const h of hits) {
      map[h.type].push(h);
    }
    return (["event", "news", "insight", "stage_production", "interaction"] as SearchHit["type"][])
      .filter((t) => map[t].length > 0)
      .map((t) => ({ type: t, label: TYPE_LABELS[t], items: map[t] }));
  }, [hits]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittedQuery(query.trim());
    if (query.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set("q", query.trim());
      window.history.pushState({}, "", url.toString());
    }
  }

  const total = hits.length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-hmc-text">Search</h1>
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search Hope Music Community"
          className="mt-4 flex w-full max-w-2xl items-stretch gap-2"
        >
          <label htmlFor="search-input" className="sr-only">
            Search everything
          </label>
          <input
            id="search-input"
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Events, news, insights, community…"
            className="flex-1 border border-hmc-placeholder-border bg-white px-3 py-2 text-sm text-hmc-text outline-none focus:border-hmc-orange"
          />
          <button
            type="submit"
            className="bg-hmc-orange px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>
        {submittedQuery && (
          <p className="mt-3 text-xs text-hmc-text-muted">
            <span className="font-semibold text-hmc-text">&ldquo;{submittedQuery}&rdquo;</span>{" "}
            — {total} {total === 1 ? "result" : "results"}
          </p>
        )}
      </header>

      {status === "idle" && !submittedQuery && (
        <p className="text-sm text-hmc-text-muted">
          Search across events, news, insights, and community posts.
        </p>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-hmc-orange" />
          <span className="text-sm text-hmc-text-muted">Searching…</span>
        </div>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">Something went wrong: {errorMsg}</p>
      )}

      {status === "ready" && hits.length === 0 && (
        <p className="text-sm text-hmc-text-muted">
          No results for &ldquo;{submittedQuery}&rdquo;. Try a different keyword.
        </p>
      )}

      {status === "ready" && grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map(({ type, label, items }) => (
            <section key={type} aria-labelledby={`group-${type}`}>
              <h2
                id={`group-${type}`}
                className="mb-3 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-hmc-text"
              >
                <span>{label}</span>
                <span className="text-[11px] font-medium text-hmc-text-muted">
                  ({items.length})
                </span>
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((hit) => (
                  <HitCard key={`${type}-${hit.id}`} hit={hit} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

export default SearchPageClient;
