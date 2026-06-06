"use client";

import { useState, useRef, useEffect } from "react";
import { STAGE_PRODUCTION_CATEGORY_OPTIONS } from "@/lib/constants";

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

interface StageProduction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: string;
  createdAt: number;
  updatedAt: number;
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

const CATEGORIES = STAGE_PRODUCTION_CATEGORY_OPTIONS;

// Default comments
const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "placeholder_1",
    authorName: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    authorAvatar: "🎵",
    content: "The stage production was absolutely stunning!",
    createdAt: Date.now() - 86400000 * 3,
    replies: [
      {
        id: "placeholder_1_reply",
        authorName: "Mike Chen",
        authorEmail: "mike@example.com",
        authorAvatar: "🎤",
        content: "The lighting effects were incredible!",
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
    content: "Audio quality was perfect throughout the show.",
    createdAt: Date.now() - 86400000 * 5,
    replies: [],
  },
  {
    id: "placeholder_3",
    authorName: "Alex Thompson",
    authorEmail: "alex@example.com",
    authorAvatar: "🥁",
    content: "Best stage production I've ever seen!",
    createdAt: Date.now() - 86400000 * 7,
    replies: [],
  },
];

const COMMENTS_STORAGE_KEY = "stage_production_comments";
const BANNED_USERS_KEY = "stage_production_banned_users";

export default function AdminStageProductionsPage() {
  const [items, setItems] = useState<StageProduction[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past" | "draft">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("stage");
  const [status, setStatus] = useState<"upcoming" | "past" | "draft">("draft");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Comment management state
  const [comments, setComments] = useState<Comment[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_stage_production");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const saveToStorage = (data: StageProduction[]) => {
    localStorage.setItem("admin_stage_production", JSON.stringify(data));
    setItems(data);
  };

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
      saveComments(`stage-production-${editingId}`, updated);
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
      saveComments(`stage-production-${editingId}`, updated);
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
      saveComments(`stage-production-${editingId}`, updatedComments);
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

  const filteredItems = items.filter((p) => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  // Group items by category
  const itemsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((p) => p.category === cat.value),
  }));

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => { const base64 = ev.target?.result as string; setCoverImage(base64); setCoverPreview(base64); };
      reader.readAsDataURL(file);
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleNew = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setContent("");
    setCategory(filterCategory !== "all" ? filterCategory : "stage");
    setStatus("draft");
    setEventDate("");
    setEventTime("");
    setCoverImage("");
    setCoverPreview(null);
    setShowForm(true);
  };

  const handleEdit = (item: StageProduction) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setContent(item.content || "");
    setCategory(item.category || "stage");
    setStatus(item.status || "draft");
    const dateOnly = item.eventDate ? item.eventDate.split("T")[0] : "";
    const timeOnly = item.eventDate && item.eventDate.includes("T") ? item.eventDate.split("T")[1]?.slice(0, 5) : "";
    setEventDate(dateOnly);
    setEventTime(timeOnly);
    setCoverImage(item.coverImage || "");
    setCoverPreview(item.coverImage || null);
    loadComments(`stage-production-${item.id}`);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    setLoading(true);
    try {
      const now = Date.now();
      const fullEventDate = eventDate && eventTime ? `${eventDate}T${eventTime}:00` : eventDate || "";
      if (editingId) {
        const updated = items.map((item) => item.id === editingId ? { ...item, title: title.trim(), description, content, category, status, eventDate: fullEventDate, coverImage, updatedAt: now } : item);
        saveToStorage(updated);
        setMessage({ type: "success", text: "Updated successfully!" });
      } else {
        const newItem: StageProduction = { id: now.toString(), title: title.trim(), category, description, content, coverImage, status, eventDate: fullEventDate, createdAt: now, updatedAt: now };
        saveToStorage([newItem, ...items]);
        setMessage({ type: "success", text: "Created successfully!" });
      }
      setShowForm(false);
    } catch { setMessage({ type: "error", text: "Failed" }); } finally { setLoading(false); }
  };

  const handleDelete = (id: string) => { if (confirm("Delete this item?")) { saveToStorage(items.filter((item) => item.id !== id)); setMessage({ type: "success", text: "Deleted" }); } };

  const getStatusBadge = (s: string) => s === "upcoming" ? <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Upcoming</span> : s === "past" ? <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Past</span> : <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">Draft</span>;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : "";

  const totalCount = items.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stage Production</h1>
          <p className="mt-1 text-sm text-gray-500">Manage stage productions ({totalCount} total)</p>
        </div>
        <button onClick={handleNew} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
          + New Stage Production
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Category</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label} ({itemsByCategory.find(c => c.value === cat.value)?.items.length || 0})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="draft">Drafts</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
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
          <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit" : "New"} Stage Production</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" required /></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Status</label><select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full rounded-md border border-gray-300 px-3 py-2"><option value="draft">Draft</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Event Date</label><input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
              <div><label className="mb-1 block text-sm font-medium text-gray-700">Event Time</label><input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label><input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" /><button type="button" onClick={() => coverInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Image</button>{coverPreview && <div className="mt-2 flex items-center gap-4"><img src={coverPreview} alt="Preview" className="h-20 w-32 rounded-md object-cover" /><button type="button" onClick={() => { setCoverImage(""); setCoverPreview(null); }} className="text-sm text-red-500 hover:text-red-700">Remove</button></div>}</div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Summary (for list display)</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Full Content</label><RichTextEditor content={content} onChange={setContent} /></div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Create"}</button></div>
          </form>

          {/* Comment Management Section */}
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

      {/* Category Items */}
      <div className="space-y-6">
        {itemsByCategory.map((cat) => {
          const categoryItems = filterCategory === "all" || filterCategory === cat.value
            ? cat.items.filter(item => filterStatus === "all" || item.status === filterStatus)
            : [];

          if (filterCategory !== "all" && filterCategory !== cat.value) return null;

          return (
            <div key={cat.value} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{cat.label}</span>
                  <span className="text-sm text-gray-500">({categoryItems.length})</span>
                </div>
                {categoryItems.length > 0 && (
                  <span className="text-xs text-gray-400">
                    {categoryItems.filter(i => i.status === "upcoming").length} upcoming, {categoryItems.filter(i => i.status === "past").length} past
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-100">
                {categoryItems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No stage productions in this category
                  </div>
                ) : (
                  categoryItems.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.coverImage && (
                          <img src={item.coverImage} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{item.title}</span>
                            {getStatusBadge(item.status)}
                          </div>
                          {item.eventDate && (
                            <span className="text-xs text-gray-400">{formatDate(item.eventDate)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
