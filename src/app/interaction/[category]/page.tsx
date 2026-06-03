"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/convex";
import { useQuery_experimental } from "@/lib/convex";

// Wrapper to safely call useQuery without crashing on errors
function useAdminPosts() {
  const result = useQuery_experimental({
    query: api.admin.listAllPosts,
    throwOnError: false,
  });

  if (result.status === "success") {
    return result.data as Post[];
  }
  return undefined;
}

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
  { value: "artical", label: "Article", icon: "📝" },
  { value: "others", label: "Others", icon: "💬" },
];

// Placeholder posts data
const PLACEHOLDER_POSTS = [
  // Software (10)
  { id: "ph-soft-1", title: "ISAT Interaction 2023 v1.0.4 Released", author: "DevTeam", replies: 24, views: 1520, category: "software", createdAt: Date.now() - 3600000 * 2 },
  { id: "ph-soft-2", title: "How to optimize latent settings in DAW Soundworks", author: "AudioPro", replies: 18, views: 890, category: "software", createdAt: Date.now() - 3600000 * 5 },
  { id: "ph-soft-3", title: "MIDI controller mapping tutorial for live performance", author: "MIDI_Master", replies: 42, views: 1560, category: "software", createdAt: Date.now() - 3600000 * 12 },
  { id: "ph-soft-4", title: "Best free VST plugins for orchestral composition", author: "OrchestraFan", replies: 67, views: 2340, category: "software", createdAt: Date.now() - 3600000 * 24 },
  { id: "ph-soft-5", title: "Audio interface latency troubleshooting guide", author: "StudioGuru", replies: 31, views: 1120, category: "software", createdAt: Date.now() - 3600000 * 36 },
  { id: "ph-soft-6", title: "Setting up multi-monitor workspace for mixing", author: "MixEngineer", replies: 15, views: 780, category: "software", createdAt: Date.now() - 3600000 * 48 },
  { id: "ph-soft-7", title: "Cloud collaboration tools for remote music production", author: "RemoteBeat", replies: 28, views: 1450, category: "software", createdAt: Date.now() - 3600000 * 60 },
  { id: "ph-soft-8", title: "Automating reverb sends with sidechain compression", author: "FXWizard", replies: 19, views: 920, category: "software", createdAt: Date.now() - 3600000 * 72 },
  { id: "ph-soft-9", title: "Exporting stems correctly for film scoring projects", author: "FilmScore", replies: 36, views: 1680, category: "software", createdAt: Date.now() - 3600000 * 84 },
  { id: "ph-soft-10", title: "Building a custom macro pad for live DJ sets", author: "DJLIVE", replies: 22, views: 1050, category: "software", createdAt: Date.now() - 3600000 * 96 },
  // Hardware (10)
  { id: "ph-hard-1", title: "Best audio interfaces of 2026 — comprehensive comparison", author: "GearReviewer", replies: 89, views: 3240, category: "hardware", createdAt: Date.now() - 3600000 * 3 },
  { id: "ph-hard-2", title: "Monitor speaker placement guide — acoustics for small rooms", author: "AcousticPro", replies: 45, views: 1980, category: "hardware", createdAt: Date.now() - 3600000 * 8 },
  { id: "ph-hard-3", title: "Understanding microphone polar patterns", author: "MicExpert", replies: 33, views: 1420, category: "hardware", createdAt: Date.now() - 3600000 * 20 },
  { id: "ph-hard-4", title: "DI box explained: active vs passive", author: "LiveSound", replies: 27, views: 1180, category: "hardware", createdAt: Date.now() - 3600000 * 32 },
  { id: "ph-hard-5", title: "Audio cabling basics — balanced vs unbalanced", author: "CableKing", replies: 19, views: 890, category: "hardware", createdAt: Date.now() - 3600000 * 44 },
  { id: "ph-hard-6", title: "DIY acoustic treatment on a budget", author: "BudgetStudio", replies: 62, views: 2560, category: "hardware", createdAt: Date.now() - 3600000 * 56 },
  { id: "ph-hard-7", title: "Headphone amplifier pairing guide", author: "Audiophile", replies: 38, views: 1650, category: "hardware", createdAt: Date.now() - 3600000 * 68 },
  { id: "ph-hard-8", title: "How to choose the right MIDI keyboard", author: "KeysPlayer", replies: 51, views: 2180, category: "hardware", createdAt: Date.now() - 3600000 * 80 },
  { id: "ph-hard-9", title: "Studio furniture and desk setup essentials", author: "StudioBuilder", replies: 29, views: 1340, category: "hardware", createdAt: Date.now() - 3600000 * 92 },
  { id: "ph-hard-10", title: "Power conditioning and surge protection guide", author: "SafetyFirst", replies: 16, views: 720, category: "hardware", createdAt: Date.now() - 3600000 * 104 },
  // Music (10)
  { id: "ph-music-1", title: "Songwriting 101: Finding your unique melodic voice", author: "Songsmith", replies: 73, views: 2890, category: "music", createdAt: Date.now() - 3600000 * 4 },
  { id: "ph-music-2", title: "Orchestral arrangement tips for small ensembles", author: "Arranger", replies: 41, views: 1780, category: "music", createdAt: Date.now() - 3600000 * 16 },
  { id: "ph-music-3", title: "Understanding modal scales beyond major and minor", author: "TheoryNerd", replies: 55, views: 2340, category: "music", createdAt: Date.now() - 3600000 * 28 },
  { id: "ph-music-4", title: "Music theory for producers", author: "BeatMaker", replies: 88, views: 3450, category: "music", createdAt: Date.now() - 3600000 * 40 },
  { id: "ph-music-5", title: "Creating emotional chord progressions", author: "Composer", replies: 64, views: 2670, category: "music", createdAt: Date.now() - 3600000 * 52 },
  { id: "ph-music-6", title: "Rhythm and groove fundamentals", author: "Drummer", replies: 37, views: 1560, category: "music", createdAt: Date.now() - 3600000 * 64 },
  { id: "ph-music-7", title: "Melody writing techniques", author: "Melodist", replies: 49, views: 2040, category: "music", createdAt: Date.now() - 3600000 * 76 },
  { id: "ph-music-8", title: "Harmonic color — using extended chords", author: "JazzCat", replies: 42, views: 1890, category: "music", createdAt: Date.now() - 3600000 * 88 },
  { id: "ph-music-9", title: "Arranging for different ensembles", author: "EnsembleLead", replies: 31, views: 1420, category: "music", createdAt: Date.now() - 3600000 * 100 },
  { id: "ph-music-10", title: "Music production workflow optimization", author: "ProducerX", replies: 58, views: 2450, category: "music", createdAt: Date.now() - 3600000 * 112 },
  // Production (10)
  { id: "ph-prod-1", title: "Lighting design fundamentals for live stage", author: "LightMaster", replies: 26, views: 1120, category: "production", createdAt: Date.now() - 3600000 * 6 },
  { id: "ph-prod-2", title: "Sound reinforcement setup for live theater", author: "SoundTech", replies: 34, views: 1450, category: "production", createdAt: Date.now() - 3600000 * 18 },
  { id: "ph-prod-3", title: "Stage rigging safety standards", author: "SafetyOfficer", replies: 47, views: 1980, category: "production", createdAt: Date.now() - 3600000 * 30 },
  { id: "ph-prod-4", title: "Projection mapping techniques", author: "VisualArtist", replies: 39, views: 1670, category: "production", createdAt: Date.now() - 3600000 * 42 },
  { id: "ph-prod-5", title: "Set design and construction on a budget", author: "SetBuilder", replies: 28, views: 1220, category: "production", createdAt: Date.now() - 3600000 * 54 },
  { id: "ph-prod-6", title: "AV system integration for venues", author: "AVIntegrator", replies: 21, views: 980, category: "production", createdAt: Date.now() - 3600000 * 66 },
  { id: "ph-prod-7", title: "Backstage communication protocols", author: "StageManager", replies: 15, views: 720, category: "production", createdAt: Date.now() - 3600000 * 78 },
  { id: "ph-prod-8", title: "Pyrotechnics and special effects safety", author: "FXTech", replies: 33, views: 1420, category: "production", createdAt: Date.now() - 3600000 * 90 },
  { id: "ph-prod-9", title: "Live mixing techniques for bands", author: "LiveMixer", replies: 52, views: 2180, category: "production", createdAt: Date.now() - 3600000 * 102 },
  { id: "ph-prod-10", title: "Stage management best practices", author: "ProManager", replies: 19, views: 890, category: "production", createdAt: Date.now() - 3600000 * 114 },
  // Article (10)
  { id: "ph-art-1", title: "The rich history of musical theater", author: "TheaterBuff", replies: 94, views: 3560, category: "artical", createdAt: Date.now() - 3600000 * 7 },
  { id: "ph-art-2", title: "The evolution of recording technology", author: "HistoryNerd", replies: 71, views: 2780, category: "artical", createdAt: Date.now() - 3600000 * 19 },
  { id: "ph-art-3", title: "The 10 most influential composers of the 21st century", author: "MusicScholar", replies: 118, views: 4560, category: "artical", createdAt: Date.now() - 3600000 * 31 },
  { id: "ph-art-4", title: "Psychoacoustics: how the brain processes music", author: "ScienceGuy", replies: 63, views: 2450, category: "artical", createdAt: Date.now() - 3600000 * 43 },
  { id: "ph-art-5", title: "Music therapy research — evidence-based practice", author: "Therapist", replies: 45, views: 1890, category: "artical", createdAt: Date.now() - 3600000 * 55 },
  { id: "ph-art-6", title: "Copyright law for independent musicians", author: "LegalEagle", replies: 82, views: 3240, category: "artical", createdAt: Date.now() - 3600000 * 67 },
  { id: "ph-art-7", title: "The streaming era — understanding music economics", author: "EconMajor", replies: 97, views: 3780, category: "artical", createdAt: Date.now() - 3600000 * 79 },
  { id: "ph-art-8", title: "AI in music composition", author: "AITech", replies: 156, views: 5890, category: "artical", createdAt: Date.now() - 3600000 * 91 },
  { id: "ph-art-9", title: "The future of live music performances", author: "Futurist", replies: 74, views: 2890, category: "artical", createdAt: Date.now() - 3600000 * 103 },
  { id: "ph-art-10", title: "Music education trends and innovations", author: "EduExpert", replies: 38, views: 1560, category: "artical", createdAt: Date.now() - 3600000 * 115 },
  // Others (10)
  { id: "ph-oth-1", title: "Community guidelines — keeping our forum respectful", author: "Admin", replies: 12, views: 890, category: "others", createdAt: Date.now() - 3600000 * 168 },
  { id: "ph-oth-2", title: "Community event calendar — upcoming meetups", author: "EventLead", replies: 45, views: 1890, category: "others", createdAt: Date.now() - 3600000 * 72 },
  { id: "ph-oth-3", title: "Introduce yourself to the Hope Music Community!", author: "NewMember", replies: 203, views: 6780, category: "others", createdAt: Date.now() - 3600000 * 24 },
  { id: "ph-oth-4", title: "Resources and tutorials master list", author: "Librarian", replies: 89, views: 3450, category: "others", createdAt: Date.now() - 3600000 * 48 },
  { id: "ph-oth-5", title: "Collaboration opportunities", author: "CollabHub", replies: 67, views: 2560, category: "others", createdAt: Date.now() - 3600000 * 36 },
  { id: "ph-oth-6", title: "Gear marketplace — buy, sell, and trade", author: "MarketMaster", replies: 134, views: 4890, category: "others", createdAt: Date.now() - 3600000 * 12 },
  { id: "ph-oth-7", title: "Feedback welcome — share your thoughts", author: "FeedbackBot", replies: 56, views: 2180, category: "others", createdAt: Date.now() - 3600000 * 60 },
  { id: "ph-oth-8", title: "Support and help desk", author: "SupportTeam", replies: 78, views: 2890, category: "others", createdAt: Date.now() - 3600000 * 18 },
  { id: "ph-oth-9", title: "Weekly listening sessions schedule", author: "DJSchedule", replies: 34, views: 1450, category: "others", createdAt: Date.now() - 3600000 * 84 },
  { id: "ph-oth-10", title: "Feature requests and suggestions board", author: "FeatureReq", replies: 92, views: 3560, category: "others", createdAt: Date.now() - 3600000 * 96 },
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

export default function InteractionCategoryPage({ params }: PageProps) {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
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
  const allPosts = useAdminPosts();

  useEffect(() => {
    if (!currentCategory) return;

    // First try Convex (only if we got data back without error)
    if (allPosts && allPosts.length > 0) {
      const filtered = allPosts.filter((p: Post) => p.category === currentCategory);
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
      // Fall back to localStorage (admin-created posts)
      const stored = localStorage.getItem("admin_interaction");
      if (stored) {
        const localPosts = JSON.parse(stored);
        const filtered = currentCategory
          ? localPosts.filter((p: any) => p.category === currentCategory)
          : localPosts;
        setPosts(filtered);
      } else {
        // Final fallback to placeholders
        const filtered = currentCategory
          ? PLACEHOLDER_POSTS.filter(p => p.category === currentCategory)
          : PLACEHOLDER_POSTS;
        setPosts(filtered);
      }
    }
  }, [allPosts, currentCategory]);

  // Filter and sort posts
  const filteredPosts = posts.filter(post => {
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (timeFilter !== "all") {
      const now = Date.now();
      const age = now - post.createdAt;
      const day = 24 * 3600000;
      switch (timeFilter) {
        case "today": if (age > day) return false; break;
        case "week": if (age > 7 * day) return false; break;
        case "month": if (age > 30 * day) return false; break;
        case "year": if (age > 365 * day) return false; break;
      }
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "popular") {
      return (b.replies || 0) - (a.replies || 0);
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

  const currentCategoryInfo = currentCategory ? ALL_CATEGORIES.find(c => c.value === currentCategory) : null;
  const currentCategoryLabel = currentCategoryInfo?.label?.toUpperCase() || "INTERACTION";

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Link href="/interaction" className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">{currentCategoryLabel}</h1>
            </div>
            <div className="text-sm text-gray-500">
              45,987 Members | {posts.length} Topics
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-200 -mb-px">
            {["All Topics", "By Category", "Latest"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(" ", "-"))}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase().replace(" ", "-")
                    ? "border-[#D96A32] text-[#D96A32]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none"
          >
            <option value="latest">Latest</option>
            <option value="popular">Most Popular</option>
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Filter Button */}
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Filter
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* New Topic Button */}
          <button className="px-4 py-2 bg-[#D96A32] text-white rounded-lg text-sm font-medium hover:bg-[#c45a28] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Topic
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
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

          {/* Main Content - Reddit-style Card List */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {sortedPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No topics found. Be the first to start a discussion!</p>
                </div>
              ) : (
                sortedPosts.map((post, index) => {
                  const catInfo = ALL_CATEGORIES.find(c => c.value === post.category) || { value: post.category, label: post.category, icon: "📌" };
                  return (
                    <Link
                      key={post.id}
                      href={`/interaction/${post.category}/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-4 hover:bg-gray-50 transition-colors ${
                        index !== sortedPosts.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Author Avatar - Real photo style */}
                        <img
                          src={`https://i.pravatar.cc/80?u=${encodeURIComponent(post.author as string)}`}
                          alt={post.author as string}
                          className="flex-shrink-0 w-10 h-10 rounded-full"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 hover:text-[#D96A32] line-clamp-2 mb-1">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium text-gray-600">{post.author}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>

                        {/* Stats - Right Side */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
                            <span className="text-xs font-medium text-green-700">{post.replies || 0}</span>
                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-0.5">
                            <span className="text-xs text-gray-400">{post.views || 0}</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Pagination */}
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
