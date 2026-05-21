import React from "react";
import Image from "next/image";

interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Category Tag Header */}
      <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
        News
      </div>

      {/* 1. Main Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
        Announcing the 2024 Global Musicals Gala line-up
      </h1>

      {/* 2. Date Section */}
      <div className="text-gray-500 text-sm mb-8 flex items-center gap-2">
        <span>Published on:</span>
        <time className="font-medium text-gray-700">June 25, 2026</time>
      </div>

      {/* 3. Hero Image Section */}
      <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-md mb-8 bg-gray-100">
        <Image
          src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200"
          alt="News article banner"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </div>

      {/* 4. Full Formatted Text Content */}
      <article className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed">
        <p className="font-semibold text-lg text-gray-800">
          We are thrilled to officially announce the lineup for the 2024 Global Musicals Gala, featuring world-renowned performers and groundbreaking theatrical productions from across the globe.
        </p>
        <p>
          This year&apos;s gala promises to be the most ambitious yet, bringing together award-winning composers, directors, and performers from Broadway, West End, and international stages. Audiences can expect exclusive previews of upcoming productions, live performances of classic musical numbers, and behind-the-scenes insights into the creative process.
        </p>
        <p>
          &quot;This Gala represents the pinnacle of musical theater excellence,&quot; noted the artistic director. &quot;We&apos;ve curated a program that celebrates both timeless classics and innovative new works that push the boundaries of what musical theater can achieve.&quot;
        </p>
        <p>
          Stay tuned for detailed schedule announcements, ticket availability, and special VIP experiences. For group bookings and institutional partnerships, please reach out through our collaboration portals.
        </p>
      </article>
    </div>
  );
}
