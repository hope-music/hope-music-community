import React from 'react';
import Image from 'next/image';

interface DetailPageProps {
  params: Promise<{ category: string; slug: string }> | { category: string; slug: string };
}

export default async function PerformanceDetailPage({ params }: DetailPageProps) {
  const resolvedParams = await params;
  const { category, slug } = resolvedParams;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Category Tag Header */}
      <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
        {category} / {slug.replace(/-/g, ' ')}
      </div>
      
      {/* 1. Main Title */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
        Celebrate Teacher Appreciation Week by Announcing New Back to School Campaign
      </h1>
      
      {/* 2. Date Section */}
      <div className="text-gray-500 text-sm mb-8 flex items-center gap-2">
        <span>Published on:</span>
        <time className="font-medium text-gray-700">May 15, 2024</time>
      </div>

      {/* 3. Hero Image Section */}
      <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-md mb-8 bg-gray-100">
        <Image 
          src="https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200"
          alt="Performance Detail banner" 
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
        />
      </div>

      {/* 4. Full Formatted Text Content */}
      <article className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed">
        <p className="font-semibold text-lg text-gray-800">
          We are thrilled to officially launch our highly anticipated Back to School campaign, perfectly timed with Teacher Appreciation Week to honor the educators who shape our community.
        </p>
        <p>
          This campaign introduces a series of new immersive musical workshops, updated curriculum support, and discounted group performance tracks for academic institutions. Over the upcoming months, our specialized production team will cooperate directly with regional music departments to bring premium musical theater experiences onto local stages.
        </p>
        <p>
          "Teachers are the backbone of our creative industry's future," noted the artistic director of Hope Music Community. "By investing heavily in accessible performance rights and high-quality stage toolkits, we aim to eliminate barriers and allow schools to shine on their own terms."
        </p>
        <p>
          Stay tuned for detailed registration timelines and regional workshop schedules. For project applications and immediate business collaboration requests, please navigate through our active cooperation portals.
        </p>
      </article>
    </div>
  );
}
