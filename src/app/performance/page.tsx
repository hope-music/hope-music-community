"use client";

import { useState, useEffect } from "react";
import { PERFORMANCE_CATEGORY_LABELS } from "@/lib/constants";

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

const FEATURED_STORAGE_KEY = "hmc_featured_performances";

function loadFeaturedIds(): string[] {
  try {
    const stored = localStorage.getItem(FEATURED_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
  }
  return [];
}

function saveFeaturedIds(ids: string[]) {
  localStorage.setItem(FEATURED_STORAGE_KEY, JSON.stringify(ids));
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function FeaturedPage() {
  const [featuredItems, setFeaturedItems] = useState<Production[]>([]);
  const [allItems, setAllItems] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const categories = [
          "musical", "opera", "classical", "music", "electronic",
          "pop-rock", "performance-art", "dance", "other",
        ];
        let allEvents: Production[] = [];

        for (const category of categories) {
          try {
            const res = await fetch(`/data/ticketmaster/${category}/events.json`);
            if (res.ok) {
              const data = await res.json();
              allEvents = allEvents.concat(data.events || []);
            }
          } catch (e) {
            // skip this category
          }
        }

        setAllItems(allEvents);

        const featuredIds = loadFeaturedIds();
        const featured = allEvents.filter((item: Production) => featuredIds.includes(item.id));
        setFeaturedItems(featured);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for storage changes (when admin updates featured list)
    const handleStorage = () => {
      const featuredIds = loadFeaturedIds();
      const featured = allItems.filter((item) => featuredIds.includes(item.id));
      setFeaturedItems(featured);
    };

    window.addEventListener("storage", handleStorage);
    // Also listen for custom event
    window.addEventListener("featuredUpdated", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("featuredUpdated", handleStorage);
    };
  }, [allItems.length]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div>
        </div>
      </main>
    );
  }

  if (featuredItems.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-t border-hmc-orange bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">Featured</h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-12">
            <div className="text-4xl mb-4">🎭</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-700">No Featured Performances</h2>
            <p className="text-gray-500">
              Check back later or browse all performances in the navigation menu.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-t border-hmc-orange bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">Featured</h1>
        </div>
      </div>

      {/* Featured Cards */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((item) => (
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
                  <span className="rounded bg-hmc-orange/10 px-2 py-0.5 text-xs font-medium text-hmc-orange">
                    {PERFORMANCE_CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  {item.status === "upcoming" && (
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">Upcoming</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors group-hover:text-hmc-red">
                  {item.title}
                </h3>
                {item.eventDate && (
                  <time className="text-xs text-hmc-text-muted">{formatDate(item.eventDate)}</time>
                )}
                {item.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {item.description.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
