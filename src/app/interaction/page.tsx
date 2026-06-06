"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { INTERACTION_CATEGORY_OPTIONS } from "@/lib/constants";
import {
  getInteractionCategoryLabel,
  normalizeInteractionItems,
  readInteractionItems,
} from "@/lib/interaction";

interface Interaction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  author: string;
  createdAt: number;
}

const CATEGORIES = INTERACTION_CATEGORY_OPTIONS;

export default function InteractionPage() {
  const [items, setItems] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(normalizeInteractionItems(readInteractionItems<Interaction>()));
    setLoading(false);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">Interaction</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="py-20 text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div></div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-gray-500"><p className="text-lg">No topics yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Link key={item.id} href={`/interaction/${item.category}/${item.id}`} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm hover:shadow-md">
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200"><span className="text-gray-400">No Image</span></div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="rounded bg-hmc-orange/10 px-2 py-0.5 text-xs font-medium text-hmc-orange">{getInteractionCategoryLabel(item.category)}</span>
                  <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors group-hover:text-hmc-red">{item.title}</h3>
                  {item.author && <p className="text-xs text-gray-500">by {item.author}</p>}
                  {item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description.replace(/<[^>]*>/g, "")}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
