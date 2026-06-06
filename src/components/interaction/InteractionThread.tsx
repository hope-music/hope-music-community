"use client";

import Image from "next/image";
import { useState } from "react";

export interface Reply {
  id: string;
  author: string;
  avatarUrl: string;
  date: string;
  content: string;
  floor: number;
}

export interface ThreadPost {
  id: string;
  title: string;
  author: string;
  avatarUrl: string;
  date: string;
  content: string;
  replies: Reply[];
}

interface InteractionThreadProps {
  post: ThreadPost;
  categorySlug: string;
}

const GUEST_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop";

function formatNow(): string {
  const now = new Date();
  return now.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function InteractionThread({ post, categorySlug }: InteractionThreadProps) {
  const [replies, setReplies] = useState<Reply[]>(post.replies);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    const newFloor = replies.length + 2;
    const newReply: Reply = {
      id: `local-${Date.now()}`,
      author: "You (Guest)",
      avatarUrl: GUEST_AVATAR,
      date: formatNow(),
      content: replyText.trim(),
      floor: newFloor,
    };

    setReplies((prev) => [...prev, newReply]);
    setReplyText("");
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Back to Category */}
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3">
          <a
            href={`/interaction/${categorySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-hmc-text-muted transition-colors hover:text-hmc-orange"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to {categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Post Content (#1 Floor) */}
        <article className="mb-10 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between">
            <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {post.title}
            </h1>
            <span className="ml-4 shrink-0 rounded bg-hmc-red px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              #1
            </span>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
              <Image
                src={post.avatarUrl}
                alt={post.author}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">{post.author}</span>
              <time className="text-xs text-hmc-text-muted">{post.date}</time>
            </div>
          </div>

          <div className="prose max-w-none leading-relaxed text-gray-700">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        </article>

        {/* Reply Stream */}
        {replies.length > 0 && (
          <div className="mb-8 flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-hmc-text-muted">
              {replies.length} {replies.length === 1 ? "Comment" : "Comments"}
            </h2>

            {replies.map((reply) => (
              <article
                key={reply.id}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                {/* Reply Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-200">
                      <Image
                        src={reply.avatarUrl}
                        alt={reply.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{reply.author}</span>
                      <time className="text-xs text-hmc-text-muted">{reply.date}</time>
                    </div>
                  </div>
                  <span className="rounded bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-hmc-text-muted">
                    #{reply.floor}
                  </span>
                </div>

                {/* Reply Content */}
                <div className="prose max-w-none leading-relaxed text-gray-700">
                  <p className="whitespace-pre-wrap">{reply.content}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Reply Form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-gray-900">Comments</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your comment here..."
              rows={5}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 placeholder-gray-400 transition-colors focus:border-hmc-orange focus:outline-none focus:ring-2 focus:ring-hmc-orange/20"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!replyText.trim() || isSubmitting}
                className="rounded-xl bg-hmc-red px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-hmc-red disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
