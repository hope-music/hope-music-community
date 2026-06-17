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
  url?: string;
  sourceUrl?: string;
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
type PastFilter = "recent" | "all";

const ITEMS_PER_PAGE = 20;
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
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

function getEventDateStr(eventDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return eventDate;
  }
  const d = new Date(eventDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function matchesPastFilter(eventDate?: string, filter: PastFilter): boolean {
  if (!eventDate) return false;
  const eventDateStr = getEventDateStr(eventDate);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (eventDateStr >= todayStr) return false;
  if (filter === "all") return true;
  const diff = now.getTime() - new Date(eventDateStr).getTime();
  return diff <= THREE_MONTHS_MS;
}

function normalizeCity(city?: string): string {
  return city?.trim().toLowerCase() ?? "";
}

function getTimeFilterLabel(value: TimeFilter): string {
  switch (value) {
    case "week":
      return "This Week";
    case "month":
      return "This Month";
    default:
      return "All Time";
  }
}

function matchesTimeFilter(eventDate: string | undefined, filter: TimeFilter): boolean {
  if (!eventDate) return false;

  const eventDateStr = getEventDateStr(eventDate);
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (eventDateStr < todayStr) return false;
  if (filter === "all") return true;

  const maxRange = filter === "week" ? ONE_WEEK_MS : ONE_MONTH_MS;
  const eventTime = new Date(eventDateStr).getTime();
  const nowTime = now.getTime();
  return eventTime - nowTime <= maxRange;
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
  const [pastFilter, setPastFilter] = useState<PastFilter>("recent");
  const [viewMode, setViewMode] = useState<"upcoming" | "past">("upcoming");

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
            .filter((item: Production) => item.category === category);
          if (filtered.length > 0) {
            setItems(filtered);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
      }

      try {
        const stored = localStorage.getItem("admin_performance");
        if (stored) {
          const data = JSON.parse(stored);

          const OLD_TO_NEW: Record<string, string> = {
            "legend-hall-of-fame": "opera",
            "musical": "musical",
            "classical": "classical",
            "edm": "electronic",
            "legendary-rock": "pop-rock",
            "legendary-pop": "pop-rock",
            "festival": "other",
            "ballet": "dance",
            "drama": "performance-art",
            "others": "other",
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
              item.category === category && item.status !== "draft"
          );
          setItems(filtered);
        }
      } catch (e) {
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
    setPastFilter("recent");
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
    const result = items.filter((item) => {
      const cityMatches =
        normalizedActiveCity === "all" || normalizeCity(item.city) === normalizedActiveCity;
      const timeMatches = viewMode === "upcoming"
        ? matchesTimeFilter(item.eventDate, timeFilter)
        : matchesPastFilter(item.eventDate, pastFilter);
      return cityMatches && timeMatches;
    });

    if (viewMode === "upcoming") {
      return result.sort((a, b) => {
        const dateA = a.eventDate ? getEventDateStr(a.eventDate) : "9999-99-99";
        const dateB = b.eventDate ? getEventDateStr(b.eventDate) : "9999-99-99";
        return dateA.localeCompare(dateB);
      });
    } else {
      return result.sort((a, b) => {
        const dateA = a.eventDate ? getEventDateStr(a.eventDate) : "0000-00-00";
        const dateB = b.eventDate ? getEventDateStr(b.eventDate) : "0000-00-00";
        return dateB.localeCompare(dateA);
      });
    }
  }, [items, normalizedActiveCity, timeFilter, viewMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, customCity, timeFilter, pastFilter, viewMode]);

  const formatDateTime = (d?: string) => {
    if (!d) return { date: "", time: "" };
    const date = new Date(d);
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, day] = d.split("-").map(Number);
      const local = new Date(y, m - 1, day);
      return {
        date: local.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: ""
      };
    }
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
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
        {viewMode === "past" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rotate-[-20deg] rounded-full border-4 border-red-600 px-4 py-1 text-xl font-black uppercase tracking-wider text-red-600 shadow-sm">
              Past
            </span>
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
            {itemNumber}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {item.eventDate && (
            <>
              <span className="inline-flex items-center gap-1 font-semibold text-hmc-orange">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateTime(item.eventDate).date}
              </span>
              {formatDateTime(item.eventDate).time && (
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDateTime(item.eventDate).time}
                </span>
              )}
            </>
          )}
          {item.city && <span>{item.city}</span>}
        </div>
        {item.venue && <p className="mt-1 truncate text-xs text-gray-400">{item.venue}</p>}
        {(item.url || item.sourceUrl) && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(item.url || item.sourceUrl, "_blank", "noopener,noreferrer");
            }}
            className="mt-2 inline-flex w-fit items-center gap-1 rounded bg-hmc-orange px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-hmc-orange/90 cursor-pointer"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Buy Tickets
          </button>
        )}
      </div>
    </a>
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-t border-hmc-orange">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">{categoryName}</h1>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
          </p>
        </div>
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-t border-hmc-orange">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">{categoryName}</h1>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
          </p>
        </div>
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
      <div className="border-b border-t border-hmc-orange">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">{categoryName}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-4">
        <p className="text-center text-xs leading-relaxed text-gray-500">
          Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-2xl border border-hmc-orange/15 bg-[#FFF7F3] p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
                <span>City</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20"
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
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </label>
            </div>

            <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-gray-600">
              <span className="font-semibold text-hmc-orange">{filteredItems.length}</span> {viewMode === "upcoming" ? "upcoming" : "past"} events
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
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-hmc-orange focus:ring-2 focus:ring-hmc-orange/20"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="mx-auto max-w-6xl px-4 pb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-6 w-1.5 bg-hmc-orange"></div>
            <h2 className="text-base font-bold uppercase tracking-wider text-gray-800">Events</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("upcoming")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === "upcoming"
                    ? "bg-hmc-orange text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setViewMode("past")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  viewMode === "past"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                Past Events
              </button>
              {viewMode === "past" && (
                <>
                  <span className="mx-1 text-gray-300">·</span>
                  <button
                    onClick={() => setPastFilter("recent")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      pastFilter === "recent"
                        ? "bg-hmc-orange text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    Last 3 Months
                  </button>
                  <button
                    onClick={() => setPastFilter("all")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      pastFilter === "all"
                        ? "bg-hmc-orange text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    All Past
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-lg font-semibold text-gray-800">No {viewMode} performances found</h2>
            <p className="mt-2 text-sm text-gray-500">
              {viewMode === "upcoming"
                ? "Try another city or time range."
                : pastFilter === "recent"
                ? "No past performances within 3 months."
                : "No past performances available."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl px-4 pb-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1.5 bg-hmc-orange"></div>
              <h2 className="text-base font-bold uppercase tracking-wider text-gray-800">Events</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("upcoming")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    viewMode === "upcoming"
                      ? "bg-hmc-orange text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setViewMode("past")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    viewMode === "past"
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  Past Events
                </button>
                {viewMode === "past" && (
                  <>
                    <span className="mx-1 text-gray-300">·</span>
                    <button
                      onClick={() => setPastFilter("recent")}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        pastFilter === "recent"
                          ? "bg-hmc-orange text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      Last 3 Months
                    </button>
                    <button
                      onClick={() => setPastFilter("all")}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        pastFilter === "all"
                          ? "bg-hmc-orange text-white"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      All Past
                    </button>
                  </>
                )}
              </div>
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-400">{filteredItems.length}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-gray-200 via-transparent to-transparent"></div>
            </div>

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
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-hmc-orange disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`px-3 py-1.5 text-sm ${currentPage === 1 ? "font-semibold text-hmc-orange" : "text-gray-600 hover:text-hmc-orange"}`}
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
                          ? "bg-hmc-orange font-medium text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1.5 text-sm ${currentPage === totalPages ? "font-semibold text-hmc-orange" : "text-gray-600 hover:text-hmc-orange"}`}
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
        </>
      )}
    </main>
  );
}
