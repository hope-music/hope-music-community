"use client";

import { InteractionThread } from "@/components/interaction/InteractionThread";
import { MOCK_THREAD_POSTS } from "@/lib/mock-forum-data";
import { use } from "react";

interface DetailPageProps {
  params: Promise<{ category: string; id: string }>;
}

export default function InteractionDetailPage({ params }: DetailPageProps) {
  const { category, id } = use(params);
  const categoryPosts = MOCK_THREAD_POSTS[category] ?? [];
  const post = categoryPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Thread Not Found</h1>
          <p className="text-gray-500">
            This thread may have been removed or the link is invalid.
          </p>
          <a
            href={`/interaction/${category}`}
            className="mt-6 inline-block text-[#D96A32] hover:underline"
          >
            ← Back to {category}
          </a>
        </div>
      </main>
    );
  }

  return <InteractionThread post={post} categorySlug={category} />;
}
