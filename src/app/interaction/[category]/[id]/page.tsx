"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  { value: "artical", label: "Article" },
  { value: "others", label: "Others" },
];

const DEMO_POSTS: Record<string, { title: string; content: string; author: string; createdAt: number }> = {
  "ph-soft-1": {
    title: "ISAT Interaction 2023 v1.0.4 Released",
    content: `<p class="mb-4">We're excited to announce the release of ISAT Interaction 2023 v1.0.4!</p>
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
    content: `<p class="mb-4">A comprehensive guide to reducing latency in DAW Soundworks.</p>
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

const DEFAULT_DEMO = {
  title: "Discussion Topic",
  content: `<p class="mb-4">Welcome to this discussion!</p>
  <p class="mb-3">This is a placeholder topic. The actual content will be loaded when you create a real post.</p>
  <p>Feel free to share your thoughts and engage with the community!</p>`,
  author: "Community Member",
  createdAt: Date.now() - 3600000,
};

interface PageProps {
  params: Promise<{ category: string; id: string }>;
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
  return `${Math.floor(days / 7)}w ago`;
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
  const [votes, setVotes] = useState(0);
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0);

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setCategory(resolved.category);
      setPostId(resolved.id);
      setCategoryLabel(CATEGORIES.find((c) => c.value === resolved.category)?.label || resolved.category);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!postId || !category) return;

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
  }, [postId, category]);

  useEffect(() => {
    if (!postId) return;
    const stored = localStorage.getItem("interaction_comments");
    if (stored) {
      const allComments = JSON.parse(stored);
      setComments(allComments[postId] || []);
    }
  }, [postId]);

  const saveComments = (newComments: Comment[]) => {
    const stored = localStorage.getItem("interaction_comments");
    const allComments = stored ? JSON.parse(stored) : {};
    allComments[postId] = newComments;
    localStorage.setItem("interaction_comments", JSON.stringify(allComments));
    setComments(newComments);
  };

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

  const handleVote = (direction: 1 | -1) => {
    if (userVote === direction) {
      setUserVote(0);
      setVotes(votes - direction);
    } else {
      const diff = direction - userVote;
      setUserVote(direction);
      setVotes(votes + diff);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <aside className="w-56 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Categories</h3>
              </div>
              <div className="p-2">
                <Link href="/interaction" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  <span>💬</span>
                  <span>All Topics</span>
                </Link>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.value}
                    href={`/interaction/${cat.value}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat.value ? "bg-[#D96A32]/10 text-[#D96A32] font-medium" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{cat.value === "software" ? "💻" : cat.value === "hardware" ? "🎛️" : cat.value === "music" ? "🎵" : cat.value === "production" ? "🎬" : cat.value === "artical" ? "📝" : "💬"}</span>
                    <span>{cat.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0 max-w-3xl">
            <Link href={`/interaction/${category}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#D96A32] mb-4">
              ← Back to r/{categoryLabel}
            </Link>

            {/* Post Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <button onClick={() => handleVote(1)} className={`p-1 rounded hover:bg-orange-100 ${userVote === 1 ? "text-orange-500" : "text-gray-400"}`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h6v8h4v-8h6z" /></svg>
                </button>
                <span className={`text-sm font-bold ${votes > 0 ? "text-orange-500" : votes < 0 ? "text-blue-500" : "text-gray-600"}`}>{votes}</span>
                <button onClick={() => handleVote(-1)} className={`p-1 rounded hover:bg-blue-100 ${userVote === -1 ? "text-blue-500" : "text-gray-400"}`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8h-6V4h-4v8H4z" /></svg>
                </button>
                <span className="text-xs text-gray-400">|</span>
                <span className="text-xs text-gray-500">Posted by</span>
                <img src={`https://i.pravatar.cc/40?u=${post.authorUsername}`} alt={post.authorUsername} className="w-5 h-5 rounded-full" />
                <span className="text-xs font-semibold text-gray-700">{post.authorUsername}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</span>
              </div>
              <div className="p-4">
                <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
                <div className="prose prose-sm max-w-none text-gray-700 mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
                <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                  <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-md text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span>{comments.length} Comments</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-md text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-md text-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <p className="text-sm text-gray-500 mb-3">Comment as <span className="font-semibold text-gray-700">guest</span></p>
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button type="button" className="px-3 py-1.5 text-xs text-gray-600 hover:text-[#D96A32] font-medium">Log In</button>
                    <span className="text-gray-300">|</span>
                    <button type="button" className="px-3 py-1.5 text-xs text-gray-600 hover:text-[#D96A32] font-medium">Sign Up</button>
                  </div>
                  <button type="submit" className="px-4 py-1.5 bg-[#D96A32] text-white text-sm font-medium rounded-full hover:bg-[#c45a28] transition-colors">Post Comment</button>
                </div>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex gap-3">
                      <img src={`https://i.pravatar.cc/40?u=${comment.authorName}`} alt={comment.authorName} className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                          <span className="font-semibold text-gray-700">u/{comment.authorName}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
                        <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-xs text-gray-500 hover:text-[#D96A32] font-medium">Reply</button>

                        {replyingTo === comment.id && (
                          <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-3">
                            <input type="text" value={replyAuthor} onChange={(e) => setReplyAuthor(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none" required />
                            <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a reply..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none resize-none" required />
                            <div className="flex gap-2">
                              <button type="submit" className="px-3 py-1 bg-[#D96A32] text-white text-xs font-medium rounded-full hover:bg-[#c45a28]">Reply</button>
                              <button type="button" onClick={() => { setReplyingTo(null); setReplyContent(""); setReplyAuthor(""); }} className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full hover:bg-gray-300">Cancel</button>
                            </div>
                          </form>
                        )}

                        {comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id}>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                  <img src={`https://i.pravatar.cc/40?u=${reply.authorName}`} alt={reply.authorName} className="w-5 h-5 rounded-full" />
                                  <span className="font-semibold text-gray-700">u/{reply.authorName}</span>
                                  <span>•</span>
                                  <span>{formatTimeAgo(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-800">{reply.content}</p>
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

          {/* Right Sidebar */}
          <aside className="w-48 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-semibold uppercase text-gray-500 tracking-wider">About Community</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">Hope Music Community forum for discussing music production, hardware, and more.</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Members</span>
                    <span className="font-semibold text-gray-700">45,987</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Online</span>
                    <span className="font-semibold text-green-600">1,234</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
