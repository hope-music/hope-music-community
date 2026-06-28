"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  PERFORMANCE_CATEGORY_OPTIONS,
  PERFORMANCE_CATEGORY_LABELS,
  CATEGORY_FALLBACK_IMAGES,
} from "@/lib/constants";

interface SearchHit {
  ticketmaster_id: string;
  title: string;
  event_date: string | null;
  image_url: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  ticket_url: string | null;
  category: string; // slug
  categoryLabel: string;
}

interface SearchPageClientProps {
  initialQuery: string;
}

type Status = "idle" | "loading" | "ready" | "error";

function escapeIlike(input: string) {
  // Supabase PostgREST .ilike treats % and _ as wildcards; escape them
  // so user-typed characters don't act as wildcards.
  return input.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Run search whenever submittedQuery changes (not on every keystroke).
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
        const pattern = `%${escapeIlike(q)}%`;
        const promises = PERFORMANCE_CATEGORY_OPTIONS.map(async (cat) => {
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
            .limit(40);
          if (error) throw new Error(`${table}: ${error.message}`);
          return (data ?? []).map(
            (row: any): SearchHit => ({
              ticketmaster_id: row.ticketmaster_id,
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
        });

        const grouped = await Promise.all(promises);
        if (cancelled) return;
        const flat = grouped.flat().sort((a, b) => {
          // Upcoming first; past last.
          const ad = a.event_date ? new Date(a.event_date).getTime() : Infinity;
          const bd = b.event_date ? new Date(b.event_date).getTime() : Infinity;
          return ad - bd;
        });
        setHits(flat);
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
  }, [submittedQuery]);

  const grouped = useMemo(() => {
    const map: Record<string, { label: string; items: SearchHit[] }> = {};
    for (const h of hits) {
      if (!map[h.category]) map[h.category] = { label: h.categoryLabel, items: [] };
      map[h.category].items.push(h);
    }
    // Preserve canonical category order
    return PERFORMANCE_CATEGORY_OPTIONS
      .map((c) => ({ slug: c.value, ...(map[c.value] ?? { label: c.label, items: [] }) }))
      .filter((g) => g.items.length > 0);
  }, [hits]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittedQuery(query.trim());
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-hmc-text">Search</h1>
        <form
          onSubmit={handleSubmit}
          role="search"
          aria-label="Search performances"
          className="mt-4 flex w-full max-w-2xl items-stretch gap-2"
        >
          <label htmlFor="search-input" className="sr-only">
            Search performances
          </label>
          <input
            id="search-input"
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, venue, or city…"
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
            Showing results for <span className="font-semibold text-hmc-text">&ldquo;{submittedQuery}&rdquo;</span> ({hits.length} {hits.length === 1 ? "match" : "matches"})
          </p>
        )}
      </header>

      {status === "idle" && !submittedQuery && (
        <p className="text-sm text-hmc-text-muted">
          Type a keyword above and press Search.
        </p>
      )}

      {status === "loading" && (
        <p className="text-sm text-hmc-text-muted">Searching…</p>
      )}

      {status === "error" && (
        <p className="text-sm text-red-600">
          Something went wrong: {errorMsg}
        </p>
      )}

      {status === "ready" && hits.length === 0 && (
        <p className="text-sm text-hmc-text-muted">
          No performances match &ldquo;{submittedQuery}&rdquo;. Try a different keyword.
        </p>
      )}

      {status === "ready" && grouped.length > 0 && (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.slug} aria-labelledby={`group-${group.slug}`}>
              <h2
                id={`group-${group.slug}`}
                className="mb-3 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-hmc-text"
              >
                <span>{group.label}</span>
                <span className="text-[11px] font-medium text-hmc-text-muted">
                  ({group.items.length})
                </span>
              </h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((hit) => {
                  const fallback =
                    CATEGORY_FALLBACK_IMAGES[group.label] ??
                    CATEGORY_FALLBACK_IMAGES["Other"];
                  const img = hit.image_url?.startsWith("http")
                    ? hit.image_url
                    : fallback;
                  const dateStr = hit.event_date ?? "";
                  const venueLine =
                    [hit.venue, hit.city, hit.state].filter(Boolean).join(" · ");
                  const href = hit.ticket_url ?? `/performance/${group.slug}`;
                  return (
                    <li
                      key={`${group.slug}-${hit.ticketmaster_id}`}
                      className="flex flex-col border border-hmc-placeholder-border bg-white"
                    >
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
                          {dateStr ? `Date: ${dateStr}` : "Date TBA"}
                        </time>
                        {venueLine && (
                          <p className="line-clamp-2 text-[10px] text-hmc-text-muted">
                            {venueLine}
                          </p>
                        )}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
                          <Image
                            src={img}
                            alt={hit.title}
                            width={500}
                            height={375}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        </div>
                      </Link>
                      <div className="flex w-full justify-center border-t border-hmc-placeholder-border bg-white">
                        <Link
                          href={`/performance/${group.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90"
                        >
                          View More {group.label}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

export default SearchPageClient;
