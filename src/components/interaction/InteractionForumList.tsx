"use client";

import Link from "next/link";
import { useState } from "react";

export interface ForumPost {
  id: string;
  title: string;
  author: string;
  date: string;
  replies: number;
  pinned?: boolean;
}

type TimeFilter = "all" | "day" | "week" | "month";

interface InteractionForumListProps {
  category: string;
  posts: ForumPost[];
  postsPerPage?: number;
  categorySlug: string;
}

const POSTS_PER_PAGE_DEFAULT = 15;

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "all", label: "All Time" },
  { key: "day", label: "Past 24 Hours" },
  { key: "week", label: "Past Week" },
  { key: "month", label: "Past Month" },
];

export function InteractionForumList({
  category,
  posts,
  postsPerPage = POSTS_PER_PAGE_DEFAULT,
  categorySlug,
}: InteractionForumListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = posts.slice(startIndex, startIndex + postsPerPage);

  return (
    <main className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">
            {category}
          </h1>
        </div>
      </div>

      {/* Post List */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Filter Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          {/* Time Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {TIME_FILTERS.map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setTimeFilter(filter.key);
                  setCurrentPage(1);
                }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                  timeFilter === filter.key
                    ? "bg-[#C8102E] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* New Topic Button */}
          <button
            type="button"
            className="shrink-0 rounded-xl border border-[#C8102E] bg-white px-5 py-2 text-sm font-semibold text-[#C8102E] shadow-sm transition-all duration-150 hover:bg-[#C8102E] hover:text-white"
          >
            + New Topic
          </button>
        </div>

        {/* Post Rows */}
        <div className="flex flex-col gap-3">
          {currentPosts.map((post) => (
            <Link
              key={post.id}
              href={`/interaction/${categorySlug}/${post.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl border border-hmc-placeholder-border bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:border-[#D96A32] hover:shadow-md"
            >
              {/* Left: Pinned Tag + Title + Author */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {post.pinned && (
                  <span className="shrink-0 rounded bg-[#C8102E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Pinned
                  </span>
                )}
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="truncate text-base font-medium text-hmc-text transition-colors duration-150 group-hover:text-[#C8102E]">
                    {post.title}
                  </h2>
                  <p className="text-xs text-hmc-text-muted">
                    Posted by <span className="font-medium">{post.author}</span> • {post.date}
                  </p>
                </div>
              </div>

              {/* Right: Reply Count Badge */}
              <div className="ml-4 shrink-0">
                <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-hmc-text-muted">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {post.replies}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <nav className="flex items-center gap-1" aria-label="Pagination">
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
            </nav>
          </div>
        )}
      </div>
    </main>
  );
}

export { POSTS_PER_PAGE_DEFAULT };
