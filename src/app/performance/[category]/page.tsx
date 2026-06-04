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
        const filtered = (data.events || []).filter((item: Production) => item.category === category);
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
          item.category === category && item.status !== "draft"
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

  // Featured items: first 4 from the full list
  const featuredItems = useMemo(() => items.slice(0, FEATURED_COUNT), [items]);

  // List items: paginated, excluding featured
  const listItems = useMemo(() => {
    const listStart = FEATURED_COUNT + (currentPage - 1) * ITEMS_PER_PAGE;
    return items.slice(listStart, listStart + ITEMS_PER_PAGE);
  }, [items, currentPage]);

  const totalPages = Math.ceil(Math.max(0, items.length - FEATURED_COUNT) / ITEMS_PER_PAGE);

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

      {/* Featured + List Layout */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Featured Cards (2x2 grid) */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredItems.map((item, idx) => (
                <a
                  key={item.id}
                  href={`/performance/${item.category}/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]"
                >
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/80">
                      {item.eventDate && <span>{formatDate(item.eventDate)}</span>}
                      {item.venue && <span className="truncate">@{item.venue}</span>}
                    </div>
                  </div>
                  {idx < 2 && (
                    <span className="absolute top-3 left-3 bg-[#D96A32] text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                      FEATURED
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right: List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-hmc-placeholder-border bg-white divide-y divide-gray-100">
              {listItems.map((item) => (
                <a
                  key={item.id}
                  href={`/performance/${item.category}/${item.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-[#C8102E]">
                      {item.title}
                    </h4>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                      {item.eventDate && <span>{formatDate(item.eventDate)}</span>}
                      {item.city && <span className="truncate">{item.city}</span>}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
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
