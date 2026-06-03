"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CommentSection } from "@/components/comments/CommentSection";

interface Performance {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
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

export default function PerformanceDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const id = params?.slug as string;

    if (!id) {
      setLoading(false);
      return;
    }

    setPageId(id);

    try {
      const stored = localStorage.getItem("admin_performance");
      if (stored) {
        const data = JSON.parse(stored);

        // One-time migration: update old category slugs to new ones
        const OLD_TO_NEW: Record<string, string> = {
          "opera": "legend-hall-of-fame",
          "concert": "musical",
          "rock-roll": "classical",
          "tourist-performance": "edm",
        };
        let migrated = false;
        const updated = data.map((item: Performance) => {
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

        const found = updated.find((item: Performance) => item.id === id);
        setItem(found || null);
      }
    } catch (e) {
      console.error("Error loading data:", e);
      setItem(null);
    }

    setLoading(false);
  }, [params?.slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
        <p className="text-sm text-gray-400 mb-4">Debug: ID = {pageId}</p>
        <Link href="/performance" className="px-4 py-2 bg-[#D96A32] text-white rounded-md hover:bg-[#c45a28]">Back to Performance</Link>
      </div>
    );
  }

  const categoryLabel = SUBCATEGORIES.find((c) => c.value === item.category)?.label || item.category;

  return (
    <main className="min-h-screen bg-white">
      {/* Back Link */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/performance" className="text-sm text-gray-500 hover:text-[#D96A32] transition-colors">← Back to Performance</Link>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
          {categoryLabel}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {item.title}
        </h1>

        {item.eventDate && (
          <div className="text-gray-500 text-sm mb-6">
            <span>Event Date: </span>
            <time className="font-medium text-gray-700">{formatDate(item.eventDate)}</time>
          </div>
        )}

        {item.coverImage && (
          <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-md mb-8 bg-gray-100">
            <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}

        {item.content && (
          <div className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}

        {item.description && !item.content && (
          <p className="text-gray-700 leading-relaxed">{item.description}</p>
        )}
      </article>

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {pageId && (
          <CommentSection
            pageId={pageId}
            storageKey="performance_comments"
            bannedUsersKey="performance_banned_users"
          />
        )}
      </div>
    </main>
  );
}
