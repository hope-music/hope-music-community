"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { CommentSection } from "@/components/comments/CommentSection";

// Demo articles for fallback
const DEMO_ARTICLES: Record<string, { id: string; title: string; coverImage: string; content: string; createdAt: number }> = {
  "demo-1": {
    id: "demo-1",
    title: "Announcing the 2026 Global Musicals Gala line-up",
    coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200",
    content: `<p class="font-semibold text-lg text-gray-800">We are thrilled to officially announce the lineup for the 2026 Global Musicals Gala, featuring world-renowned performers and groundbreaking theatrical productions from across the globe.</p>
    <p>This year's gala promises to be the most ambitious yet, bringing together award-winning composers, directors, and performers from Broadway, West End, and international stages. Audiences can expect exclusive previews of upcoming productions, live performances of classic musical numbers, and behind-the-scenes insights into the creative process.</p>
    <p>"This Gala represents the pinnacle of musical theater excellence," noted the artistic director. "We've curated a program that celebrates both timeless classics and innovative new works that push the boundaries of what musical theater can achieve."</p>
    <p>Stay tuned for detailed schedule announcements, ticket availability, and special VIP experiences. For group bookings and institutional partnerships, please reach out through our collaboration portals.</p>`,
    createdAt: Date.now() - 86400000 * 2,
  },
  "demo-2": {
    id: "demo-2",
    title: "Hope Studio partners with industry leader for pro-audio workshop series",
    coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200",
    content: `<p class="font-semibold text-lg text-gray-800">We are excited to announce our new partnership with leading audio industry professionals for an exclusive workshop series.</p>
    <p>Learn from the best in the industry with our comprehensive workshop program covering recording techniques, mixing fundamentals, mastering essentials, and live sound reinforcement.</p>
    <p>These workshops are designed for aspiring audio engineers, music producers, and anyone looking to elevate their sound production skills to professional standards.</p>`,
    createdAt: Date.now() - 86400000 * 5,
  },
  "demo-3": {
    id: "demo-3",
    title: "Artist Community Spotlight: Rising stars share their journey with HOPE",
    coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200",
    content: `<p class="font-semibold text-lg text-gray-800">Meet the talented artists who are shaping the future of music at HOPE Music Community.</p>
    <p>Our community is home to exceptional musicians, producers, and performers who bring creativity and passion to every project.</p>
    <p>Through our platform, artists have access to world-class facilities, mentorship from industry veterans, and opportunities to collaborate with fellow creatives.</p>`,
    createdAt: Date.now() - 86400000 * 8,
  },
};

export default function NewsDetailPage() {
  const params = useParams();
  const articleId = params.id as string;

  // Query article from Convex
  const convexArticle = useQuery(
    api.admin.getNewsById,
    articleId && !articleId.startsWith("demo-")
      ? { id: articleId as any }
      : "skip"
  );

  // Determine article data
  const article = articleId.startsWith("demo-")
    ? DEMO_ARTICLES[articleId] || null
    : convexArticle || null;

  const loading = !articleId || (!articleId.startsWith("demo-") && convexArticle === undefined);

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-hmc-orange"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/news"
          className="px-4 py-2 bg-hmc-orange text-white rounded-md hover:bg-hmc-orange transition-colors"
        >
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Back Link */}
      <div className="border-b border-t border-hmc-orange bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/news" className="text-sm text-gray-500 hover:text-hmc-orange transition-colors">
            ← Back to News
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Category Tag Header */}
        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
          News
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>

        {/* Date Section */}
        <div className="text-gray-500 text-sm mb-8 flex items-center gap-2">
          <span>Published on:</span>
          <time className="font-medium text-gray-700">{formatDate(article.createdAt)}</time>
        </div>

        {/* Hero Image Section */}
        {article.coverImage && (
          <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-md mb-8 bg-gray-100">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        {/* Full Formatted Text Content */}
        <div
          className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <CommentSection
          pageId={`news-${articleId}`}
          storageKey="news_comments"
          bannedUsersKey="news_banned_users"
          title="News"
        />
      </div>
    </main>
  );
}
