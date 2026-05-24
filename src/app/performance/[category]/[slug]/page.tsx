"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Performance {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
  createdAt: number;
}

interface Comment {
  id: string;
  itemId: string;
  authorName: string;
  content: string;
  createdAt: number;
  replies: Reply[];
}

interface Reply {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
}

const SUBCATEGORIES = [
  { value: "musical", label: "Musical" },
  { value: "opera", label: "Opera" },
  { value: "concert", label: "Concert" },
  { value: "edm", label: "EDM" },
  { value: "rock-roll", label: "Rock & Roll" },
  { value: "festival", label: "Festival" },
  { value: "ballet", label: "Ballet" },
  { value: "tourist-performance", label: "Tourist Performance" },
  { value: "others", label: "Others" },
];

export default function PerformanceDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");
  const [pageId, setPageId] = useState<string | null>(null);
  const [pageCategory, setPageCategory] = useState<string | null>(null);

  const loadData = useCallback(() => {
    // Get params synchronously since we're in a client component
    const id = params?.slug as string;
    const category = params?.category as string;
    
    if (!id) {
      setLoading(false);
      return;
    }

    setPageId(id);
    setPageCategory(category);

    try {
      const stored = localStorage.getItem("admin_performance");
      if (stored) {
        const data = JSON.parse(stored);
        // Find by id - this is the main lookup
        const found = data.find((item: Performance) => item.id === id);
        setItem(found || null);
      }
    } catch (e) {
      console.error("Error loading data:", e);
      setItem(null);
    }

    // Load comments
    try {
      const commentsStored = localStorage.getItem("performance_comments");
      if (commentsStored) {
        const all = JSON.parse(commentsStored);
        setComments(all[id] || []);
      }
    } catch (e) {
      console.error("Error loading comments:", e);
    }

    setLoading(false);
  }, [params?.slug, params?.category]);

  useEffect(() => {
    loadData();
    
    // Poll for updates
    const interval = setInterval(loadData, 1000);
    return () => clearInterval(interval);
  }, [loadData]);

  const saveComments = (itemId: string, newComments: Comment[]) => {
    try {
      const stored = localStorage.getItem("performance_comments");
      const all = stored ? JSON.parse(stored) : {};
      all[itemId] = newComments;
      localStorage.setItem("performance_comments", JSON.stringify(all));
      setComments(newComments);
    } catch (e) {
      console.error("Error saving comments:", e);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !newComment.trim() || !item) return;

    const comment: Comment = {
      id: Date.now().toString(),
      itemId: item.id,
      authorName: authorName.trim(),
      content: newComment.trim(),
      createdAt: Date.now(),
      replies: [],
    };

    saveComments(item.id, [comment, ...comments]);
    setNewComment("");
  };

  const handleSubmitReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim() || !item) return;

    const reply: Reply = {
      id: Date.now().toString(),
      authorName: replyAuthor.trim(),
      content: replyContent.trim(),
      createdAt: Date.now(),
    };

    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return { ...c, replies: [...c.replies, reply] };
      }
      return c;
    });

    saveComments(item.id, updated);
    setReplyingTo(null);
    setReplyContent("");
    setReplyAuthor("");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
        <p className="text-sm text-gray-400 mb-4">Debug: ID = {pageId}</p>
        <Link href="/performance" className="px-4 py-2 bg-[#D96A32] text-white rounded-md hover:bg-[#c45a28]">Back to Performance</Link>
      </div>
    );
  }

  const categoryLabel = SUBCATEGORIES.find((c) => c.value === item.category)?.label || item.category;

  return (
    <main className="min-h-screen bg-white">
      {/* Back Link */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/performance" className="text-sm text-gray-500 hover:text-[#D96A32] transition-colors">← Back to Performance</Link>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
          {categoryLabel}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {item.title}
        </h1>

        {item.eventDate && (
          <div className="text-gray-500 text-sm mb-6">
            <span>Event Date: </span>
            <time className="font-medium text-gray-700">{formatDate(item.eventDate)}</time>
          </div>
        )}

        {item.coverImage && (
          <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-md mb-8 bg-gray-100">
            <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}

        {item.content && (
          <div className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.content }} />
        )}

        {item.description && !item.content && (
          <p className="text-gray-700 leading-relaxed">{item.description}</p>
        )}
      </article>

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-10 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4"> Leave a Comment</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D96A32] outline-none"
              required
            />
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Your comment..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D96A32] outline-none resize-none"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-[#D96A32] text-white font-medium rounded-lg hover:bg-[#c45a28] transition-colors"
            >
              Post Comment
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No comments yet. Be the first!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#D96A32] rounded-full flex items-center justify-center text-white font-bold">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{comment.authorName}</span>
                      <span className="text-sm text-gray-400">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-sm text-[#D96A32] hover:text-[#c45a28] font-medium"
                    >
                      Reply
                    </button>

                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3">
                        <input
                          type="text"
                          value={replyAuthor}
                          onChange={(e) => setReplyAuthor(e.target.value)}
                          placeholder="Your name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#D96A32]"
                          required
                        />
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Your reply..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-[#D96A32]"
                          required
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="px-4 py-1.5 bg-[#D96A32] text-white text-sm font-medium rounded-lg">Post Reply</button>
                          <button
                            type="button"
                            onClick={() => { setReplyingTo(null); setReplyContent(""); setReplyAuthor(""); }}
                            className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {reply.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 text-sm">{reply.authorName}</span>
                                <span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span>
                              </div>
                              <p className="text-gray-700 text-sm">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
