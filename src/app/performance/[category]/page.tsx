"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PERFORMANCE_CATEGORY_OPTIONS, GLOBAL_CITY_GROUPS } from "@/lib/constants";
import { useQuery, useMutation, api } from "@/lib/convex";

interface Production {
  _id: string;
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  eventDate?: number;
  city?: string;
  countryScope?: "United States" | "International";
  url?: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  label: string;
  options: FilterOption[];
}

type TimeFilter = "all" | "week" | "month";
type CountryScope = "United States" | "International";

const ITEMS_PER_PAGE = 20;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function utcDateStr(ts: number): string {
  const d = new Date(ts);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}

function normalizeCity(city: string | undefined): string {
  return (city ?? "").trim().toLowerCase();
}

function matchesTime(eventDate: number | undefined, filter: TimeFilter): boolean {
  if (!eventDate) return false;

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  // Allow events from the last 30 days and all future events
  if (eventDate < thirtyDaysAgo) return false;

  if (filter === "all") return true;

  const maxMs = filter === "week" ? ONE_WEEK_MS : ONE_MONTH_MS;
  return eventDate - now <= maxMs;
}

function regionTabClass(active: boolean, region: CountryScope): string {
  const base = "rounded-full px-5 py-2 text-sm font-medium transition-colors border";
  if (region === "United States") {
    return active
      ? base + " border-hmc-orange text-hmc-orange bg-white"
      : base + " border-gray-300 text-gray-700 bg-white hover:border-gray-400";
  }
  return active
    ? base + " border-hmc-orange text-hmc-orange bg-white"
    : base + " border-gray-300 text-gray-700 bg-white hover:border-gray-400";
}

export default function PerformanceCategoryPage() {
  const params = useParams();
  const category = (params.category as string) || "";
  const categoryLabel = PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [countryScope, setCountryScope] = useState<CountryScope>("United States");

  const convexProductions = useQuery(api.admin.getStageProductionsByCategory, { category }) as
    | { items: any[]; total: number }
    | undefined;

  const loading = convexProductions === undefined;
  const allProductions: Production[] = (convexProductions?.items ?? []).map((p) => ({
    _id: p._id,
    id: p._id,
    title: p.title,
    category: p.category,
    description: p.description,
    coverImage: p.coverImage,
    eventDate: p.eventDate ?? undefined,
    city: p.city ?? "",
    url: p.url ?? "",
  }));

  const productions: Production[] = allProductions;

  useEffect(() => {
    setCurrentPage(1);
    setSelectedCity("all");
    setTimeFilter("all");
    setCountryScope("United States");
  }, [category]);

  const cityOptionGroups = useMemo<FilterGroup[]>(() => {
    const available = Array.from(
      new Set(productions.map((p) => p.city?.trim()).filter((c): c is string => Boolean(c)))
    ).sort((a, b) => a.localeCompare(b));

    const byNorm = new Map(available.map((c) => [normalizeCity(c), c]));
    const assigned = new Set<string>();

    const groups: FilterGroup[] = GLOBAL_CITY_GROUPS.map((g) => {
      const opts = g.cities
        .map((c) => byNorm.get(normalizeCity(c)) ?? c)
        .filter((c, i, arr) => {
          const n = normalizeCity(c);
          if (arr.findIndex((e) => normalizeCity(e) === n) !== i) return false;
          if (assigned.has(n)) return false;
          assigned.add(n);
          return true;
        })
        .sort((a, b) => a.localeCompare(b))
        .map((c) => ({ value: c, label: c }));

      return { label: g.label, options: opts };
    }).filter((g) => g.options.length > 0);

    const others = available
      .filter((c) => !assigned.has(normalizeCity(c)))
      .map((c) => ({ value: c, label: c }));
    if (others.length > 0) {
      groups.push({ label: "Other cities in results", options: others });
    }

    return groups;
  }, [productions]);

  const normCity = selectedCity;
  const normActive = normCity === "all" ? "all" : normalizeCity(normCity);

  const filteredItems = useMemo(() => {
    const result = productions.filter((item) => {
      const cityOk = normActive === "all" || normalizeCity(item.city) === normActive;
      const timeOk = matchesTime(item.eventDate, timeFilter);
      return cityOk && timeOk;
    });

    return result.sort((a, b) => {
      const dateA = a.eventDate ? utcDateStr(a.eventDate) : "9999-99-99";
      const dateB = b.eventDate ? utcDateStr(b.eventDate) : "9999-99-99";
      return dateA.localeCompare(dateB);
    });
  }, [productions, normActive, timeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, timeFilter, countryScope]);

  const formatDt = (ts: number) => {
    const d = new Date(ts);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  };

  const { leftColumnItems, rightColumnItems } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filteredItems.slice(start, start + ITEMS_PER_PAGE);
    const mid = Math.ceil(pageItems.length / 2);
    return {
      leftColumnItems: pageItems.slice(0, mid),
      rightColumnItems: pageItems.slice(mid),
    };
  }, [filteredItems, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const renderCard = (item: Production, n: number) => (
    <a
      key={item._id}
      href={"/performance/" + item.category + "/" + item._id}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 transition-all duration-300 hover:border-hmc-orange/40 hover:shadow-lg hover:shadow-hmc-orange/5"
    >
      <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="128px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-200">
            <span className="text-xs text-gray-400">No Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="flex-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-hmc-orange">
            {item.title}
          </h3>
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-500 transition-colors group-hover:bg-hmc-orange group-hover:text-white">
            {n}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {item.eventDate ? (
            <>
              <span className="inline-flex items-center gap-1 font-semibold text-hmc-orange">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDt(item.eventDate).date}
              </span>
              {formatDt(item.eventDate).time && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDt(item.eventDate).time}
                </span>
              )}
            </>
          ) : null}
          {item.city ? <span>{item.city}</span> : null}
        </div>
        {item.url ? (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(item.url, "_blank", "noopener,noreferrer"); }}
            className="mt-2 inline-flex w-fit items-center gap-1 rounded bg-hmc-orange px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90 cursor-pointer"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Buy Tickets
          </button>
        ) : null}
      </div>
    </a>
  );

  const HEADER = (
    <div className="border-b border-t border-hmc-orange">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">{categoryLabel}</h1>
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        {HEADER}
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div>
        </div>
      </main>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        {HEADER}
        <div className="py-20 text-center text-gray-500">
          <p>No matching performances found.</p>
          <Link href="/performance" className="mt-4 inline-block text-hmc-orange hover:underline">
            ← Back to Performance
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {HEADER}

      {/* Filters */}
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-2xl border border-hmc-orange/15 bg-[#FFF7F3] p-4 shadow-sm">
          {/* Region tabs */}
          <div className="mb-4 flex items-center gap-2">
            {(["United States", "International"] as CountryScope[]).map((scope) => (
              <button
                key={scope}
                onClick={() => setCountryScope(scope)}
                className={regionTabClass(countryScope === scope, scope)}
              >
                {scope}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* City dropdown */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 left-3.5 flex items-center">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-10 rounded-full border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 appearance-none cursor-pointer"
              >
                <option value="all">All cities</option>
                {cityOptionGroups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 right-3 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Time dropdown */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 left-3.5 flex items-center">
                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="h-10 rounded-full border border-gray-300 bg-white py-2 pl-10 pr-10 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 appearance-none cursor-pointer"
              >
                <option value="all">All Dates</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 right-3 flex items-center">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* This Weekend pill */}
            <button
              onClick={() => setTimeFilter(timeFilter === "week" ? "all" : "week")}
              className={"h-10 rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2 " + (timeFilter === "week" ? "bg-hmc-orange text-white border border-hmc-orange" : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400")}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              This Weekend
            </button>
          </div>
        </div>
      </div>

      {/* Events grid */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="relative">
          <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-hmc-orange/30 to-transparent lg:block"></div>
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-hmc-orange/30 bg-white shadow-sm">
              <span className="text-xs font-bold text-hmc-orange">{currentPage}/{totalPages}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-3">
              {leftColumnItems.map((item, idx) => {
                const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return renderCard(item, itemNumber);
              })}
            </div>
            <div className="space-y-3">
              {rightColumnItems.map((item, idx) => {
                const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + leftColumnItems.length + idx + 1;
                return renderCard(item, itemNumber);
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-hmc-orange disabled:cursor-not-allowed disabled:opacity-40"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={"px-3 py-1.5 text-sm " + (currentPage === 1 ? "font-semibold text-hmc-orange" : "text-gray-600 hover:text-hmc-orange")}
            >
              «
            </button>
            {getPageNumbers().map((page, idx) =>
              page === "ellipsis" ? (
                <span key={"ellipsis-" + idx} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={"h-9 min-w-[36px] rounded px-2 text-sm " + (currentPage === page ? "bg-hmc-orange font-medium text-white" : "text-gray-600 hover:bg-gray-100")}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={"px-3 py-1.5 text-sm " + (currentPage === totalPages ? "font-semibold text-hmc-orange" : "text-gray-600 hover:text-hmc-orange")}
            >
              »
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-hmc-orange disabled:cursor-not-allowed disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
