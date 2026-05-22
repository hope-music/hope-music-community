import React from "react";
import Image from "next/image";
import Link from "next/link";

const VALID_CATEGORIES = [
  "stage", "video", "lighting", "audio",
  "effects", "costumes", "props", "makeup", "others",
];

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
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

interface DetailPageProps {
  params: Promise<{ category: string; slug: string }>;
}

export default async function StageProductionDetailPage({ params }: DetailPageProps) {
  const { category, slug } = await params;

  if (!VALID_CATEGORIES.includes(category)) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Category Not Found
          </h1>
          <p className="text-gray-500">
            The stage production category &quot;{category}&quot; does not exist.
          </p>
        </div>
      </main>
    );
  }

  const displayCategory = CATEGORY_DISPLAY_NAMES[category] || category;
  const displayTitle = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/stage-production" className="hover:text-[#D96A32] transition-colors">
              Stage Production
            </Link>
            <span>/</span>
            <Link
              href={`/stage-production/${category}`}
              className="hover:text-[#D96A32] transition-colors"
            >
              {displayCategory}
            </Link>
            <span>/</span>
            <span className="max-w-xs truncate text-gray-400">{displayTitle}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Category Tag */}
        <div className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-600">
          {displayCategory}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          {displayTitle}
        </h1>

        {/* Date */}
        <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
          <span>Published on:</span>
          <time className="font-medium text-gray-700">June 25, 2026</time>
        </div>

        {/* Hero Image */}
        <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gray-100 shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200"
            alt={displayTitle}
            width={1200}
            height={675}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <article className="prose max-w-none space-y-6 text-gray-700 leading-relaxed lg:prose-lg">
          <p className="text-lg font-semibold text-gray-800">
            Stage production is a complex, collaborative art form that brings together design,
            technology, and performance into a unified live experience. At Hope Music Community,
            we celebrate every discipline that makes a show possible — from the first sketch
            to the final bow.
          </p>
          <p>
            Whether you are a lighting designer plotting your rig, a stage manager coordinating
            cues, or a costume designer sourcing materials, the technical backbone of live
            performance is what transforms a script into something unforgettable. This article
            explores best practices, emerging tools, and the craft behind the scenes.
          </p>
          <p>
            Our community resources are curated by working professionals with decades of
            combined experience across Broadway, touring productions, regional theater, and
            experimental venues. We believe that sharing knowledge elevates the entire industry.
          </p>
          <p>
            For collaboration inquiries, production partnerships, or to contribute your own
            expertise to our library, reach out through our community portal. Every voice
            matters in the making of great theater.
          </p>
        </article>

        {/* Back Link */}
        <div className="mt-10">
          <Link
            href={`/stage-production/${category}`}
            className="text-sm text-[#D96A32] transition-all duration-150 hover:translate-x-[-2px] hover:underline"
          >
            ← Back to {displayCategory}
          </Link>
        </div>
      </div>
    </main>
  );
}
