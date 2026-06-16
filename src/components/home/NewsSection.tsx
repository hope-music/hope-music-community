"use client";

import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Container } from "@/components/ui/Container";
import { ViewMoreButton } from "@/components/ui/ViewMoreButton";

export function NewsSection() {
  // Fetch published news from Convex (real-time reactive)
  const news = useQuery(api.admin.getPublishedNews, { limit: 3 }) as any[] | undefined;

  const formatDate = (dateValue?: number | string): string => {
    if (!dateValue) return "";
    const date = typeof dateValue === "number" ? new Date(dateValue) : new Date(dateValue);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Map Convex data to display format
  const newsItems = (news ?? []).slice(0, 3).map((article: any) => ({
    id: article._id,
    title: article.title || "Untitled",
    date: formatDate(article.publishDate),
    image: article.coverImage || "",
    href: `/news/${article._id}`,
  }));

  return (
    <section className="py-6 pb-10" aria-labelledby="news-heading">
      <Container>
        <div className="mb-4 flex items-center justify-between">
          <h2 id="news-heading" className="text-lg font-semibold text-hmc-text">
            News
          </h2>
          <ViewMoreButton href="/news" />
        </div>

        {news === undefined ? (
          // Loading state
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-hmc-placeholder-border bg-white p-0 shadow-sm"
              >
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4">
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No news articles available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {newsItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200">
                      <span className="text-sm text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <time
                    className="text-xs text-hmc-text-muted"
                    dateTime={item.date}
                  >
                    {item.date}
                  </time>
                  <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors duration-150 group-hover:text-hmc-red">
                    {item.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
