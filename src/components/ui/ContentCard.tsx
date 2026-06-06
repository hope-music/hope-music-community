"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PLACEHOLDER_ARTICLE } from "@/lib/constants";

type ContentCardProps = {
  title?: string;
  date?: string;
  showViewMore?: boolean;
  detailHref?: string;
  categoryHref?: string;
  slug?: string;
  category?: string;
};

export function ContentCard({
  title = PLACEHOLDER_ARTICLE.title,
  date = PLACEHOLDER_ARTICLE.date,
  showViewMore = true,
  detailHref,
  categoryHref,
  slug,
  category,
}: ContentCardProps) {
  const href = detailHref || (slug && category ? `/performance/${category}/${slug}` : undefined);

  return (
    <article className="flex h-full flex-col">
      {/* Top Content - Opens in NEW TAB */}
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 cursor-pointer flex-col gap-2 border border-hmc-placeholder-border border-b-0 bg-white p-2 transition-opacity duration-200 hover:opacity-80"
        >
          <h3 className="line-clamp-3 text-left text-xs font-semibold leading-snug text-hmc-text">
            {title}
          </h3>
          <time className="text-left text-[10px] text-hmc-text-muted" dateTime="2026-05-15">
            {date}
          </time>
          <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
            <Image
              src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500"
              alt="Performance thumbnail"
              width={500}
              height={375}
              className="h-full w-full object-cover"
            />
          </div>
        </a>
      )}

      {/* Bottom Red Button - Opens in NEW TAB */}
      {showViewMore && categoryHref && (
        <div className="flex w-full justify-center border border-hmc-placeholder-border bg-white">
          <a
            href={categoryHref}
            className="flex-1 rounded bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-hmc-orange/90 transition-colors"
          >
            View Details
          </a>
        </div>
      )}
    </article>
  );
}
