"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { PERFORMANCE_CATEGORY_OPTIONS } from "@/lib/constants";

interface Production {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
  venue?: string;
  city?: string;
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

type DisplayStatus = "upcoming" | "recent" | "archived";

const ITEMS_PER_PAGE = 20;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const CUSTOM_CITY_VALUE = "__custom_city__";
const GLOBAL_CITY_GROUPS = [
  {
    label: "North America",
    cities: [
      "Atlanta",
      "Boston",
      "Chicago",
      "Dallas",
      "Denver",
      "Detroit",
      "Houston",
      "Las Vegas",
      "Los Angeles",
      "Mexico City",
      "Miami",
      "Minneapolis",
      "Montreal",
      "Nashville",
      "New York",
      "Philadelphia",
      "San Francisco",
      "Seattle",
      "Toronto",
      "Vancouver",
      "Washington",
    ],
  },
  {
    label: "Europe",
    cities: [
      "Amsterdam",
      "Athens",
      "Barcelona",
      "Berlin",
      "Brussels",
      "Budapest",
      "Copenhagen",
      "Dublin",
      "Edinburgh",
      "Frankfurt",
      "Geneva",
      "Istanbul",
      "Lisbon",
      "London",
      "Madrid",
      "Milan",
      "Munich",
      "Paris",
      "Prague",
      "Rome",
      "Stockholm",
      "Vienna",
      "Warsaw",
      "Zurich",
    ],
  },
  {
    label: "Asia",
    cities: [
      "Bangkok",
      "Beijing",
      "Delhi",
      "Dubai",
      "Hong Kong",
      "Jakarta",
      "Kuala Lumpur",
      "Manila",
      "Mumbai",
      "Osaka",
      "Seoul",
      "Shanghai",
      "Singapore",
      "Taipei",
      "Tokyo",
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
];

function getDisplayStatus(eventDate?: string): DisplayStatus {
  if (!eventDate) return "upcoming";
  const eventTime = new Date(eventDate).getTime();
  const now = Date.now();
  if (eventTime > now) return "upcoming";
  const elapsed = now - eventTime;
  if (elapsed <= TWO_WEEKS_MS) return "recent";
  return "archived";
}

function isVisible(eventDate?: string): boolean {
  const status = getDisplayStatus(eventDate);
  return status !== "archived";
}

function normalizeCity(city?: string): string {
  return city?.trim().toLowerCase() ?? "";
}

function getTimeFilterLabel(value: TimeFilter): string {
  switch (value) {
    case "week":
      return "Next 7 days";
    case "month":
      return "Next 30 days";
    default:
      return "All time";
  }
}

function matchesTimeFilter(eventDate: string | undefined, filter: TimeFilter): boolean {
  if (filter === "all") return true;
  if (!eventDate) return false;

  const eventTime = new Date(eventDate).getTime();
  if (Number.isNaN(eventTime)) return false;

  const now = Date.now();
  if (eventTime < now) return false;

  const maxRange = filter === "week" ? ONE_WEEK_MS : ONE_MONTH_MS;
  return eventTime - now <= maxRange;
}

export default function PerformanceCategoryPage() {
  const params = useParams();
  const [items, setItems] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCity, setSelectedCity] = useState("all");
  const [customCity, setCustomCity] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  useEffect(() => {
    const loadData = async () => {
      const category = params.category as string;
      if (!category) return;

      const sub = PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === category);
      setCategoryName(sub?.label || category);

      try {
        const res = await fetch("/data/ticketmaster-events.json");
        if (res.ok) {
          const data = await res.json();
          const filtered = (data.events || [])
            .filter((item: Production) => item.category === category)
            .filter((item: Production) => isVisible(item.eventDate));
          if (filtered.length > 0) {
            setItems(filtered);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error("Error loading from API:", e);
      }

      try {
        const stored = localStorage.getItem("admin_performance");
        if (stored) {
          const data = JSON.parse(stored);

          const OLD_TO_NEW: Record<string, string> = {
            "opera": "legend-hall-of-fame",
            "concert": "musical",
            "rock-roll": "classical",
            "tourist-performance": "edm",
          };
          let migrated = false;
          const updated = data.map((item: Production) => {
            const newCat = OLD_TO_NEW[item.category];
            if (newCat) {
              migrated = true;
              return { ...item, category: newCat };
            }
            return item;
          });
          if (migrated) {
            localStorage.setItem("admin_performance", JSON.stringify(updated));
          }

          const filtered = updated.filter(
            (item: Production) =>
              item.category === category && item.status !== "draft" && isVisible(item.eventDate)
          );
          setItems(filtered);
        }
      } catch (e) {
        console.error("Error loading:", e);
      }
      setLoading(false);
    };

    loadData();
  }, [params.category]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedCity("all");
    setCustomCity("");
    setTimeFilter("all");
  }, [params.category]);

  const cityOptionGroups = useMemo<FilterGroup[]>(() => {
    const availableCities = Array.from(
      new Set(items.map((item) => item.city?.trim()).filter((city): city is string => Boolean(city)))
    ).sort((a, b) => a.localeCompare(b));

    const availableByNormalized = new Map(availableCities.map((city) => [normalizeCity(city), city]));
    const assignedCities = new Set<string>();

    const groupedOptions = GLOBAL_CITY_GROUPS.map((group) => {
      const options = group.cities
        .map((city) => availableByNormalized.get(normalizeCity(city)) ?? city)
        .filter((city, index, arr) => {
          const normalized = normalizeCity(city);
          const isFirstInGroup = arr.findIndex((entry) => normalizeCity(entry) === normalized) === index;
          if (!isFirstInGroup || assignedCities.has(normalized)) {
            return false;
          }
          assignedCities.add(normalized);
          return true;
        })
        .sort((a, b) => a.localeCompare(b))
        .map((city) => ({ value: city, label: city }));

      return {
        label: group.label,
        options,
      };
    }).filter((group) => group.options.length > 0);

    const otherCities = availableCities
      .filter((city) => !assignedCities.has(normalizeCity(city)))
      .map((city) => ({ value: city, label: city }));

    if (otherCities.length > 0) {
      groupedOptions.push({
        label: "Other cities in results",
        options: otherCities,
      });
    }

    groupedOptions.push({
      label: "Custom",
      options: [{ value: CUSTOM_CITY_VALUE, label: "Other city..." }],
    });

    return groupedOptions;
  }, [items]);

  const normalizedCustomCity = customCity.trim();
  const activeCityValue = selectedCity === CUSTOM_CITY_VALUE ? normalizedCustomCity : selectedCity;
  const normalizedActiveCity = activeCityValue === "all" ? "all" : normalizeCity(activeCityValue);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const cityMatches =
        normalizedActiveCity === "all" || normalizeCity(item.city) === normalizedActiveCity;
      const timeMatches = matchesTimeFilter(item.eventDate, timeFilter);
      return cityMatches && timeMatches;
    });
  }, [items, normalizedActiveCity, timeFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, customCity, timeFilter]);

  const formatDate = (d?: string) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const renderEventCard = (item: Production, itemNumber: number) => (
    <a
      key={item.id}
      href={`/performance/${item.category}/${item.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 transition-all duration-300 hover:border-[#D96A32]/40 hover:shadow-lg hover:shadow-[#D96A32]/5"
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
          <h3 className="flex-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-[#D96A32]">
            {item.title}
          </h3>
          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-500 transition-colors group-hover:bg-[#D96A32] group-hover:text-white">
            {itemNumber}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {item.eventDate && (
            <span className="inline-flex items-center gap-1 font-semibold text-[#D96A32]">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(item.eventDate)}
            </span>
          )}
          {item.city && <span>{item.city}</span>}
        </div>
        {item.venue && <p className="mt-1 truncate text-xs text-gray-400">{item.venue}</p>}
      </div>
    </a>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-t border-[#D96A32]">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">{categoryName}</h1>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
          </p>
        </div>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-t border-[#D96A32]">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">{categoryName}</h1>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
          </p>
        </div>
        <div className="py-20 text-center text-gray-500">
          <p>No {categoryName.toLowerCase()} performances yet.</p>
          <Link href="/performance" className="mt-4 inline-block text-[#D96A32] hover:underline">
            ← Back to Performance
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">{categoryName}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-4">
        <p className="text-center text-xs leading-relaxed text-gray-500">
          Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-2xl border border-[#D96A32]/15 bg-[#FFF7F3] p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                <span>City</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#D96A32] focus:ring-2 focus:ring-[#D96A32]/20"
                >
                  <option value="all">All cities</option>
                  {cityOptionGroups.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                <span>Time</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#D96A32] focus:ring-2 focus:ring-[#D96A32]/20"
                >
                  <option value="all">All time</option>
                  <option value="week">Next 7 days</option>
                  <option value="month">Next 30 days</option>
                </select>
              </label>
            </div>

            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-gray-600">
              <span className="font-semibold text-[#D96A32]">{filteredItems.length}</span> events
              <span className="mx-2 text-gray-300">•</span>
              <span>{selectedCity === "all" ? "All cities" : selectedCity === CUSTOM_CITY_VALUE ? normalizedCustomCity || "Custom city" : selectedCity}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span>{getTimeFilterLabel(timeFilter)}</span>
            </div>
          </div>

          {selectedCity === CUSTOM_CITY_VALUE && (
            <div className="mt-4 max-w-md">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                <span>Enter city name</span>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Type a city not listed above"
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[#D96A32] focus:ring-2 focus:ring-[#D96A32]/20"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-gray-800">No matching performances</h2>
            <p className="mt-2 text-sm text-gray-500">
              Try another city or widen the time range to see more upcoming events.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl px-4 pb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1.5 bg-[#D96A32]"></div>
              <h2 className="text-base font-bold uppercase tracking-wider text-gray-800">All Events</h2>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400">{filteredItems.length}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 via-transparent to-transparent"></div>
            </div>

            <div className="relative">
              <div className="absolute bottom-0 left-1/2 top-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#D96A32]/30 to-transparent lg:block"></div>

              <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#D96A32]/30 bg-white shadow-sm">
                  <span className="text-xs font-bold text-[#D96A32]">{currentPage}/{totalPages}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-3">
                  {leftColumnItems.map((item, idx) => {
                    const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    return renderEventCard(item, itemNumber);
                  })}
                </div>

                <div className="space-y-3">
                  {rightColumnItems.map((item, idx) => {
                    const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + leftColumnItems.length + idx + 1;
                    return renderEventCard(item, itemNumber);
                  })}
                </div>
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mx-auto max-w-6xl px-4 pb-12">
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#D96A32] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-3 py-1.5 text-sm ${currentPage === 1 ? "font-semibold text-[#D96A32]" : "text-gray-600 hover:text-[#D96A32]"}`}
                >
                  «
                </button>
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      className={`h-9 min-w-[36px] rounded px-2 text-sm ${
                        currentPage === page
                          ? "bg-[#D96A32] font-medium text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1.5 text-sm ${currentPage === totalPages ? "font-semibold text-[#D96A32]" : "text-gray-600 hover:text-[#D96A32]"}`}
                >
                  »
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#D96A32] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
