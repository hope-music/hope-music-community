"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { STAGE_PRODUCTION_CATEGORY_LABELS, STAGE_PRODUCTION_CATEGORY_OPTIONS } from "@/lib/constants";

interface StageProduction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
}

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  sets: "stage",
  sound: "audio",
  projection: "video",
  scenery: "effects",
};

export default function StageProductionCategoryPage() {
  const params = useParams();
  const [items, setItems] = useState<StageProduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const category = params.category as string;
    if (!category) {
      return;
    }

    setCategoryName(STAGE_PRODUCTION_CATEGORY_LABELS[category] || category);

    try {
      const stored = localStorage.getItem("admin_stage_production");
      if (stored) {
        const data = JSON.parse(stored);
        const normalized = data.map((item: StageProduction) => ({
          ...item,
          category: LEGACY_CATEGORY_MAP[item.category] ?? item.category,
        }));
        setItems(normalized.filter((item: StageProduction) => item.category === category && item.status !== "draft"));
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error loading stage production category:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [params.category]);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange"><div className="mx-auto max-w-6xl px-4 py-6 text-center"><h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">{categoryName}</h1></div></div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? <div className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div></div> : items.length === 0 ? <div className="py-20 text-center text-gray-500"><p>No items found in this section.</p><Link href="/stage-production" className="mt-4 inline-block text-hmc-orange hover:underline">← Back</Link></div> : (
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
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${category.value === (params.category as string) ? "border-hmc-orange bg-hmc-orange text-white" : "border-hmc-orange/20 bg-hmc-orange/5 text-hmc-orange hover:bg-hmc-orange hover:text-white"}`}
                  >
                    {category.label} {count > 0 ? `(${count})` : ""}
                  </Link>
                );
              })}
            </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/stage-production/${item.category}/${item.id}`} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm hover:shadow-md">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">{item.coverImage ? <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gray-200"><span className="text-gray-400">No Image</span></div>}</div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-semibold text-hmc-text group-hover:text-hmc-red">{item.title}</h3>
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
