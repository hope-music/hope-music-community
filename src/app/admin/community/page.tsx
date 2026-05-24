"use client";

import { useState, useEffect } from "react";

interface NewsComment {
  id: string;
  newsId: string;
  authorName: string;
  content: string;
  createdAt: number;
  replies: NewsReply[];
}

interface NewsReply {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
}

interface CommunityPost {
  id: string;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
  isDeleted: boolean;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "news-comments">("news-comments");
  const [newsComments, setNewsComments] = useState<Record<string, NewsComment[]>>({});
  const [communityPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "deleted">("active");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load news comments from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("news_comments");
    if (stored) {
      setNewsComments(JSON.parse(stored));
    }
  }, []);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Get all comments as flat array
  const getAllNewsComments = (): (NewsComment & { newsTitle: string })[] => {
    const allComments: (NewsComment & { newsTitle: string })[] = [];
    const newsData = localStorage.getItem("admin_news");
    const newsArticles = newsData ? JSON.parse(newsData) : [];

    Object.entries(newsComments).forEach(([newsId, comments]) => {
      const newsItem = newsArticles.find((n: any) => n.id === newsId);
      const newsTitle = newsItem?.title || `News (${newsId.slice(0, 8)})`;
      
      comments.forEach((comment) => {
        allComments.push({ ...comment, newsTitle });
      });
    });
    
    return allComments.sort((a, b) => b.createdAt - a.createdAt);
  };

  // Delete news comment
  const handleDeleteNewsComment = (newsId: string, commentId: string) => {
    if (!confirm("Delete this comment and all its replies?")) return;

    const updated = { ...newsComments };
    updated[newsId] = updated[newsId].filter((c) => c.id !== commentId);
    
    if (updated[newsId].length === 0) {
      delete updated[newsId];
    }
    
    localStorage.setItem("news_comments", JSON.stringify(updated));
    setNewsComments(updated);
    showMessage("success", "Comment deleted");
  };

  // Delete news reply
  const handleDeleteNewsReply = (newsId: string, commentId: string, replyId: string) => {
    const updated = { ...newsComments };
    const commentIndex = updated[newsId].findIndex((c) => c.id === commentId);
    if (commentIndex !== -1) {
      updated[newsId][commentIndex].replies = updated[newsId][commentIndex].replies.filter(
        (r) => r.id !== replyId
      );
    }
    
    localStorage.setItem("news_comments", JSON.stringify(updated));
    setNewsComments(updated);
    showMessage("success", "Reply deleted");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const allNewsComments = getAllNewsComments();
  const activeComments = allNewsComments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage community posts and news comments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-900">{communityPosts.length}</div>
          <div className="text-sm text-gray-500">Community Posts</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-blue-600">{allNewsComments.length}</div>
          <div className="text-sm text-gray-500">Total News Comments</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-green-600">{activeComments.length}</div>
          <div className="text-sm text-gray-500">Active Comments</div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab("news-comments")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "news-comments"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          News Comments ({allNewsComments.length})
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "posts"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Community Posts ({communityPosts.length})
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "comments"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Community Comments (0)
        </button>
      </div>

      {/* News Comments List */}
      {activeTab === "news-comments" && (
        <div className="space-y-4">
          {allNewsComments.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
              No comments yet. Comments will appear here when users post on news articles.
            </div>
          ) : (
            allNewsComments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-[#D96A32] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{comment.authorName}</span>
                      <span className="text-xs text-gray-400">on</span>
                      <span className="text-xs text-blue-600 font-medium">{comment.newsTitle}</span>
                    </div>
                    <p className="text-gray-700 mb-2">{comment.content}</p>
                    <div className="text-xs text-gray-400">
                      {formatDate(comment.createdAt)}
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                        <p className="text-sm font-medium text-gray-500">Replies ({comment.replies.length}):</p>
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start justify-between gap-2 bg-gray-50 rounded-lg p-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {reply.authorName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{reply.authorName}</span>
                              </div>
                              <p className="text-sm text-gray-700 ml-8">{reply.content}</p>
                              <p className="text-xs text-gray-400 ml-8 mt-1">{formatDate(reply.createdAt)}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteNewsReply(comment.newsId, comment.id, reply.id)}
                              className="text-xs text-red-500 hover:text-red-700 shrink-0"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteNewsComment(comment.newsId, comment.id)}
                    className="shrink-0 rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Community Posts */}
      {activeTab === "posts" && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Community posts feature is not yet configured. This will show posts from the community section.
        </div>
      )}

      {/* Community Comments */}
      {activeTab === "comments" && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Community comments feature is not yet configured. This will show comments on community posts.
        </div>
      )}
    </div>
  );
}
