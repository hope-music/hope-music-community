"use client";

import { InteractionForumList } from "@/components/interaction/InteractionForumList";
import { MOCK_FORUM_POSTS } from "@/lib/mock-forum-data";
import { use } from "react";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  software: "Software",
  hardware: "Hardware",
  music: "Music",
  "stage-production": "Stage Production",
  artical: "Artical",
  others: "Others",
};

export default function InteractionCategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);
  const displayName = CATEGORY_DISPLAY_NAMES[category] || category;
  const posts = MOCK_FORUM_POSTS[category] ?? [];

  return (
    <InteractionForumList
      category={displayName}
      posts={posts}
      categorySlug={category}
    />
  );
}
