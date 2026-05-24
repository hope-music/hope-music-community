"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Interaction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
}

const CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "music", label: "Music" },
  { value: "production", label: "Production" },
  { value: "resources", label: "Resources" },
  { value: "other", label: "Other" },
];

export default function InteractionCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const [items, setItems] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    params.then(({ category }) => {
      setCategoryName(CATEGORIES.find((c) => c.value === category)?.label || category);
      const stored = localStorage.getItem("admin_interaction");
      if (stored) {
        const data = JSON.parse(stored);
        setItems(data.filter((item: Interaction) => item.category === category));
      }
      setLoading(false);
    });
  }, [params]);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]"><div className="mx-auto max-w-6xl px-4 py-6 text-center"><h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">{categoryName}</h1></div></div>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? <div className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div></div> : items.length === 0 ? <div className="py-20 text-center text-gray-500"><p>No {categoryName.toLowerCase()} items yet.</p><Link href="/interaction" className="mt-4 inline-block text-[#D96A32] hover:underline">← Back</Link></div> : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/interaction/${item.category}/${item.id}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm hover:shadow-md">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">{item.coverImage ? <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-gray-200"><span className="text-gray-400">No Image</span></div>}</div>
                <div className="flex flex-1 flex-col gap-2 p-4"><h3 className="text-sm font-semibold text-hmc-text group-hover:text-[#C8102E]">{item.title}</h3>{item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description.replace(/<[^>]*>/g, "")}</p>}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
