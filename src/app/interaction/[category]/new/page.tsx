"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  authorName: string;
  authorEmail: string;
  createdAt: number;
}

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  software: { label: "Software", icon: "💻" },
  hardware: { label: "Hardware", icon: "🎛️" },
  music: { label: "Music", icon: "🎵" },
  production: { label: "Production", icon: "🎬" },
  resources: { label: "Resources", icon: "📚" },
  other: { label: "Other", icon: "💬" },
};

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function NewPostPage({ params }: PageProps) {
  const router = useRouter();
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentUser, setCurrentUser] = useState<{ username: string; email: string } | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    params.then(({ category }) => {
      setCurrentCategory(category);
    });
  }, [params]);

  useEffect(() => {
    const userData = localStorage.getItem("hmc_current_user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        username: user.username,
        email: user.email,
      });
    } else {
      // For non-signed in users, redirect to login
      router.push("/login");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !currentUser) return;

    setSubmitting(true);

    const stored = localStorage.getItem("forum_posts");
    const posts: Post[] = stored ? JSON.parse(stored) : [];

    const newPost: Post = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      category: currentCategory,
      authorName: currentUser.username,
      authorEmail: currentUser.email,
      createdAt: Date.now(),
    };

    posts.unshift(newPost);
    localStorage.setItem("forum_posts", JSON.stringify(posts));

    router.push(`/interaction/${currentCategory}/${newPost.id}`);
  };

  const categoryInfo = CATEGORY_MAP[currentCategory] || { label: currentCategory, icon: "💬" };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-t border-[#D96A32]">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href={`/interaction/${currentCategory}`} className="inline-flex items-center text-sm text-gray-500 hover:text-[#D96A32]">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {categoryInfo.label}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Topic</h1>
          <p className="mt-1 text-sm text-gray-500">
            Posting in <span className="font-medium">{categoryInfo.label}</span> as <span className="font-medium">{currentUser.username}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your topic about?"
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-[#D96A32] focus:outline-none focus:ring-1 focus:ring-[#D96A32]"
              required
              maxLength={200}
            />
            <p className="mt-1 text-xs text-gray-400">{title.length}/200 characters</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, questions, or ideas..."
              rows={10}
              className="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-[#D96A32] focus:outline-none focus:ring-1 focus:ring-[#D96A32] resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <Link
              href={`/interaction/${currentCategory}`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="rounded-md bg-[#D96A32] px-6 py-2 text-sm font-medium text-white hover:bg-[#c45a28] disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post Topic"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
