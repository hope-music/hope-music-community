"use client";

import Image from "next/image";
import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useQuery, useMutation, api } from "@/lib/convex";
import { PERFORMANCE_CATEGORIES, PERFORMANCE_CATEGORY_OPTIONS, CATEGORY_FALLBACK_IMAGES } from "@/lib/constants";

interface CategoryData {
  title: string;
  coverImage: string;
  url: string;
  eventDate: number | null;
}

function CategoryCard({ slug, label }: { slug: string; label: string }) {
  const latest = useQuery(api.admin.getLatestStageProduction, { category: slug });
  const counts = useQuery(api.admin.getStageProductionsCount);

  const item: CategoryData | null = latest ?? null;
  const total = counts?.[slug] ?? 0;

  const fallbackImage = CATEGORY_FALLBACK_IMAGES[slug] || CATEGORY_FALLBACK_IMAGES["Other"];
  const imageSrc = item?.coverImage?.startsWith("http") ? item.coverImage : fallbackImage;
  const clickHref = item?.url || `/performance/${slug}`;

  const eventDateStr = item?.eventDate
    ? new Date(item.eventDate).toISOString().split("T")[0]
    : "";

  return (
    <CategoryBox title={label}>
      <article className="flex h-full flex-col">
        <a
          href={clickHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 cursor-pointer flex-col gap-2 border border-hmc-placeholder-border border-b-0 bg-white p-2 transition-opacity duration-200 hover:opacity-80"
        >
          <h3 className="line-clamp-3 text-left text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
            {item?.title ?? label}
          </h3>
          <time className="text-left text-[10px] text-hmc-text-muted">
            {item ? `Date: ${eventDateStr}` : "No scheduled events"}
          </time>
          <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder relative">
            <Image
              src={imageSrc}
              alt={item?.title ?? "Performance thumbnail"}
              width={500}
              height={375}
              className="h-full w-full object-cover"
              unoptimized={true}
            />
          </div>
        </a>

        <div className="flex w-full justify-center border border-hmc-placeholder-border bg-white">
          <a
            href={`/performance/${slug}`}
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
  return (
    <section className="py-6" aria-labelledby="performance-heading">
      <Container>
        <SectionHeading title="Performance" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERFORMANCE_CATEGORIES.map((catLabel) => {
            const catOption = PERFORMANCE_CATEGORY_OPTIONS.find((c) => c.label === catLabel);
            const catSlug = catOption?.value || catLabel.toLowerCase().replace(/\s*&\s*/g, "-");
            return (
              <CategoryCard key={catSlug} slug={catSlug} label={catLabel} />
            );
          })}
        </div>
      </Container>
    </section>
  );
}
