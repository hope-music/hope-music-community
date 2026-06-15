"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { CommentSection } from "@/components/comments/CommentSection";

export default function NewsDetailPage() {
  const params = useParams();
  const articleId = params.id as string;

  // Query article from Convex
  const article = useQuery(
    api.admin.getNewsById,
    articleId ? { id: articleId as any } : "skip"
  );

  const loading = !articleId || article === undefined;

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

        {/* Author & Date Section */}
        <div className="text-gray-500 text-sm mb-8 flex flex-wrap items-center gap-4">
          {article.authorName && (
            <div className="flex items-center gap-1">
              <span>By:</span>
              <span className="font-medium text-gray-700">{article.authorName}</span>
            </div>
          )}
          {article.publishDate && (
            <div className="flex items-center gap-1">
              <span>Published on:</span>
              <time className="font-medium text-gray-700">{formatDate(article.publishDate)}</time>
            </div>
          )}
        </div>

        {/* Hero Image Section */}
        {article.coverImage && (
          <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-md mb-8 bg-gray-100">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
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
