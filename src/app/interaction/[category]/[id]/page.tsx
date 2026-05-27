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

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
  replies: Comment[];
}

const CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "music", label: "Music" },
  { value: "production", label: "Production" },
  { value: "resources", label: "Resources" },
  { value: "other", label: "Other" },
  { value: "artical", label: "Article" },
  { value: "others", label: "Others" },
];

// Demo content for placeholder posts
const DEMO_POSTS: Record<string, { title: string; content: string; author: string; createdAt: number }> = {
  "ph-soft-1": {
    title: "ISAT Interaction 2023 v1.0.4 Released",
    content: `<p class="text-lg font-semibold text-gray-800 mb-4">We're excited to announce the release of ISAT Interaction 2023 v1.0.4!</p>
    <p class="mb-3">This major update includes:</p>
    <ul class="list-disc pl-6 mb-4 space-y-2">
      <li>New timeline visualization with improved performance</li>
      <li>Enhanced MIDI learn functionality</li>
      <li>Support for the latest audio interface protocols</li>
      <li>Bug fixes and stability improvements</li>
    </ul>
    <p>Download the update from our website. As always, we appreciate your feedback and support!</p>`,
    author: "DevTeam",
    createdAt: Date.now() - 3600000 * 2,
  },
  "ph-soft-2": {
    title: "How to optimize latent settings in DAW Soundworks",
    content: `<p class="text-lg font-semibold text-gray-800 mb-4">A comprehensive guide to reducing latency in DAW Soundworks.</p>
    <p class="mb-3">Latency is one of the most common issues producers face. Here's how to minimize it:</p>
    <ol class="list-decimal pl-6 mb-4 space-y-2">
      <li><strong>Buffer Size:</strong> Lower buffer sizes reduce latency but increase CPU usage</li>
      <li><strong>Driver Mode:</strong> Use ASIO drivers for Windows, Core Audio for Mac</li>
      <li><strong>Interface Settings:</strong> Enable direct monitoring when possible</li>
      <li><strong>Plugin Management:</strong> Freeze or bounce tracks with heavy plugins</li>
    </ol>
    <p>Let me know if you have questions!</p>`,
    author: "AudioPro",
    createdAt: Date.now() - 3600000 * 5,
  },
};

// Default demo content
const DEFAULT_DEMO = {
  title: "Discussion Topic",
  content: `<p class="text-lg font-semibold text-gray-800 mb-4">Welcome to this discussion!</p>
  <p class="mb-3">This is a placeholder topic. The actual content will be loaded when you create a real post.</p>
  <p>Feel free to share your thoughts and engage with the community!</p>`,
  author: "Community Member",
  createdAt: Date.now() - 3600000,
};

interface PageProps {
  params: Promise<{ category: string; id: string }>;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function InteractionDetailPage({ params }: PageProps) {
  const [category, setCategory] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [postId, setPostId] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");

  // Load params
  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setCategory(resolved.category);
      setPostId(resolved.id);
      setCategoryLabel(CATEGORIES.find((c) => c.value === resolved.category)?.label || resolved.category);
    }
    loadParams();
  }, [params]);

  // Load post from Convex or localStorage
  const allPosts = useQuery(api.admin.listAllPosts) as Post[] | undefined;

  useEffect(() => {
    if (!postId || !category) return;

    // Check if it's a demo post
    if (postId.startsWith("ph-") || postId.startsWith("demo-")) {
      const demoPost = DEMO_POSTS[postId] || { ...DEFAULT_DEMO, title: `Topic: ${postId}` };
      setPost({
        _id: postId,
        title: demoPost.title,
        content: demoPost.content,
        category: category,
        authorUsername: demoPost.author,
        authorAvatar: "",
        authorEmail: "",
        createdAt: demoPost.createdAt,
      });
      setLoading(false);
      return;
    }

    // Try to find post in Convex data
    if (allPosts !== undefined) {
      const found = allPosts.find((p: Post) => 
        (p._id === postId || p._id.toString() === postId) && p.category === category
      );
      if (found) {
        setPost(found);
      }
      setLoading(false);
      return;
    }

    // Try localStorage
    const stored = localStorage.getItem("admin_interaction");
    if (stored) {
      const data = JSON.parse(stored);
      const found = data.find((p: any) => p.id === postId && p.category === category);
      if (found) {
        setPost({
          _id: found.id,
          title: found.title,
          content: found.content,
          category: found.category,
          authorUsername: found.author || "Anonymous",
          authorAvatar: found.coverImage || "",
          authorEmail: "",
          createdAt: found.createdAt || Date.now(),
        });
      }
    }
    setLoading(false);
  }, [allPosts, postId, category]);

  // Load comments
  useEffect(() => {
    if (!postId) return;
    const stored = localStorage.getItem("interaction_comments");
    if (stored) {
      const allComments = JSON.parse(stored);
      setComments(allComments[postId] || []);
    }
  }, [postId]);

  // Save comments
  const saveComments = (newComments: Comment[]) => {
    const stored = localStorage.getItem("interaction_comments");
    const allComments = stored ? JSON.parse(stored) : {};
    allComments[postId] = newComments;
    localStorage.setItem("interaction_comments", JSON.stringify(allComments));
    setComments(newComments);
  };

  // Submit comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      authorName: authorName.trim(),
      content: newComment.trim(),
      createdAt: Date.now(),
      replies: [],
    };

    saveComments([comment, ...comments]);
    setNewComment("");
  };

  // Submit reply
  const handleSubmitReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim()) return;

    const reply: Comment = {
      id: Date.now().toString(),
      authorName: replyAuthor.trim(),
      content: replyContent.trim(),
      createdAt: Date.now(),
      replies: [],
    };

    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return { ...c, replies: [...c.replies, reply] };
      }
      return c;
    });

    saveComments(updated);
    setReplyingTo(null);
    setReplyContent("");
    setReplyAuthor("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <p className="text-gray-500 mb-8">The post you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href={`/interaction/${category}`}
          className="px-4 py-2 bg-[#D96A32] text-white rounded-md hover:bg-[#c45a28] transition-colors"
        >
          Back to {categoryLabel}
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link
            href={`/interaction/${category}`}
            className="text-sm text-gray-500 hover:text-[#D96A32] mb-2 inline-block"
          >
            ← Back to {categoryLabel}
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-[#D96A32]/10 text-[#D96A32] px-2 py-0.5 rounded font-medium">
              {categoryLabel}
            </span>
            <span>•</span>
            <span>Posted by {post.authorUsername}</span>
            <span>•</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <article className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{post.title}</h1>
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Reply Count Summary */}
        <div className="mt-6 flex items-center justify-between rounded-lg bg-white px-6 py-4 border border-gray-200">
          <span className="text-sm text-gray-600">
            {comments.length} {comments.length === 1 ? "reply" : "replies"}
          </span>
          <span className="text-xs text-gray-400">
            Sorted by newest first
          </span>
        </div>

        {/* Comment Form */}
        <form
          onSubmit={handleSubmitComment}
          className="mt-6 rounded-lg bg-white p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Reply</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Reply</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your reply here..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none resize-none"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-[#D96A32] text-white font-medium rounded-lg hover:bg-[#c45a28] transition-colors"
            >
              Post Reply
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="mt-6 space-y-4">
          {comments.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center border border-gray-200">
              <p className="text-gray-500">No replies yet. Be the first to reply!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-lg bg-white border border-gray-200 overflow-hidden">
                {/* Main Comment */}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#D96A32] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{comment.authorName}</span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="mt-2 text-sm text-[#D96A32] hover:text-[#c45a28] font-medium"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <form
                      onSubmit={(e) => handleSubmitReply(e, comment.id)}
                      className="space-y-3"
                    >
                      <input
                        type="text"
                        value={replyAuthor}
                        onChange={(e) => setReplyAuthor(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none"
                        required
                      />
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none resize-none"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#D96A32] text-white text-sm font-medium rounded-lg hover:bg-[#c45a28] transition-colors"
                        >
                          Post Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                            setReplyAuthor("");
                          }}
                          className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3 pl-4 border-l-2 border-gray-200">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {reply.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{reply.authorName}</span>
                            <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </article>
    </main>
  );
}
