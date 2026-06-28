"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { PERFORMANCE_CATEGORY_OPTIONS, GLOBAL_CITY_GROUPS } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

interface OperaEvent {
  _id: string;
  ticketmaster_id: string;
  title: string;
  event_date: string | null;
  image_url: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  country: string;
  region: string;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  ticket_url: string | null;
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroup {
  label: string;
  options: FilterOption[];
}

type CountryScope = "United States" | "International";

const ITEMS_PER_PAGE = 20;
const DEFAULT_LOOKBACK_DAYS = 60;

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

function buildSupabaseQuery(
  supabase: SupabaseClient,
  tableName: string,
  page: number,
  selectedCity: string,
  startDate: string,
  endDate: string,
  countryScope: CountryScope,
  lookbackDays: number
) {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  let q = supabase
    .from(tableName)
    .select("*", { count: "exact" })
    .gte("event_date", new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString())
    .order("event_date", { ascending: true })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (selectedCity && selectedCity !== "all") {
    q = q.ilike("city", selectedCity);
  }
  if (startDate) {
    q = q.gte("event_date", startDate);
  }
  if (endDate) {
    q = q.lte("event_date", endDate + "T23:59:59");
  }
  if (countryScope === "United States") {
    q = q.eq("region", "US");
  } else if (countryScope === "International") {
    q = q.neq("region", "US");
  }

  return q;
}

async function fetchEventPage(
  tableName: string,
  page: number,
  selectedCity: string,
  startDate: string,
  endDate: string,
  countryScope: CountryScope,
  lookbackDays: number = DEFAULT_LOOKBACK_DAYS
): Promise<{ items: OperaEvent[]; total: number }> {
  const { data, error, count } = await buildSupabaseQuery(
    supabase, tableName, page, selectedCity, startDate, endDate, countryScope, lookbackDays
  ).throwOnError();

  return { items: (data as OperaEvent[]) ?? [], total: count ?? 0 };
}

async function fetchAvailableCities(
  tableName: string,
  countryScope: CountryScope,
  lookbackDays: number = DEFAULT_LOOKBACK_DAYS
): Promise<string[]> {
  let q = supabase
    .from(tableName)
    .select("city")
    .not("city", "is", null)
    .neq("city", "")
    .gte("event_date", new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString());

  if (countryScope === "United States") {
    q = q.eq("region", "US");
  } else if (countryScope === "International") {
    q = q.neq("region", "US");
  }

  const { data, error } = await q.throwOnError();
  if (error || !data) return [];

  const cities = data
    .map((r: any) => r.city as string)
    .filter((c): c is string => Boolean(c));

  return Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b));
}

function regionTabClass(active: boolean): string {
  const base = "px-5 py-2 text-sm font-medium transition-colors rounded";
  if (active) {
    return base + " bg-hmc-orange/10 text-hmc-orange";
  }
  return base + " bg-gray-100 text-gray-600 hover:bg-gray-200";
}

export default function PerformanceCategoryPage() {
  const params = useParams();
  const category = (params.category as string) || "";
  const categoryLabel = PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [countryScope, setCountryScope] = useState<CountryScope>("United States");
  const router = useRouter();

  // Paginated event data for opera/musical
  const [eventPage, setEventPage] = useState<{ items: OperaEvent[]; total: number }>({ items: [], total: 0 });
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);

  // Available cities for dropdown
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const tableName = `${category.replace(/-/g, "_")}_events`;

  const loadEvents = useCallback(async () => {
    if (!tableName) return;
    setEventLoading(true);
    setEventError(null);
    try {
      const result = await fetchEventPage(
        tableName, currentPage, selectedCity, dateRange.start, dateRange.end, countryScope
      );
      setEventPage(result);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setEventError(err.message || "Failed to load events");
    } finally {
      setEventLoading(false);
    }
  }, [tableName, currentPage, selectedCity, dateRange.start, dateRange.end, countryScope]);

  const loadCities = useCallback(async () => {
    if (!tableName) return;
    try {
      const cities = await fetchAvailableCities(tableName, countryScope);
      setAvailableCities(cities);
    } catch {
      setAvailableCities([]);
    }
  }, [tableName, countryScope]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedCity("all");
    setDateRange({ start: "", end: "" });
    setCountryScope("United States");
    setEventPage({ items: [], total: 0 });
  }, [category]);

  const loading = eventLoading;

  const cityOptionGroups = useMemo<FilterGroup[]>(() => {
    const available = availableCities;

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
  }, [availableCities]);

  const normCity = selectedCity;
  const normActive = normCity === "all" ? "all" : normalizeCity(normCity);

  const filteredItems = useMemo(() => {
    if (!tableName) return [];
    return eventPage.items.map((e) => ({
      _id: e.ticketmaster_id || e._id,
      id: e.ticketmaster_id || e._id,
      title: e.title,
      category: category,
      description: e.venue || "",
      coverImage: e.image_url || "",
      eventDate: e.event_date ? new Date(e.event_date).getTime() : undefined,
      city: e.city || "",
      countryScope: e.region === "US" ? "United States" : "International" as CountryScope,
      url: e.ticket_url || "",
    }));
  }, [tableName, eventPage, category]);

  useEffect(() => {
    setCurrentPage(1);
    setEventPage({ items: [], total: 0 });
  }, [selectedCity, dateRange, countryScope]);

  const formatDt = (ts: number) => {
    const d = new Date(ts);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  };

  const { leftColumnItems, rightColumnItems } = useMemo(() => {
    const mid = Math.ceil(filteredItems.length / 2);
    return {
      leftColumnItems: filteredItems.slice(0, mid),
      rightColumnItems: filteredItems.slice(mid),
    };
  }, [filteredItems]);

  const totalPages = Math.max(1, Math.ceil(eventPage.total / ITEMS_PER_PAGE));

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

  const renderCard = (item: any, n: number) => (
    <a
      key={item._id}
      href={item.url || "/performance/" + item.category + "/" + item._id}
      target={item.url ? "_blank" : "_self"}
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

  return (
    <main className="min-h-screen bg-white">
      {HEADER}
      <div className="mx-auto max-w-6xl px-4 py-2 text-center">
        <p className="text-xs text-gray-400">
          Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster.
        </p>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="border-l-4 border-hmc-orange pl-3">
          <span className="text-sm font-semibold text-gray-700">{categoryLabel} Events</span>
          <span className="ml-2 text-sm text-gray-500">{loading ? "..." : eventPage.total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-6xl px-4 pb-4">
        {/* All filters in one row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region tabs — hidden for Musical (Broadway is US-only) */}
          {category !== "musical" && (["United States", "International"] as CountryScope[]).map((scope) => (
            <button
              key={scope}
              onClick={() => {
                setCountryScope(scope);
              }}
              className={regionTabClass(countryScope === scope)}
            >
              {scope}
            </button>
          ))}

          {/* Category dropdown - right after International tab */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/performance/${e.target.value}`);
                }
              }}
              className="h-10 border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 appearance-none cursor-pointer"
            >
              <option value="opera">Opera</option>
              <option value="musical">Musical</option>
              <option value="classical">Classical</option>
              <option value="concert">Concert</option>
              <option value="electronic">Electronic</option>
              <option value="pop">Pop</option>
              <option value="rock">Rock</option>
              <option value="hip-hop-rap">Hip-Hop/Rap</option>
              <option value="country">Country</option>
              <option value="latin">Latin</option>
              <option value="dance">Dance</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* City dropdown with input support */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-10 border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 appearance-none cursor-pointer"
            >
              <option value="all">All cities</option>
              {cityOptionGroups.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </optgroup>
              ))}
              <optgroup label="Other">
                <option value="__custom__">+ Enter custom city...</option>
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Custom city input - shown when user selects "+ Enter custom city..." */}
          {selectedCity === "__custom__" && (
            <input
              type="text"
              value=""
              onChange={(e) => setSelectedCity(e.target.value)}
              placeholder="Type city name..."
              className="h-10 w-32 border border-gray-300 bg-white py-2 pl-4 pr-4 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 rounded"
              autoFocus
            />
          )}

          {/* Date range picker */}
          <DateRangePicker
            startDate={dateRange.start}
            endDate={dateRange.end}
            onStartDateChange={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
            onEndDateChange={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
          />

          {/* This Weekend quick button */}
          <button
            onClick={() => {
              const today = new Date();
              const day = today.getDay();
              const diffToSaturday = day === 6 ? 0 : day === 0 ? -1 : 6 - day;
              const saturday = new Date(today);
              saturday.setDate(today.getDate() + diffToSaturday);
              saturday.setHours(0, 0, 0, 0);
              const sunday = new Date(saturday);
              sunday.setDate(saturday.getDate() + 1);
              sunday.setHours(23, 59, 59, 999);
              const satStr = saturday.toISOString().split("T")[0];
              const sunStr = sunday.toISOString().split("T")[0];
              if (dateRange.start === satStr && dateRange.end === sunStr) {
                setDateRange({ start: "", end: "" });
              } else {
                setDateRange({ start: satStr, end: sunStr });
              }
            }}
            className={"h-10 rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2 border " + (dateRange.start && dateRange.end ? "bg-hmc-orange text-white border-hmc-orange" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400")}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            This Weekend
          </button>
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
