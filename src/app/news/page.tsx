"use client";

import { useState } from "react";
import { useQuery } from "@/lib/convex";
import { api } from "@/lib/convex";

export default function NewsListingPage() {
  const allArticles = useQuery(api.admin.getPublishedNews, {}) as any[] | undefined;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const articles = allArticles || [];
  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = articles.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-hmc-orange bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-hmc-orange">
            News
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {allArticles === undefined ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4">
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-500">No news articles found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentItems.map((article) => (
                <a
                  key={article._id}
                  href={`/news/${article._id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {article.coverImage ? (
                      <img
                        src={article.coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <time className="text-xs text-gray-400">
                      {formatDate(article.publishDate)}
                    </time>
                    <h2 className="text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-hmc-red">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="line-clamp-2 text-xs text-gray-500">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
