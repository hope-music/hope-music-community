"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@/lib/convex";
import { api } from "@/lib/convex";

function RichTextEditor({ content, onChange }: { content: string; onChange: (c: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };
  const handleInput = () => { if (editorRef.current) onChange(editorRef.current.innerHTML); };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) execCommand("insertImage", ev.target.result as string); };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => { if (editorRef.current && !editorRef.current.innerHTML) editorRef.current.innerHTML = content; }, []);

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 px-2 py-2">
        <button type="button" onClick={() => execCommand("bold")} className="rounded px-2 py-1 text-sm font-bold hover:bg-gray-200">B</button>
        <button type="button" onClick={() => execCommand("italic")} className="rounded px-2 py-1 text-sm italic hover:bg-gray-200">I</button>
        <button type="button" onClick={() => execCommand("underline")} className="rounded px-2 py-1 text-sm underline hover:bg-gray-200">U</button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <select onChange={(e) => { if (e.target.value) execCommand("formatBlock", e.target.value); }} className="rounded border border-gray-300 bg-white px-2 py-1 text-sm">
          <option value="">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <button type="button" onClick={() => execCommand("insertUnorderedList")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">• List</button>
        <button type="button" onClick={() => execCommand("insertOrderedList")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">1. List</button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded px-2 py-1 text-sm hover:bg-gray-200">🖼 Image</button>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <button type="button" onClick={() => execCommand("undo")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">↶</button>
        <button type="button" onClick={() => execCommand("redo")} className="rounded px-2 py-1 text-sm hover:bg-gray-200">↷</button>
      </div>
      <div ref={editorRef} contentEditable onInput={handleInput} className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 focus:outline-none" style={{ fontFamily: "Georgia, serif", fontSize: "15px", lineHeight: "1.7" }} />
    </div>
  );
}

interface NewsArticle {
  _id: string;
  title: string;
  coverImage: string;
  content: string;
  excerpt: string;
  isPublished: boolean;
  createdAt: number;
  updatedAt?: number;
}

interface Comment {
  id: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  content: string;
  createdAt: number;
  replies: Comment[];
}

interface BanEntry {
  email: string;
  expiresAt: number | null;
}

// Default comments
const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "placeholder_1",
    authorName: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    authorAvatar: "🎵",
    content: "Great news! Looking forward to more updates from HOPE Music Community.",
    createdAt: Date.now() - 86400000 * 3,
    replies: [
      {
        id: "placeholder_1_reply",
        authorName: "Mike Chen",
        authorEmail: "mike@example.com",
        authorAvatar: "🎤",
        content: "Agreed! The community is growing fast.",
        createdAt: Date.now() - 86400000 * 2,
        replies: [],
      },
    ],
  },
  {
    id: "placeholder_2",
    authorName: "Emily Davis",
    authorEmail: "emily@example.com",
    authorAvatar: "🎹",
    content: "Thanks for sharing this news. Very informative!",
    createdAt: Date.now() - 86400000 * 5,
    replies: [],
  },
  {
    id: "placeholder_3",
    authorName: "Alex Thompson",
    authorEmail: "alex@example.com",
    authorAvatar: "🥁",
    content: "This is exactly what I was looking for. Keep up the great work!",
    createdAt: Date.now() - 86400000 * 7,
    replies: [],
  },
];

const COMMENTS_STORAGE_KEY = "news_comments";
const BANNED_USERS_KEY = "news_banned_users";

export default function NewsAdminPage() {
  const adminEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "";
  const allArticles = useQuery(api.admin.listNews, { callerEmail: adminEmail }) as NewsArticle[] | undefined;
  const createArticle = useMutation(api.admin.createNewsArticle);
  const updateArticle = useMutation(api.admin.updateNewsArticle);
  const deleteArticle = useMutation(api.admin.deleteNewsArticle);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Comment management state
  const [comments, setComments] = useState<Comment[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanEntry[]>([]);

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); } }, [message]);

  // Comment management functions
  const loadComments = (itemId: string) => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (stored) {
      const allComments = JSON.parse(stored);
      const pageComments = allComments[itemId] || [];
      setComments(pageComments.length > 0 ? pageComments : DEFAULT_COMMENTS);
    } else {
      setComments(DEFAULT_COMMENTS);
    }
    const banned = localStorage.getItem(BANNED_USERS_KEY);
    if (banned) {
      setBannedUsers(JSON.parse(banned));
    } else {
      setBannedUsers([]);
    }
  };

  const saveComments = (itemId: string, newComments: Comment[]) => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const allComments = stored ? JSON.parse(stored) : {};
    allComments[itemId] = newComments;
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
    setComments(newComments);
  };

  const isUserBanned = (email: string): boolean => {
    const now = Date.now();
    return bannedUsers.some(b => b.email === email && (b.expiresAt === null || b.expiresAt > now));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Delete this comment and all its replies?")) return;
    const updated = comments.filter((c) => c.id !== commentId);
    if (editingId) {
      saveComments(`news-${editingId}`, updated);
    }
    setMessage({ type: "success", text: "Comment and replies deleted" });
  };

  const handleDeleteReply = (parentId: string, replyId: string) => {
    if (!confirm("Delete this reply?")) return;
    const updated = comments.map((c) => {
      if (c.id === parentId) {
        return { ...c, replies: c.replies.filter((r) => r.id !== replyId) };
      }
      return c;
    });
    if (editingId) {
      saveComments(`news-${editingId}`, updated);
    }
    setMessage({ type: "success", text: "Reply deleted" });
  };

  const handleBanUser = (email: string, duration: number | null, deleteComments: boolean = false) => {
    const expiresAt = duration === null ? null : Date.now() + duration;
    let updatedComments = comments;
    if (deleteComments) {
      updatedComments = comments
        .filter((c) => c.authorEmail !== email)
        .map((c) => ({
          ...c,
          replies: c.replies.filter((r) => r.authorEmail !== email),
        }));
    }
    const newBanned = bannedUsers.filter(b => b.email !== email);
    newBanned.push({ email, expiresAt });
    setBannedUsers(newBanned);
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));
    if (editingId && deleteComments) {
      saveComments(`news-${editingId}`, updatedComments);
    }
    const durationText = duration === null ? "permanently" : `${duration / 86400000} day(s)`;
    setMessage({ type: "success", text: `User ${email} banned ${durationText}` });
  };

  const handleUnbanUser = (email: string) => {
    const newBanned = bannedUsers.filter(b => b.email !== email);
    setBannedUsers(newBanned);
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));
    setMessage({ type: "success", text: `User ${email} unbanned` });
  };

  const formatTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getCommentAuthors = () => {
    const authors = new Map<string, { email: string; avatar: string; count: number }>();
    comments.forEach((c) => {
      const existing = authors.get(c.authorEmail);
      authors.set(c.authorEmail, { email: c.authorEmail, avatar: c.authorAvatar, count: existing ? existing.count + 1 : 1 });
      c.replies.forEach((r) => {
        const replyExisting = authors.get(r.authorEmail);
        authors.set(r.authorEmail, { email: r.authorEmail, avatar: r.authorAvatar, count: replyExisting ? replyExisting.count + 1 : 1 });
      });
    });
    return Array.from(authors.values());
  };

  const articles = allArticles || [];

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCoverImage(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
  };

  const handleNewArticle = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCoverImage("");
    setImagePreview(null);
    setIsPublished(true);
    setShowForm(true);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingId(article._id);
    setTitle(article.title);
    setContent(article.content);
    setCoverImage(article.coverImage);
    setImagePreview(article.coverImage || null);
    setIsPublished(article.isPublished);
    loadComments(`news-${article._id}`);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    const textContent = content.replace(/<[^>]*>/g, "").trim();
    if (!textContent) { setMessage({ type: "error", text: "Content is required" }); return; }

    setLoading(true);
    try {
      const excerpt = textContent.substring(0, 150);
      if (editingId) {
        await updateArticle({ callerEmail: adminEmail, id: editingId as any, title: title.trim(), content, coverImage, excerpt, isPublished });
        setMessage({ type: "success", text: "Updated successfully!" });
      } else {
        await createArticle({ callerEmail: adminEmail, title: title.trim(), content, coverImage, excerpt, isPublished });
        setMessage({ type: "success", text: "Created successfully!" });
      }
      setShowForm(false);
      resetForm();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article permanently?")) return;
    try {
      await deleteArticle({ callerEmail: adminEmail, id: id as any });
      setMessage({ type: "success", text: "Deleted" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setCoverImage("");
    setImagePreview(null);
    setIsPublished(true);
  };

  const getStatusBadge = (isPub: boolean) => (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${isPub ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
      {isPub ? "Published" : "Draft"}
    </span>
  );

  const formatDate = (timestamp: number): string => new Date(timestamp).toLocaleDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">News</h1>
          <p className="mt-1 text-sm text-gray-500">Manage news articles ({articles.length} total)</p>
        </div>
        <button onClick={handleNewArticle} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          + New Article
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit" : "New"} Article</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label><input ref={coverFileInputRef} type="file" accept="image/*" onChange={handleCoverImageSelect} className="hidden" /><button type="button" onClick={() => coverFileInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Image</button>{imagePreview && <div className="mt-2 flex items-center gap-4"><img src={imagePreview} alt="Preview" className="h-20 w-32 rounded-md object-cover" /><button type="button" onClick={() => { setCoverImage(""); setImagePreview(null); }} className="text-sm text-red-500 hover:text-red-700">Remove</button></div>}</div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Options</label><div className="flex items-center gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="h-4 w-4" />Published</label></div></div>
            </div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Content</label><RichTextEditor content={content} onChange={setContent} /></div>
            <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-white disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Create"}</button></div>
          </form>

          {/* Comment Management Section - Only show when editing */}
          {editingId && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h3>

              {/* Authors Summary */}
              {getCommentAuthors().length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Authors</h4>
                  <div className="flex flex-wrap gap-2">
                    {getCommentAuthors().map((author) => {
                      const isBanned = isUserBanned(author.email);
                      return (
                        <div key={author.email} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200">
                          <span className="text-sm">{author.avatar}</span>
                          <span className="text-sm text-gray-700">{author.email}</span>
                          <span className="text-xs text-gray-400">({author.count})</span>
                          {isBanned ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Banned</span>
                              <button onClick={() => handleUnbanUser(author.email)} className="text-xs text-green-600 hover:text-green-700 font-medium">Unban</button>
                            </div>
                          ) : (
                            <div className="relative group">
                              <button className="text-xs text-red-600 hover:text-red-700 font-medium">Ban ▾</button>
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[180px]">
                                <button onClick={() => handleBanUser(author.email, 86400000, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-t-lg">Ban for 1 day</button>
                                <button onClick={() => handleBanUser(author.email, 604800000, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban for 7 days</button>
                                <button onClick={() => handleBanUser(author.email, 2592000000, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban for 30 days</button>
                                <button onClick={() => handleBanUser(author.email, null, false)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-b-lg">Ban permanently</button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No comments yet.</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {comments.map((comment) => {
                    const isBanned = isUserBanned(comment.authorEmail);
                    return (
                      <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{comment.authorAvatar}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{comment.authorName}</span>
                                <span className="text-xs text-gray-400">{comment.authorEmail}</span>
                                {isBanned && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Banned</span>}
                              </div>
                              <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                              <p className="mt-2 text-gray-700 text-sm">{comment.content}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                            {!isBanned && (
                              <div className="relative group">
                                <button className="text-xs text-orange-600 hover:text-orange-700 font-medium">Ban ▾</button>
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[200px]">
                                  <button onClick={() => handleBanUser(comment.authorEmail, 86400000, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-t-lg">Ban 1 day + Delete comments</button>
                                  <button onClick={() => handleBanUser(comment.authorEmail, 604800000, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban 7 days + Delete comments</button>
                                  <button onClick={() => handleBanUser(comment.authorEmail, 2592000000, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Ban 30 days + Delete comments</button>
                                  <button onClick={() => handleBanUser(comment.authorEmail, null, true)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 rounded-b-lg">Ban permanently + Delete comments</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {comment.replies.length > 0 && (
                          <div className="ml-12 mt-3 space-y-3 border-t border-gray-100 pt-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start justify-between">
                                <div className="flex items-start gap-2">
                                  <span className="text-lg">{reply.authorAvatar}</span>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900 text-sm">{reply.authorName}</span>
                                      {isUserBanned(reply.authorEmail) && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Banned</span>}
                                    </div>
                                    <span className="text-xs text-gray-400">{formatTime(reply.createdAt)}</span>
                                    <p className="mt-1 text-gray-700 text-sm">{reply.content}</p>
                                  </div>
                                </div>
                                <button onClick={() => handleDeleteReply(comment.id, reply.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Articles Grid */}
      {allArticles === undefined ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          Loading articles...
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500">
          No articles yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {articles.map((article) => (
            <div key={article._id} className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
              {article.coverImage && (
                <img src={article.coverImage} alt={article.title} className="w-full h-40 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${article.isPublished ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                    {article.isPublished ? "Published" : "Draft"}
                  </span>
                  <span className="text-xs text-gray-400">{formatDate(article.createdAt)}</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{article.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(article)} className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded">Edit</button>
                  <button onClick={() => handleDelete(article._id)} className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
