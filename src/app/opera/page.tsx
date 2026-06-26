"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
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

type CountryScope = "US" | "international" | "all";

const ITEMS_PER_PAGE = 20;

function matchesDateRange(eventDate: string | null, start: string, end: string): boolean {
  if (!eventDate) return false;

  const eventTs = new Date(eventDate).getTime();
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  if (eventTs < thirtyDaysAgo) return false;

  // If no date range is selected, show all
  if (!start && !end) return true;

  const eventDay = new Date(eventDate);
  eventDay.setHours(0, 0, 0, 0);

  if (start) {
    const startDay = new Date(start);
    startDay.setHours(0, 0, 0, 0);
    if (eventDay < startDay) return false;
  }

  if (end) {
    const endDay = new Date(end);
    endDay.setHours(23, 59, 59, 999);
    if (eventDay > endDay) return false;
  }

  return true;
}

function regionTabClass(active: boolean): string {
  const base = "px-5 py-2 text-sm font-medium transition-colors rounded";
  if (active) {
    return base + " bg-hmc-orange/10 text-hmc-orange";
  }
  return base + " bg-gray-100 text-gray-600 hover:bg-gray-200";
}

export default function OperaPage() {
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" });
  const [countryScope, setCountryScope] = useState<CountryScope>("all");
  const [allEvents, setAllEvents] = useState<OperaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Supabase environment variables not configured");
        }
        
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase
          .from("opera_events")
          .select("*")
          .order("event_date", { ascending: true });
        
        if (error) throw error;
        setAllEvents(data || []);
      } catch (err: any) {
        console.error("Failed to fetch opera events:", err);
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const availableCountries = useMemo(() => {
    if (!allEvents) return [];
    const countries = new Set<string>();
    allEvents.forEach((e) => {
      if (e.country) countries.add(e.country);
    });
    return Array.from(countries).sort();
  }, [allEvents]);

  const filteredItems = useMemo(() => {
    if (!allEvents) return [];

    return allEvents.filter((item) => {
      // Region filter
      if (countryScope !== "all") {
        if (item.region !== countryScope) return false;
      }

      // Country filter
      if (selectedCountry !== "all") {
        if (item.country !== selectedCountry) return false;
      }

      // Date range filter
      if (!matchesDateRange(item.event_date, dateRange.start, dateRange.end)) return false;

      return true;
    });
  }, [allEvents, countryScope, selectedCountry, dateRange]);

  const formatDt = (dateStr: string | null) => {
    if (!dateStr) return { date: "TBA", time: "" };
    const d = new Date(dateStr);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry, dateRange, countryScope]);

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

  const renderCard = (item: OperaEvent, n: number) => (
    <a
      key={item.ticketmaster_id}
      href={item.ticket_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 transition-all duration-300 hover:border-hmc-orange/40 hover:shadow-lg hover:shadow-hmc-orange/5"
    >
      <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {item.image_url ? (
          <Image
            src={item.image_url}
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
          {item.event_date ? (
            <>
              <span className="inline-flex items-center gap-1 font-semibold text-hmc-orange">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDt(item.event_date).date}
              </span>
              {formatDt(item.event_date).time && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDt(item.event_date).time}
                </span>
              )}
            </>
          ) : null}
          {item.city ? <span>{item.city}</span> : null}
          {item.country ? (
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">{item.country}</span>
          ) : null}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {item.price_min !== null && item.price_max !== null ? (
            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              ${item.price_min} - ${item.price_max} {item.currency}
            </span>
          ) : item.price_min !== null ? (
            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              From ${item.price_min} {item.currency}
            </span>
          ) : null}
          {item.ticket_url ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(item.ticket_url!, "_blank", "noopener,noreferrer"); }}
              className="inline-flex w-fit items-center gap-1 rounded bg-hmc-orange px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90 cursor-pointer"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Buy Tickets
            </button>
          ) : null}
        </div>
      </div>
    </a>
  );

  const HEADER = (
    <div className="border-b border-t border-hmc-orange">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">OPERA</h1>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-4 text-center">
        <p className="text-xs text-gray-400">
          Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster.
        </p>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="border-l-4 border-hmc-orange pl-3">
          <span className="text-sm font-semibold text-gray-700">Opera Events</span>
          <span className="ml-2 text-sm text-gray-500">{allEvents ? allEvents.length : 0}</span>
        </div>
      </div>
    </div>
  );

  const [subRegion, setSubRegion] = useState<string>("all");

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

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        {HEADER}
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="mb-2 text-lg font-semibold">Failed to load Opera events</h2>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {HEADER}
      <div className="mx-auto max-w-6xl px-4 py-2 text-center">
        <p className="text-xs text-gray-400">
          Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster.
        </p>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-6xl px-4 pb-4">
        {/* All filters in one row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region tabs */}
          {(["US", "international"] as CountryScope[]).map((scope) => (
            <button
              key={scope}
              onClick={() => {
                setCountryScope(scope);
                setSubRegion("all");
              }}
              className={regionTabClass(countryScope === scope)}
            >
              {scope === "US" ? "United States" : "International"}
            </button>
          ))}

          {/* Category dropdown - right after International tab */}
          <div className="relative">
            <select
              value={pathname && pathname.includes("opera") ? "opera" : pathname && pathname.includes("musical") ? "musical" : pathname && pathname.includes("classical") ? "classical" : pathname && pathname.includes("dance") ? "dance" : pathname && pathname.includes("music") ? "music" : pathname && pathname.includes("electronic") ? "electronic" : pathname && pathname.includes("pop-rock") ? "pop-rock" : pathname && pathname.includes("performance-art") ? "performance-art" : "other"}
              onChange={(e) => {
                if (e.target.value) {
                  router.push(`/performance/${e.target.value}`);
                }
              }}
              className="h-10 border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 appearance-none cursor-pointer rounded"
            >
              <option value="opera">Opera</option>
              <option value="musical">Musical</option>
              <option value="classical">Classical</option>
              <option value="music">Music</option>
              <option value="electronic">Electronic</option>
              <option value="pop-rock">Pop & Rock</option>
              <option value="performance-art">Performance Art</option>
              <option value="dance">Dance</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Country dropdown with input support */}
          <div className="relative">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="h-10 border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 appearance-none cursor-pointer"
            >
              <option value="all">All countries</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__custom__">+ Enter custom country...</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {/* Custom country input */}
          {selectedCountry === "__custom__" && (
            <input
              type="text"
              value=""
              onChange={(e) => setSelectedCountry(e.target.value)}
              placeholder="Type country name..."
              className="h-10 w-36 border border-gray-300 bg-white py-2 pl-4 pr-4 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20 rounded"
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
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredItems.length} events
        </div>
        <div className="relative">
          <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-hmc-orange/30 to-transparent lg:block"></div>
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-hmc-orange/30 bg-white shadow-sm">
              <span className="text-xs font-bold text-hmc-orange">{currentPage}/{totalPages}</span>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-20 text-center text-gray-500">
              <p>No matching opera events found.</p>
              <button
                onClick={() => {
                  setCountryScope("all");
                  setSelectedCountry("all");
                  setTimeFilter("all");
                }}
                className="mt-4 inline-block text-hmc-orange hover:underline"
              >
                ← Clear filters
              </button>
            </div>
          ) : (
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
          )}
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
