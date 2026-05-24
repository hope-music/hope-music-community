"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface NewsArticle {
  id: string;
  title: string;
  coverImage: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
}

interface Comment {
  id: string;
  newsId: string;
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

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("");

  useEffect(() => {
    const id = params.id as string;
    
    // Check if it's a demo article
    if (id.startsWith("demo-")) {
      const demoArticles: NewsArticle[] = [
        {
          id: "demo-1",
          title: "Announcing the 2024 Global Musicals Gala line-up",
          coverImage: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200",
          content: `<p class="font-semibold text-lg text-gray-800">We are thrilled to officially announce the lineup for the 2024 Global Musicals Gala, featuring world-renowned performers and groundbreaking theatrical productions from across the globe.</p>
          <p>This year's gala promises to be the most ambitious yet, bringing together award-winning composers, directors, and performers from Broadway, West End, and international stages. Audiences can expect exclusive previews of upcoming productions, live performances of classic musical numbers, and behind-the-scenes insights into the creative process.</p>
          <p>"This Gala represents the pinnacle of musical theater excellence," noted the artistic director. "We've curated a program that celebrates both timeless classics and innovative new works that push the boundaries of what musical theater can achieve."</p>
          <p>Stay tuned for detailed schedule announcements, ticket availability, and special VIP experiences. For group bookings and institutional partnerships, please reach out through our collaboration portals.</p>`,
          excerpt: "Join us for the most spectacular musical event of the year.",
          isPublished: true,
          isFeatured: false,
          createdAt: Date.now() - 86400000 * 2,
        },
        {
          id: "demo-2",
          title: "Hope Studio partners with industry leader for pro-audio workshop series",
          coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1200",
          content: `<p class="font-semibold text-lg text-gray-800">We are excited to announce our new partnership with leading audio industry professionals for an exclusive workshop series.</p>
          <p>Learn from the best in the industry with our comprehensive workshop program covering recording techniques, mixing fundamentals, mastering essentials, and live sound reinforcement.</p>
          <p>These workshops are designed for aspiring audio engineers, music producers, and anyone looking to elevate their sound production skills to professional standards.</p>`,
          excerpt: "Learn from the best in the industry with our new workshop partnership.",
          isPublished: true,
          isFeatured: false,
          createdAt: Date.now() - 86400000 * 5,
        },
        {
          id: "demo-3",
          title: "Artist Community Spotlight: Rising stars share their journey with HOPE",
          coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200",
          content: `<p class="font-semibold text-lg text-gray-800">Meet the talented artists who are shaping the future of music at HOPE Music Community.</p>
          <p>Our community is home to exceptional musicians, producers, and performers who bring creativity and passion to every project.</p>
          <p>Through our platform, artists have access to world-class facilities, mentorship from industry veterans, and opportunities to collaborate with fellow creatives.</p>`,
          excerpt: "Meet the talented artists who are shaping the future of music.",
          isPublished: true,
          isFeatured: false,
          createdAt: Date.now() - 86400000 * 8,
        },
      ];
      const found = demoArticles.find((a) => a.id === id);
      setArticle(found || null);
      setLoading(false);
      
      // Load comments for this news
      const stored = localStorage.getItem("news_comments");
      if (stored) {
        const allComments = JSON.parse(stored);
        const newsComments = allComments[id] || [];
        setComments(newsComments);
      }
      return;
    }

    // Load from localStorage
    const stored = localStorage.getItem("admin_news");
    if (stored) {
      const data = JSON.parse(stored);
      const found = data.find((a: NewsArticle) => a.id === id);
      setArticle(found || null);
    }
    
    // Load comments
    const commentsStored = localStorage.getItem("news_comments");
    if (commentsStored) {
      const allComments = JSON.parse(commentsStored);
      const newsComments = allComments[id] || [];
      setComments(newsComments);
    }
    
    setLoading(false);
  }, [params.id]);

  // Save comments
  const saveComments = (newsId: string, newComments: Comment[]) => {
    const stored = localStorage.getItem("news_comments");
    const allComments = stored ? JSON.parse(stored) : {};
    allComments[newsId] = newComments;
    localStorage.setItem("news_comments", JSON.stringify(allComments));
    setComments(newComments);
  };

  // Submit comment
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !newComment.trim()) return;
    if (!article) return;

    const comment: Comment = {
      id: Date.now().toString(),
      newsId: article.id,
      authorName: authorName.trim(),
      content: newComment.trim(),
      createdAt: Date.now(),
      replies: [],
    };

    const updated = [comment, ...comments];
    saveComments(article.id, updated);
    setNewComment("");
  };

  // Submit reply
  const handleSubmitReply = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim()) return;
    if (!article) return;

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

    saveComments(article.id, updated);
    setReplyingTo(null);
    setReplyContent("");
    setReplyAuthor("");
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#D96A32]"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500 mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/news"
          className="px-4 py-2 bg-[#D96A32] text-white rounded-md hover:bg-[#c45a28] transition-colors"
        >
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Back Link */}
      <div className="border-b border-t border-[#D96A32] bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/news" className="text-sm text-gray-500 hover:text-[#D96A32] transition-colors">
            ← Back to News
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Category Tag Header */}
        <div className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">
          News
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>

        {/* Date Section */}
        <div className="text-gray-500 text-sm mb-8 flex items-center gap-2">
          <span>Published on:</span>
          <time className="font-medium text-gray-700">{formatDate(article.createdAt)}</time>
        </div>

        {/* Hero Image Section */}
        {article.coverImage && (
          <div className="w-full aspect-[16/9] relative rounded-xl overflow-hidden shadow-md mb-8 bg-gray-100">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        {/* Full Formatted Text Content */}
        <div
          className="prose lg:prose-lg text-gray-700 max-w-none space-y-6 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comments ({comments.length})
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-10 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Comment</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none resize-none"
                required
              />
            </div>
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
            <p className="text-center text-gray-500 py-8">
              No comments yet. Be the first to leave a comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-6">
                {/* Main Comment */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#D96A32] rounded-full flex items-center justify-center text-white font-bold">
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

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <form
                        onSubmit={(e) => handleSubmitReply(e, comment.id)}
                        className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                            placeholder="Your name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#D96A32] focus:border-transparent outline-none"
                            required
                          />
                        </div>
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
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
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
