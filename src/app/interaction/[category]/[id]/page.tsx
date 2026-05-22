"use client";

import { use } from "react";
import Link from "next/link";

const VALID_CATEGORIES = [
  "software",
  "hardware",
  "music",
  "stage-production",
  "artical",
  "others",
];

const CATEGORY_DISPLAY: Record<string, string> = {
  software: "Software",
  hardware: "Hardware",
  music: "Music",
  "stage-production": "Stage Production",
  artical: "Artical",
  others: "Others",
};

const FALLBACK_AUTHORS: Record<string, string> = {
  software: "HopeAdmin",
  hardware: "GearReviewer",
  music: "SongCraft_Maya",
  "stage-production": "LiveSound_Tech",
  artical: "TheaterHistorian_Mara",
  others: "CommunityLead_Amara",
};

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
];

const FALLBACK_CONTENT: Record<string, string> = {
  software: "This thread discusses important software-related topics for the Hope Music Community. Join the conversation and share your insights with fellow members.\n\nOur community is actively discussing the latest tools, plugins, and workflows that can enhance your music production experience.",
  hardware:
    "This thread covers essential hardware topics for audio professionals and enthusiasts. From interfaces to microphones, our community shares real-world experiences and recommendations.\n\nFeel free to contribute your own hardware discoveries and troubleshooting tips.",
  music: "This thread explores the creative and theoretical side of music. Our members share techniques, inspiration, and deep dives into what makes music work.\n\nJoin the discussion and let your voice be heard in our passionate music community.",
  "stage-production":
    "This thread dives into live production, staging, and technical execution. Our experienced members share best practices for running professional shows.\n\nSafety, efficiency, and creative excellence are at the heart of this conversation.",
  artical:
    "This article-driven thread shares knowledge and perspective on important music industry topics. Our community curates insights that matter to working musicians and industry professionals.\n\nWe welcome well-reasoned contributions from all perspectives.",
  others:
    "This thread is part of our community hub where members connect, share resources, and support each other. From introductions to announcements, our community forum covers it all.\n\nWelcome — we're glad you're here.",
};

function FallbackThread({
  id,
  category,
  categoryDisplay,
}: {
  id: string;
  category: string;
  categoryDisplay: string;
}) {
  const displayTitle = id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const avatarUrl = AVATAR_URLS[Math.floor(Math.random() * AVATAR_URLS.length)];
  const author = FALLBACK_AUTHORS[category] || "HopeAdmin";
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const fallbackContent =
    FALLBACK_CONTENT[category] ||
    FALLBACK_CONTENT["others"];

  const sampleReplies = [
    {
      id: "r1",
      author: "AudioEngineer_Mike",
      avatarUrl: AVATAR_URLS[2],
      date: `${today} at 10:30 AM`,
      floor: 2,
      content:
        "Great topic — this is something I've been thinking about a lot lately. The more I work in this field, the more I appreciate the nuance here.",
    },
    {
      id: "r2",
      author: "GearReviewer",
      avatarUrl: AVATAR_URLS[3],
      date: `${today} at 11:45 AM`,
      floor: 3,
      content:
        "Completely agree. I've been recommending this approach to everyone in my network. It makes a real difference in practice.",
    },
    {
      id: "r3",
      author: "HarmonyGuru_Omar",
      avatarUrl: AVATAR_URLS[0],
      date: `${today} at 1:15 PM`,
      floor: 4,
      content:
        "Thanks for bringing this up — I think more people need to understand the fundamentals before jumping to conclusions. Well said.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link
              href="/interaction"
              className="hover:text-[#D96A32] transition-colors"
            >
              Forum
            </Link>
            <span>/</span>
            <Link
              href={`/interaction/${category}`}
              className="hover:text-[#D96A32] transition-colors"
            >
              {categoryDisplay}
            </Link>
            <span>/</span>
            <span className="truncate max-w-xs text-gray-400">{displayTitle}</span>
          </nav>
        </div>
      </div>

      {/* Thread Header */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start gap-4">
            <img
              src={avatarUrl}
              alt={author}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{displayTitle}</h1>
                <span className="shrink-0 rounded bg-[#C8102E] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  #1
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Posted by{" "}
                <span className="font-medium text-gray-700">{author}</span> •{" "}
                {today}
              </p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none text-gray-700">
            {fallbackContent.split("\n\n").map((para, i) => (
              <p key={i} className="mb-4 text-[15px] leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>

        {/* Reply Count */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {sampleReplies.length} Replies
          </h2>
          <a
            href={`/interaction/${category}`}
            className="text-sm text-[#D96A32] transition-all duration-150 hover:translate-x-[-2px] hover:underline"
          >
            ← Back to {categoryDisplay}
          </a>
        </div>

        {/* Replies */}
        <div className="mb-6 flex flex-col gap-4">
          {sampleReplies.map((reply) => (
            <div
              key={reply.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#D96A32] hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="mb-3 flex items-center gap-3">
                <img
                  src={reply.avatarUrl}
                  alt={reply.author}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    {reply.author}
                  </span>
                  <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    #{reply.floor}
                  </span>
                </div>
                <span className="ml-auto text-xs text-gray-400">{reply.date}</span>
              </div>
              <p className="text-[15px] leading-relaxed text-gray-700">
                {reply.content}
              </p>
            </div>
          ))}
        </div>

        {/* Leave a Reply */}
        <div className="rounded-xl border-2 border-dashed border-[#D96A32] bg-orange-50 p-6 text-center">
          <p className="mb-3 text-sm font-medium text-gray-600">
            Want to contribute to this discussion?
          </p>
          <button
            type="button"
            className="rounded-xl bg-[#C8102E] px-8 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 hover:bg-[#a00d26] hover:shadow-md active:scale-95"
          >
            Leave a Reply
          </button>
        </div>
      </div>
    </main>
  );
}

export default function InteractionDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = use(params);

  const isValidCategory = VALID_CATEGORIES.includes(category);
  const displayName = CATEGORY_DISPLAY[category] || category;

  if (!isValidCategory) {
    return (
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Category Not Found
          </h1>
          <p className="mb-6 text-gray-500">
            The category &quot;{category}&quot; does not exist.
          </p>
          <Link
            href="/interaction"
            className="text-[#D96A32] hover:underline"
          >
            ← Back to Forum
          </Link>
        </div>
      </main>
    );
  }

  return (
    <FallbackThread
      id={id}
      category={category}
      categoryDisplay={displayName}
    />
  );
}
