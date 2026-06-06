"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CommentSection } from "@/components/comments/CommentSection";
import { STAGE_PRODUCTION_CATEGORY_LABELS } from "@/lib/constants";

interface StageProduction {
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

const CATEGORIES = [
  { value: "stage", label: "Stage" },
  { value: "video", label: "Video" },
  { value: "lighting", label: "Lighting" },
  { value: "audio", label: "Audio" },
  { value: "effects", label: "Effects" },
  { value: "costumes", label: "Costumes" },
  { value: "props", label: "Props" },
  { value: "makeup", label: "Makeup" },
  { value: "others", label: "Others" },
];

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  sets: "stage",
  sound: "audio",
  projection: "video",
  scenery: "effects",
};

export default function StageProductionDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<StageProduction | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageId, setPageId] = useState<string | null>(null);

  useEffect(() => {
    const id = params.slug as string;
    setPageId(id);
    
    const stored = localStorage.getItem("admin_stage_production");
    if (stored) {
      const data = JSON.parse(stored);
      const found = data.find((i: StageProduction) => i.id === id);
      setItem(found || null);
    }
    setLoading(false);
  }, [params.slug]);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div></div>;
  if (!item) return <div className="min-h-screen flex flex-col items-center justify-center py-20"><h1 className="text-2xl font-bold mb-4">Not Found</h1><Link href="/stage-production" className="px-4 py-2 bg-hmc-orange text-white rounded-md">Back</Link></div>;

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange"><div className="mx-auto max-w-4xl px-4 py-4"><Link href="/stage-production" className="text-sm text-gray-500 hover:text-hmc-orange">← Back</Link></div></div>
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">{STAGE_PRODUCTION_CATEGORY_LABELS[LEGACY_CATEGORY_MAP[item.category] ?? item.category] || item.category}</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">{item.title}</h1>
        {item.eventDate && <div className="text-gray-500 text-sm mb-6">Event Date: <time className="font-medium text-gray-700">{formatDate(item.eventDate)}</time></div>}
        {item.coverImage && <img src={item.coverImage} alt={item.title} className="w-full aspect-[16/9] object-cover rounded-xl shadow-md mb-8" />}
        {item.content && <div className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />}
      </article>
      <div className="max-w-4xl mx-auto px-4 py-12">
        {pageId && (
          <CommentSection
            pageId={pageId}
            storageKey="stage_production_comments"
            bannedUsersKey="stage_production_banned_users"
            title="Stage Production"
          />
        )}
      </div>
    </main>
  );
}
