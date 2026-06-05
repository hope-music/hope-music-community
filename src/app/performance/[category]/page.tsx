"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

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

const SUBCATEGORIES = [
  { value: "legend-hall-of-fame", label: "Legend Hall of Fame" },
  { value: "musical", label: "Musical" },
  { value: "classical", label: "Classical" },
  { value: "edm", label: "EDM" },
  { value: "legendary-rock", label: "Legendary Rock" },
  { value: "legendary-pop", label: "Legendary Pop" },
  { value: "festival", label: "Festival" },
  { value: "ballet", label: "Ballet" },
  { value: "others", label: "Others" },
];

const ITEMS_PER_PAGE = 20;
const FEATURED_COUNT = 4;

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

type DisplayStatus = "upcoming" | "recent" | "archived";

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

export default function PerformanceCategoryPage() {
  const params = useParams();
  const [items, setItems] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    const category = params.category as string;
    if (!category) return;

    const sub = SUBCATEGORIES.find((c) => c.value === category);
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

        const filtered = updated.filter((item: Production) =>
          item.category === category &&
          item.status !== "draft" &&
          isVisible(item.eventDate)
        );
        setItems(filtered);
      }
    } catch (e) {
      console.error("Error loading:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [params.category]);

  const formatDate = (d?: string) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Split items into two columns (top half / bottom half)
  const { leftColumnItems, rightColumnItems } = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = items.slice(start, start + ITEMS_PER_PAGE);
    const mid = Math.ceil(pageItems.length / 2);
    return {
      leftColumnItems: pageItems.slice(0, mid),
      rightColumnItems: pageItems.slice(mid),
    };
  }, [items, currentPage]);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  // Pagination: show up to 5 page numbers with ellipsis
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

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="border-b border-t border-[#D96A32]">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">{categoryName}</h1>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
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
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
          </p>
        </div>
        <div className="py-20 text-center text-gray-500">
          <p>No {categoryName.toLowerCase()} performances yet.</p>
          <Link href="/performance" className="mt-4 inline-block text-[#D96A32] hover:underline">← Back to Performance</Link>
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
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Notice: This is a free informational guide only — we do not sell tickets. Schedules may not reflect real-time changes. For tickets and latest updates, visit Ticketmaster. Images shown are for artistic ambience illustration, not necessarily the actual event.
        </p>
      </div>

      {/* All Events Layout */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-1.5 bg-[#D96A32]"></div>
          <h2 className="text-base font-bold uppercase tracking-wider text-gray-800">All Events</h2>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{items.length}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-transparent to-transparent"></div>
        </div>

        {/* Two-column grid with divider */}
        <div className="relative">
          {/* Vertical Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#D96A32]/30 to-transparent -translate-x-1/2 hidden lg:block"></div>

          {/* Center Circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-[#D96A32]/30 flex items-center justify-center shadow-sm">
              <span className="text-[#D96A32] font-bold text-xs">{currentPage}/{totalPages}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column */}
            <div className="space-y-3">
              {leftColumnItems.map((item, idx) => {
                const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <a
                    key={item.id}
                    href={`/performance/${item.category}/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 p-3 rounded-2xl border border-gray-100 bg-white hover:border-[#D96A32]/40 hover:shadow-lg hover:shadow-[#D96A32]/5 transition-all duration-300"
                  >
                    <div className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
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
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="flex-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#D96A32] transition-colors">
                          {item.title}
                        </h3>
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-[10px] font-medium text-gray-500 group-hover:bg-[#D96A32] group-hover:text-white transition-colors">
                          {itemNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {item.eventDate && (
                          <span className="inline-flex items-center gap-1 text-[#D96A32] font-semibold">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(item.eventDate)}
                          </span>
                        )}
                        {item.city && <span>{item.city}</span>}
                      </div>
                      {item.venue && (
                        <p className="mt-1 text-xs text-gray-400 truncate">{item.venue}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {rightColumnItems.map((item, idx) => {
                const itemNumber = (currentPage - 1) * ITEMS_PER_PAGE + leftColumnItems.length + idx + 1;
                return (
                  <a
                    key={item.id}
                    href={`/performance/${item.category}/${item.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 p-3 rounded-2xl border border-gray-100 bg-white hover:border-[#D96A32]/40 hover:shadow-lg hover:shadow-[#D96A32]/5 transition-all duration-300"
                  >
                    <div className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
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
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="flex-1 text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#D96A32] transition-colors">
                          {item.title}
                        </h4>
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-[10px] font-medium text-gray-500 group-hover:bg-[#D96A32] group-hover:text-white transition-colors">
                          {itemNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {item.eventDate && (
                          <span className="inline-flex items-center gap-1 text-[#D96A32] font-semibold">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(item.eventDate)}
                          </span>
                        )}
                        {item.city && <span>{item.city}</span>}
                      </div>
                      {item.venue && (
                        <p className="mt-1 text-xs text-gray-400 truncate">{item.venue}</p>
                      )}
                    </div>
                  </a>
                );
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
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#D96A32] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-1.5 text-sm ${currentPage === 1 ? "text-[#D96A32] font-semibold" : "text-gray-600 hover:text-[#D96A32]"}`}
            >
              «
            </button>
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className={`min-w-[36px] h-9 px-2 text-sm rounded ${
                    currentPage === page
                      ? "bg-[#D96A32] text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`px-3 py-1.5 text-sm ${currentPage === totalPages ? "text-[#D96A32] font-semibold" : "text-gray-600 hover:text-[#D96A32]"}`}
            >
              »
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-[#D96A32] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
