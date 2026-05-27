"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/convex";
import { useQuery } from "@/lib/convex";

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  authorUsername: string;
  authorAvatar: string;
  authorEmail: string;
  createdAt: number;
}

const ALL_CATEGORIES = [
  { value: "software", label: "Software", icon: "💻" },
  { value: "hardware", label: "Hardware", icon: "🎛️" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "production", label: "Production", icon: "🎬" },
  { value: "resources", label: "Resources", icon: "📚" },
  { value: "artical", label: "Article", icon: "📝" },
  { value: "others", label: "Others", icon: "💬" },
];

// Placeholder posts data
const PLACEHOLDER_POSTS = [
  { id: "1", title: "ISAT Interaction 2023 v1.0.4 Released", author: "DevTeam", replies: 24, views: 1520, category: "software", createdAt: Date.now() - 3600000 * 2 },
  { id: "2", title: "Best audio interfaces of 2026 — comprehensive review", author: "GearReviewer", replies: 89, views: 3240, category: "hardware", createdAt: Date.now() - 3600000 * 5 },
  { id: "3", title: "Songwriting 101: Finding your unique melodic voice", author: "Songsmith", replies: 73, views: 2180, category: "music", createdAt: Date.now() - 3600000 * 12 },
  { id: "4", title: "Lighting design fundamentals for live stage", author: "LightMaster", replies: 26, views: 890, category: "production", createdAt: Date.now() - 3600000 * 18 },
  { id: "5", title: "Free sample packs 2026 collection", author: "SampleVault", replies: 145, views: 4520, category: "resources", createdAt: Date.now() - 3600000 * 24 },
  { id: "6", title: "The rich history of musical theater", author: "TheaterBuff", replies: 94, views: 2890, category: "artical", createdAt: Date.now() - 3600000 * 36 },
  { id: "7", title: "Community event calendar — upcoming meetups", author: "EventLead", replies: 45, views: 1230, category: "others", createdAt: Date.now() - 3600000 * 48 },
  { id: "8", title: "MIDI controller mapping tutorial for live performance", author: "MIDI_Master", replies: 42, views: 1560, category: "software", createdAt: Date.now() - 3600000 * 60 },
  { id: "9", title: "Monitor speaker placement guide — acoustics for small rooms", author: "AcousticPro", replies: 35, views: 980, category: "hardware", createdAt: Date.now() - 3600000 * 72 },
  { id: "10", title: "Understanding modal scales beyond major and minor", author: "TheoryNerd", replies: 55, views: 1890, category: "music", createdAt: Date.now() - 3600000 * 84 },
  { id: "11", title: "Stage rigging safety standards", author: "SafetyOfficer", replies: 47, views: 1120, category: "production", createdAt: Date.now() - 3600000 * 96 },
  { id: "12", title: "DAW keyboard shortcuts cheat sheet", author: "ShortcutGuru", replies: 67, views: 2340, category: "resources", createdAt: Date.now() - 3600000 * 108 },
  { id: "13", title: "The 10 most influential composers of the 21st century", author: "MusicScholar", replies: 118, views: 3890, category: "artical", createdAt: Date.now() - 3600000 * 120 },
  { id: "14", title: "Introduce yourself to the Hope Music Community!", author: "NewMember", replies: 203, views: 5670, category: "others", createdAt: Date.now() - 3600000 * 132 },
  { id: "15", title: "Best free VST plugins for orchestral composition", author: "OrchestraFan", replies: 67, views: 2340, category: "software", createdAt: Date.now() - 3600000 * 144 },
];

interface PageProps {
  params: Promise<{ category: string }>;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function getCategoryInfo(value: string) {
  return ALL_CATEGORIES.find(c => c.value === value) || { value, label: value, icon: "📌" };
}

export default function InteractionCategoryPage({ params }: PageProps) {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setCurrentCategory(resolved.category);
      setLoading(false);
    }
    loadParams();
  }, [params]);

  // Load posts from Convex or localStorage
  const allPosts = useQuery(api.admin.listAllPosts) as Post[] | undefined;

  useEffect(() => {
    if (allPosts !== undefined) {
      const filtered = currentCategory
        ? allPosts.filter((p: Post) => p.category === currentCategory)
        : allPosts;
      setPosts(filtered.map((p: Post) => ({
        id: p._id,
        title: p.title,
        content: p.content,
        category: p.category,
        author: p.authorUsername || "Anonymous",
        replies: 0,
        views: Math.floor(Math.random() * 5000),
        createdAt: p.createdAt || Date.now(),
      })));
    } else {
      // Use placeholder posts filtered by category
      const filtered = currentCategory
        ? PLACEHOLDER_POSTS.filter(p => p.category === currentCategory)
        : PLACEHOLDER_POSTS;
      setPosts(filtered);
    }
  }, [allPosts, currentCategory]);

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === "popular") {
      return b.replies - a.replies;
    }
    return b.createdAt - a.createdAt;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
      </div>
    );
  }

  const currentCategoryInfo = currentCategory ? getCategoryInfo(currentCategory) : null;

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentCategoryInfo && (
                <>
                  <span className="text-2xl">{currentCategoryInfo.icon}</span>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{currentCategoryInfo.label}</h1>
                    <p className="text-sm text-gray-500">{posts.length} topics</p>
                  </div>
                </>
              )}
              {!currentCategory && (
                <>
                  <span className="text-2xl">💬</span>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Interaction</h1>
                    <p className="text-sm text-gray-500">{posts.length} topics</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Sort buttons */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSortBy("latest")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === "latest"
                      ? "bg-white text-[#D96A32] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    sortBy === "popular"
                      ? "bg-white text-[#D96A32] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Popular
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="w-56 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Categories</h3>
              </div>
              <div className="p-2">
                <Link
                  href="/interaction"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    !currentCategory
                      ? "bg-[#D96A32]/10 text-[#D96A32] font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>💬</span>
                  <span>All Topics</span>
                </Link>
                {ALL_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.value}
                    href={`/interaction/${cat.value}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      currentCategory === cat.value
                        ? "bg-[#D96A32]/10 text-[#D96A32] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content - Post List */}
          <div className="flex-1 min-w-0">
            {/* Post List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {sortedPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No topics yet. Be the first to start a discussion!</p>
                </div>
              ) : (
                sortedPosts.map((post, index) => {
                  const catInfo = getCategoryInfo(post.category);
                  return (
                    <Link
                      key={post.id}
                      href={`/interaction/${post.category}/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-4 hover:bg-amber-50/30 transition-colors ${
                        index !== sortedPosts.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Author Avatar */}
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#D96A32] to-[#C8102E] rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {(post.author as string).charAt(0).toUpperCase()}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              <span>{catInfo.icon}</span>
                              <span>{catInfo.label}</span>
                            </span>
                          </div>
                          <h3 className="text-base font-medium text-gray-900 hover:text-[#D96A32] line-clamp-1 mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="font-medium">{post.author}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(post.createdAt)} ago</span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex-shrink-0 flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mb-1">
                              <span className="text-lg">💬</span>
                            </div>
                            <span className="text-xs text-gray-500">{post.replies}</span>
                          </div>
                          <div className="text-center hidden sm:block">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg mb-1">
                              <span className="text-lg">👁</span>
                            </div>
                            <span className="text-xs text-gray-500">{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Pagination placeholder */}
            {sortedPosts.length > 0 && (
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-700">Page 1 of 1</span>
                  <button className="px-3 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Quick Stats */}
          <aside className="w-48 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Quick Stats</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#D96A32]">{posts.length}</div>
                  <div className="text-xs text-gray-500">Topics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {posts.reduce((sum, p) => sum + (p.replies || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-500">Replies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {ALL_CATEGORIES.length}
                  </div>
                  <div className="text-xs text-gray-500">Categories</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
