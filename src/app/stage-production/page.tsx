"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { STAGE_PRODUCTION_CATEGORY_LABELS, STAGE_PRODUCTION_CATEGORY_OPTIONS } from "@/lib/constants";

interface StageProduction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
  createdAt: number;
}

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  sets: "stage",
  sound: "audio",
  projection: "video",
  scenery: "effects",
};

export default function StageProductionPage() {
  const [items, setItems] = useState<StageProduction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_stage_production");
      if (stored) {
        const data = JSON.parse(stored);
        const normalized = data.map((item: StageProduction) => ({
          ...item,
          category: LEGACY_CATEGORY_MAP[item.category] ?? item.category,
        }));
        setItems(normalized.filter((item: StageProduction) => item.status !== "draft"));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error loading stage productions:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">Stage Production</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="py-20 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div></div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-500"><p className="text-lg">No stage productions found.</p></div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              {STAGE_PRODUCTION_CATEGORY_OPTIONS.map((category) => {
                const count = items.filter((item) => item.category === category.value).length;
                return (
                  <Link
                    key={category.value}
                    href={`/stage-production/${category.value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-hmc-orange/20 bg-hmc-orange/5 px-3 py-1 text-sm font-medium text-hmc-orange transition-colors hover:bg-hmc-orange hover:text-white"
                  >
                    {category.label} {count > 0 ? `(${count})` : ""}
                  </Link>
                );
              })}
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/stage-production/${item.category}/${item.id}`} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {item.coverImage ? <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gray-200"><span className="text-gray-400">No Image</span></div>}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-hmc-orange/10 px-2 py-0.5 text-xs font-medium text-hmc-orange">{STAGE_PRODUCTION_CATEGORY_LABELS[item.category] || item.category}</span>
                    {item.status === "upcoming" && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Upcoming</span>}
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors group-hover:text-hmc-red">{item.title}</h3>
                  {item.eventDate && <time className="text-xs text-hmc-text-muted">{formatDate(item.eventDate)}</time>}
                  {item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description.replace(/<[^>]*>/g, "")}</p>}
                </div>
              </Link>
            ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
