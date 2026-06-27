"use client";

import Image from "next/image";
import { CategoryBox } from "@/components/ui/CategoryBox";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useQuery, api } from "@/lib/convex";
import { PERFORMANCE_CATEGORIES, PERFORMANCE_CATEGORY_OPTIONS, CATEGORY_FALLBACK_IMAGES } from "@/lib/constants";
import { useEffect, useState } from "react";

interface CategoryData {
  title: string;
  coverImage: string;
  url: string;
  eventDate: number | null;
}

interface EventRow {
  ticketmaster_id: string;
  title: string;
  event_date: string | null;
  image_url: string | null;
  venue: string | null;
  city: string | null;
  ticket_url: string | null;
}

function MusicalCard({ label }: { label: string }) {
  const [item, setItem] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { data } = await supabase
          .from("musical_events")
          .select("*")
          .gte("event_date", now.toISOString())
          .lte("event_date", thirtyDaysLater)
          .order("event_date", { ascending: true })
          .limit(1);

        if (data && data.length > 0) {
          const row = data[0] as EventRow;
          setItem({
            title: row.title,
            coverImage: row.image_url || "",
            url: row.ticket_url || "/performance/musical",
            eventDate: row.event_date ? new Date(row.event_date).getTime() : null,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fallbackImage = CATEGORY_FALLBACK_IMAGES["Musical"] || CATEGORY_FALLBACK_IMAGES["Other"];
  const imageSrc = item?.coverImage?.startsWith("http") ? item.coverImage : fallbackImage;
  const eventDateStr = item?.eventDate ? new Date(item.eventDate).toISOString().split("T")[0] : "";

  return (
    <CategoryBox title={label}>
      <article className="flex h-full flex-col">
        <a
          href={item?.url || "/performance/musical"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 cursor-pointer flex-col gap-2 border border-hmc-placeholder-border border-b-0 bg-white p-2 transition-opacity duration-200 hover:opacity-80"
        >
          <h3 className="line-clamp-3 text-left text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
            {loading ? "Loading..." : (item?.title ?? label)}
          </h3>
          <time className="text-left text-[10px] text-hmc-text-muted">
            {loading ? "" : (item ? `Date: ${eventDateStr}` : "No scheduled events")}
          </time>
          <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder relative">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-hmc-orange"></div>
              </div>
            ) : (
              <Image
                src={imageSrc}
                alt={item?.title ?? "Performance thumbnail"}
                width={500}
                height={375}
                className="h-full w-full object-cover"
                unoptimized={true}
              />
            )}
          </div>
        </a>
        <div className="flex w-full justify-center border border-hmc-placeholder-border bg-white">
          <a
            href="/performance/musical"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-hmc-orange/90 transition-colors"
          >
            {loading ? "Loading..." : "View More"}
          </a>
        </div>
      </article>
    </CategoryBox>
  );
}

function OperaCard({ label }: { label: string }) {
  const [item, setItem] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseKey) return;

        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        const now = new Date();
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { data } = await supabase
          .from("opera_events")
          .select("*")
          .gte("event_date", now.toISOString())
          .lte("event_date", thirtyDaysLater)
          .order("event_date", { ascending: true })
          .limit(1);

        if (data && data.length > 0) {
          const row = data[0] as EventRow;
          setItem({
            title: row.title,
            coverImage: row.image_url || "",
            url: row.ticket_url || "/performance/opera",
            eventDate: row.event_date ? new Date(row.event_date).getTime() : null,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fallbackImage = CATEGORY_FALLBACK_IMAGES["Opera"] || CATEGORY_FALLBACK_IMAGES["Other"];
  const imageSrc = item?.coverImage?.startsWith("http") ? item.coverImage : fallbackImage;
  const eventDateStr = item?.eventDate ? new Date(item.eventDate).toISOString().split("T")[0] : "";

  return (
    <CategoryBox title={label}>
      <article className="flex h-full flex-col">
        <a
            href={item?.url || "/performance/opera"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 cursor-pointer flex-col gap-2 border border-hmc-placeholder-border border-b-0 bg-white p-2 transition-opacity duration-200 hover:opacity-80"
        >
          <h3 className="line-clamp-3 text-left text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
            {loading ? "Loading..." : (item?.title ?? label)}
          </h3>
          <time className="text-left text-[10px] text-hmc-text-muted">
            {loading ? "" : (item ? `Date: ${eventDateStr}` : "No scheduled events")}
          </time>
          <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder relative">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-hmc-orange"></div>
              </div>
            ) : (
              <Image
                src={imageSrc}
                alt={item?.title ?? "Performance thumbnail"}
                width={500}
                height={375}
                className="h-full w-full object-cover"
                unoptimized={true}
              />
            )}
          </div>
        </a>
        <div className="flex w-full justify-center border border-hmc-placeholder-border bg-white">
          <a
            href="/performance/opera"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-hmc-orange/90 transition-colors"
          >
            {loading ? "Loading..." : "View More"}
          </a>
        </div>
      </article>
    </CategoryBox>
  );
}

function CategoryCard({ slug, label }: { slug: string; label: string }) {
  const isOpera = slug === "opera";
  const isMusical = slug === "musical";

  const convexLatest = useQuery(
    isOpera || isMusical ? api.admin.getLatestStageProduction : api.admin.getLatestStageProduction,
    isOpera || isMusical ? { category: "opera-skip" } : { category: slug }
  ) as CategoryData | null | undefined;

  const counts = useQuery(api.admin.getStageProductionsCount);

  const item: CategoryData | null = isOpera || isMusical ? null : (convexLatest ?? null);
  const loading = convexLatest === undefined;
  const total = counts?.[slug] ?? 0;

  const fallbackImage = CATEGORY_FALLBACK_IMAGES[label] || CATEGORY_FALLBACK_IMAGES["Other"];
  const imageSrc = item?.coverImage?.startsWith("http") ? item.coverImage : fallbackImage;
  const eventDateStr = item?.eventDate ? new Date(item.eventDate).toISOString().split("T")[0] : "";

  return (
    <CategoryBox title={label}>
      <article className="flex h-full flex-col">
        <a
          href={item?.url || `/performance/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 cursor-pointer flex-col gap-2 border border-hmc-placeholder-border border-b-0 bg-white p-2 transition-opacity duration-200 hover:opacity-80"
        >
          <h3 className="line-clamp-3 text-left text-xs font-semibold leading-snug text-hmc-text min-h-[2.5rem]">
            {loading ? "Loading..." : (item?.title ?? label)}
          </h3>
          <time className="text-left text-[10px] text-hmc-text-muted">
            {loading ? "" : (item ? `Date: ${eventDateStr}` : "No scheduled events")}
          </time>
          <div className="aspect-[4/3] w-full overflow-hidden bg-hmc-placeholder relative">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-hmc-orange"></div>
              </div>
            ) : (
              <Image
                src={imageSrc}
                alt={item?.title ?? "Performance thumbnail"}
                width={500}
                height={375}
                className="h-full w-full object-cover"
                unoptimized={true}
              />
            )}
          </div>
        </a>
        <div className="flex w-full justify-center border border-hmc-placeholder-border bg-white">
          <a
            href={`/performance/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded bg-hmc-orange px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-hmc-orange/90 transition-colors"
          >
            {loading ? "Loading..." : `View More ${total > 0 ? `(${total})` : ""}`}
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
            if (catSlug === "musical") return <MusicalCard key={catSlug} label={catLabel} />;
            if (catSlug === "opera") return <OperaCard key={catSlug} label={catLabel} />;
            return <CategoryCard key={catSlug} slug={catSlug} label={catLabel} />;
          })}
        </div>
      </Container>
    </section>
  );
}
