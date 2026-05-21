"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export interface ListingItem {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
}

interface CategoryListingProps {
  category: string;
  items: ListingItem[];
  itemsPerPage?: number;
  basePath?: string;
}

const ITEMS_PER_PAGE_DEFAULT = 9;

export function CategoryListing({
  category,
  items,
  itemsPerPage = ITEMS_PER_PAGE_DEFAULT,
  basePath,
}: CategoryListingProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const getDetailHref = (itemId: string): string => {
    if (basePath) {
      return `${basePath}/${itemId}`;
    }
    const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const isPerformance =
      normalizedCategory.includes("musical") ||
      normalizedCategory.includes("opera") ||
      normalizedCategory.includes("concert") ||
      normalizedCategory.includes("edm") ||
      normalizedCategory.includes("rock") ||
      normalizedCategory.includes("festival") ||
      normalizedCategory.includes("ballet") ||
      normalizedCategory.includes("tourist");
    const section = isPerformance ? "performance" : "interaction";
    return `/${section}/${normalizedCategory}/${itemId}`;
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Page Title */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-[#D96A32]">
            {category}
          </h1>
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {currentItems.map((item) => (
            <Link
              key={item.id}
              href={getDetailHref(item.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={600}
                  height={450}
                  className="h-full w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <time className="text-xs text-hmc-text-muted" dateTime="2026-06-25">
                  {item.date}
                </time>
                <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors duration-150 group-hover:text-[#C8102E]">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Dynamic Pagination */}
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

export { ITEMS_PER_PAGE_DEFAULT };
