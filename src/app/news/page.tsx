"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

interface NewsArticle {
  id: string;
  title: string;
  coverImage: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
}

export default function NewsListingPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("admin_news");
    if (stored) {
      const data = JSON.parse(stored);
      // Only show published articles
      const published = data.filter((a: NewsArticle) => a.isPublished);
      setArticles(published);
    }
    setLoading(false);
  }, []);

  const totalPages = Math.ceil(articles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = articles.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fallback demo data when no articles
  const displayItems = currentItems.length > 0 ? currentItems : [
    {
      id: "demo-1",
      title: "Announcing the 2024 Global Musicals Gala line-up",
      coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&h=450&fit=crop",
      excerpt: "Join us for the most spectacular musical event of the year.",
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: "demo-2",
      title: "Hope Studio partners with industry leader for pro-audio workshop series",
      coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=450&fit=crop",
      excerpt: "Learn from the best in the industry with our new workshop partnership.",
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: "demo-3",
      title: "Artist Community Spotlight: Rising stars share their journey with HOPE",
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=450&fit=crop",
      excerpt: "Meet the talented artists who are shaping the future of music.",
      createdAt: Date.now() - 86400000 * 8,
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Page Title */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">
            News
          </h1>
        </div>
      </div>

      {/* News Grid */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
            <p className="mt-4 text-gray-500">Loading news...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {displayItems.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        width={600}
                        height={450}
                        className="h-full w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-200">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <time className="text-xs text-hmc-text-muted">
                      {formatDate(article.createdAt)}
                    </time>
                    <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors duration-150 group-hover:text-[#C8102E]">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-1" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="min-w-[36px] rounded-md bg-white px-3 py-2 text-sm font-medium text-hmc-text transition-colors duration-150 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[36px] rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                        currentPage === page
                          ? "bg-[#C8102E] text-white"
                          : "bg-white text-hmc-text hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="min-w-[36px] rounded-md bg-white px-3 py-2 text-sm font-medium text-hmc-text transition-colors duration-150 hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

            {articles.length === 0 && (
              <p className="mt-8 text-center text-gray-500">
                No news articles yet. Check back later!
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
