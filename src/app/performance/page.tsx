"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Production {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
  createdAt: number;
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

function loadItems(): Production[] {
  // Data will be loaded from JSON API, this returns empty initially
  return [];
}

async function loadItemsFromApi(): Promise<Production[]> {
  try {
    const res = await fetch("/data/ticketmaster-events.json");
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch (e) {
    console.error("Error loading events:", e);
    return [];
  }
}

export default function PerformancePage() {
  const [items, setItems] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadData = useCallback(async () => {
    const data = await loadItemsFromApi();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const itemsByCategory = SUBCATEGORIES.map((sub) => ({
    ...sub,
    items: items.filter((item) => item.category === sub.value),
  }));

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">Performance</h1>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap gap-1 py-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === "all"
                  ? "bg-[#D96A32] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All {items.length > 0 && `(${items.length})`}
            </button>
            {SUBCATEGORIES.map((sub) => {
              const count = itemsByCategory.find(c => c.value === sub.value)?.items.length || 0;
              return (
                <button
                  key={sub.value}
                  onClick={() => setSelectedCategory(sub.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedCategory === sub.value
                      ? "bg-[#D96A32] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {sub.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg">No performances available in this category.</p>
            <button onClick={() => setSelectedCategory("all")} className="mt-4 text-[#D96A32] hover:underline">
              View all performances
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <a
                key={item.id}
                href={`/performance/${item.category}/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[#D96A32]/10 px-2 py-0.5 text-xs font-medium text-[#D96A32]">
                      {SUBCATEGORIES.find((c) => c.value === item.category)?.label || item.category}
                    </span>
                    {item.status === "upcoming" && (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Upcoming</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors group-hover:text-[#C8102E]">
                    {item.title}
                  </h3>
                  {item.eventDate && (
                    <time className="text-xs text-hmc-text-muted">{formatDate(item.eventDate)}</time>
                  )}
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description.replace(/<[^>]*>/g, "")}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
