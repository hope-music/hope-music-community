"use client";

import { useQuery } from "@/lib/convex";
import { api } from "@/lib/convex";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const CATEGORY_LABELS: Record<string, string> = {
  stage: "Stage",
  video: "Video",
  lighting: "Lighting",
  audio: "Audio",
  effects: "Effects",
  costumes: "Costumes",
  props: "Props",
  makeup: "Makeup",
  others: "Others",
};

export default function InsightsCategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const insights = useQuery(api.admin.getPublishedInsights, { category }) as any[] | undefined;

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
            {CATEGORY_LABELS[category] || category}
          </h1>
          <Link href="/insights" className="mt-3 inline-block text-sm text-hmc-orange hover:underline">
            ← Back to Insights
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {insights === undefined ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4">
                  <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <p className="text-lg">No insights in this category.</p>
            <Link href="/insights" className="mt-4 inline-block text-hmc-orange hover:underline">
              Back to Insights
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <Link
                key={insight._id}
                href={`/insights/${category}/${insight._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-hmc-placeholder-border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
                  {insight.coverImage ? (
                    <Image
                      src={insight.coverImage}
                      alt={insight.title}
                      width={600}
                      height={450}
                      unoptimized
                      className="h-full w-full rounded-t-xl object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  {insight.publishDate ? (
                    <time className="text-xs text-gray-400">
                      {formatDate(insight.publishDate)}
                    </time>
                  ) : null}
                  <h3 className="text-sm font-semibold leading-snug text-hmc-text transition-colors duration-150 group-hover:text-hmc-red">
                    {insight.title}
                  </h3>
                  {insight.excerpt && (
                    <p className="line-clamp-2 text-xs text-gray-500">
                      {insight.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
