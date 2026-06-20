"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PERFORMANCE_CATEGORIES, PERFORMANCE_CATEGORY_OPTIONS, CATEGORY_FALLBACK_IMAGES } from "@/lib/constants";

interface PerformanceItem {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  description: string;
  status: string;
  eventDate?: string;
  createdAt: number;
  ticketUrl?: string; // 扩充字段，支持直达购票
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
  categories.forEach((cat) => {
    result[cat] = { latest: null, total: 0 };
  });

  try {
    for (const category of categories) {
      try {
        // 【物理隔离智能接管】
        if (category === "opera" || category === "musical" || category === "classical" || category === "music" || category === "electronic" || category === "performance-art") {
          const fileName = category.charAt(0).toUpperCase() + category.slice(1);
          const res = await fetch(`/data/ticketmaster/${fileName}/data.json`);
          if (!res.ok) continue;
          const rawEvents = await res.json();

          if (rawEvents && rawEvents.length > 0) {
            const first = rawEvents[0];
            const parsedItem: PerformanceItem = {
              id: first.id,
              title: first.name,
              category,
              coverImage: first.images?.[0]?.url || "",
              description: first.info || "",
              status: "upcoming",
              eventDate: first.dates?.start?.localDate || "",
              createdAt: first.dates?.start?.localDate ? new Date(first.dates.start.localDate).getTime() : Date.now(),
              ticketUrl: first.url
            };

            result[category] = {
              latest: parsedItem,
              total: rawEvents.length,
            };
          }
        } else {
          // 其他分类在还没做单独抓取前，保持 Cursor 的原生旧逻辑不动
          const res = await fetch(`/data/ticketmaster/${category}/events.json`);
          if (!res.ok) continue;
          const data = await res.json();
          const events: PerformanceItem[] = data.events || [];

          const categoryItems = events.filter((item) => item.category === category);

          if (categoryItems.length > 0) {
            const sorted = categoryItems.sort((a, b) => {
              const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
              const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
              return dateB - dateA;
            });
            result[category] = {
              latest: sorted[0],
              total: categoryItems.length,
            };
          }
        }
      } catch (e) {
        // skip this category error
      }
    }
  } catch (e) {
    return result;
  }

  return result;
}

function CategoryCard({ category, data }: { category: string; data: CategoryData }) {
  const categoryHref = `/performance/${category}`;
  const categoryLabel = PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;
  const item = data?.latest;
  const total = data?.total || 0;

  const fallbackImage = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES["Others"];
  const imageSrc = item?.coverImage && item.coverImage.startsWith("http") ? item.coverImage : fallbackImage;

  // 如果有直达 Ticketmaster 的买票链接就走买票链接，否则进分类子页
  const clickHref = item?.ticketUrl ? item.ticketUrl : categoryHref;

  return (
    <CategoryBox title={categoryLabel}>
      <article className="flex h-full flex-col">
        {/* 点击上方内容：如果是 Opera，会直接带你去买最近那场演出的票，或者进二级页面 */}
        <a
          href={clickHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 cursor-pointer flex-col gap-2 border border-hmc-placeholder-border border-b-0 bg-white p-2 transition-opacity duration-200 hover:opacity-80"
        >
          <h3 className="line-clamp-3 text-left text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
            {item ? item.title : categoryLabel}
          </h3>
          <time className="text-left text-[10px] text-hmc-text-muted">
            {item?.eventDate ? `Date: ${item.eventDate}` : "No upcoming events"}
          </time>
          <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder relative">
            <Image
              src={imageSrc}
              alt={item?.title || "Performance thumbnail"}
              width={500}
              height={375}
              className="h-full w-full object-cover"
              unoptimized={category === "opera" || category === "musical" || category === "classical" || category === "music" || category === "electronic" || category === "performance-art"}
            />
          </div>
        </a>

        {/* 底部按钮：点击进入对应的 2 级分流页面 */}
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
            {PERFORMANCE_CATEGORIES.map((catLabel) => (
              <CategoryBox key={catLabel} title={catLabel}>
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
            {PERFORMANCE_CATEGORIES.map((catLabel) => {
              const catSlug = PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.label === catLabel)?.value || catLabel.toLowerCase().replace(/\s*&\s*/g, "-");
              return (
                <CategoryCard
                  key={catSlug}
                  category={catSlug}
                  data={categoriesData[catSlug] || { latest: null, total: 0 }}
                />
              );
            })}
          </div>
      </Container>
    </section>
  );
}