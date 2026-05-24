"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Production {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
}

const SUBCATEGORIES = [
  { value: "musical", label: "Musical" },
  { value: "opera", label: "Opera" },
  { value: "concert", label: "Concert" },
  { value: "edm", label: "EDM" },
  { value: "rock-roll", label: "Rock & Roll" },
  { value: "festival", label: "Festival" },
  { value: "ballet", label: "Ballet" },
  { value: "tourist-performance", label: "Tourist Performance" },
  { value: "others", label: "Others" },
];

export default function PerformanceCategoryPage() {
  const params = useParams();
  const [items, setItems] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  const loadData = () => {
    const category = params.category as string;
    if (!category) return;

    const sub = SUBCATEGORIES.find((c) => c.value === category);
    setCategoryName(sub?.label || category);
    
    try {
      const stored = localStorage.getItem("admin_performance");
      if (stored) {
        const data = JSON.parse(stored);
        const filtered = data.filter((item: Production) => 
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
  }, [params.category]);

  useEffect(() => {
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [params.category]);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">{categoryName}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p>No {categoryName.toLowerCase()} performances yet.</p>
            <Link href="/performance" className="mt-4 inline-block text-[#D96A32] hover:underline">← Back to Performance</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <a 
                key={item.id} 
                href={`/performance/${item.category}/${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm hover:shadow-md cursor-pointer"
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
