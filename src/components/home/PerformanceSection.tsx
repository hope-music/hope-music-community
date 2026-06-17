"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PERFORMANCE_CATEGORIES, PERFORMANCE_CATEGORY_SLUG_MAP, CATEGORY_FALLBACK_IMAGES } from "@/lib/constants";

interface PerformanceItem {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  description: string;
  status: string;
  eventDate?: string;
  createdAt: number;
}

interface CategoryData {
  latest: PerformanceItem | null;
  total: number;
}

async function loadCategoryData(): Promise<Record<string, CategoryData>> {
  const categories = [
    "musical", "opera", "classical", "music", "electronic",
    "pop-rock", "performance-art", "dance", "other",
  ];

  const result: Record<string, CategoryData> = {};
  PERFORMANCE_CATEGORIES.forEach((category) => {
    result[category] = { latest: null, total: 0 };
  });

  try {
    for (const category of categories) {
      try {
        const res = await fetch(`/data/ticketmaster/${category}/events.json`);
        if (!res.ok) continue;
        const data = await res.json();
        const events: PerformanceItem[] = data.events || [];

        const categoryKey = PERFORMANCE_CATEGORY_SLUG_MAP[category];
        const categoryItems = events.filter((item) => item.category === categoryKey);

        if (categoryItems.length > 0) {
          const sorted = categoryItems.sort((a, b) => {
            const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
            const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
            return dateB - dateA;
          });
          const label = PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === categoryKey)?.label || categoryKey;
          result[label] = {
            latest: sorted[0],
            total: categoryItems.length,
          };
        }
      } catch (e) {
        // skip this category
      }
    }
  } catch (e) {
    return result;
  }

  return result;
}

function CategoryCard({ category, data }: { category: string; data: CategoryData }) {
  const categorySlug = PERFORMANCE_CATEGORY_SLUG_MAP[category];
  const categoryHref = `/performance/${categorySlug}`;
  const item = data?.latest;
  const total = data?.total || 0;

  const fallbackImage = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES["Others"];
  const imageSrc = item?.coverImage && item.coverImage.startsWith("http") ? item.coverImage : fallbackImage;

  return (
    <CategoryBox title={category}>
      <article className="flex h-full flex-col">
        {/* Top Content - Opens detail page */}
        <a
          href={item ? `/performance/${item.category}/${item.id}` : categoryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 cursor-pointer flex-col gap-2 border border-hmc-placeholder-border border-b-0 bg-white p-2 transition-opacity duration-200 hover:opacity-80"
        >
          <h3 className="line-clamp-3 text-left text-xs font-semibold leading-snug text-hmc-text">
            {item ? item.title : category}
          </h3>
          <time className="text-left text-[10px] text-hmc-text-muted" dateTime="2026-05-15">
            {item ? new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No upcoming events"}
          </time>
          <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder">
            <Image
              src={imageSrc}
              alt={item?.title || "Performance thumbnail"}
              width={500}
              height={375}
              className="h-full w-full object-cover"
            />
          </div>
        </a>

        {/* Bottom Red Button - Opens in NEW TAB */}
        <div className="flex w-full justify-center border border-hmc-placeholder-border bg-white">
          <a
            href={categoryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-hmc-orange/90 transition-colors"
          >
            View More {total > 0 && `(${total})`}
          </a>
        </div>
      </article>
    </CategoryBox>
  );
}

export function PerformanceSection() {
  const [categoriesData, setCategoriesData] = useState<Record<string, CategoryData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryData().then((result) => {
      setCategoriesData(result);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="py-6">
        <Container>
          <SectionHeading title="Performance" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PERFORMANCE_CATEGORIES.map((category) => (
              <CategoryBox key={category} title={category}>
                <div className="h-32 flex items-center justify-center">
                  <span className="text-gray-400">Loading...</span>
                </div>
              </CategoryBox>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-6" aria-labelledby="performance-heading">
      <Container>
        <SectionHeading title="Performance" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERFORMANCE_CATEGORIES.map((category) => (
            <CategoryCard 
              key={category} 
              category={category} 
              data={categoriesData[category] || { latest: null, total: 0 }} 
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
