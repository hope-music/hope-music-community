"use client";

import { useState, useEffect, useRef } from "react";

interface ContentItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  content: string;
  hidden?: boolean;
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

const CATEGORIES = [
  { value: "welcome", label: "Welcome Section" },
  { value: "studio", label: "Hope Studio Section" },
  { value: "jesse-liu", label: "Jesse Liu Section" },
  { value: "shangri-la", label: "Shangri-La Section" },
  { value: "works", label: "Works Section" },
  { value: "schedule", label: "Schedule Section" },
];

const DEFAULT_ITEMS: ContentItem[] = [
  { id: "welcome", title: "Welcome to Hope Music Community", category: "welcome", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800", description: "Discover the vibrant world of Hope Music Community, where music lovers unite.", content: "<p>Welcome to the Hope Music Community!</p>" },
  { id: "studio", title: "Hope Studio", category: "studio", image: "/images/hope-studio/Hope Studio 1.png", description: "Professional recording, mixing, and mastering services.", content: "" },
  { id: "jesse-liu", title: "Jesse Liu", category: "jesse-liu", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", description: "Meet Jesse Liu, our founder.", content: "<p>Jesse Liu is the founder.</p>" },
  { id: "shangri-la", title: "Shangri-La", category: "shangri-la", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800", description: "An immersive musical experience.", content: "<p>Shangri-La experience.</p>" },
  { id: "works", title: "Cooperation", category: "works", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800", description: "Explore our portfolio.", content: "<p>Our portfolio.</p>" },
  { id: "schedule", title: "Performance Schedule", category: "schedule", image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800", description: "Upcoming performances and events.", content: "<p>Performance schedule.</p>", hidden: true },
];

// Default comments
const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "placeholder_1",
    authorName: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    authorAvatar: "🎵",
    content: "Hope Studio is amazing! The facilities are top-notch.",
    createdAt: Date.now() - 86400000 * 3,
    replies: [
      {
        id: "placeholder_1_reply",
        authorName: "Mike Chen",
        authorEmail: "mike@example.com",
        authorAvatar: "🎤",
        content: "I agree! Best recording studio in town.",
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
    content: "Jesse Liu's work is truly inspiring.",
    createdAt: Date.now() - 86400000 * 5,
    replies: [],
  },
  {
    id: "placeholder_3",
    authorName: "Alex Thompson",
    authorEmail: "alex@example.com",
    authorAvatar: "🥁",
    content: "Can't wait to visit Shangri-La!",
    createdAt: Date.now() - 86400000 * 7,
    replies: [],
  },
];

const COMMENTS_STORAGE_KEY = "hope_studio_comments";
const BANNED_USERS_KEY = "hope_studio_banned_users";

export default function AdminHopeStudioPage() {
  const [items, setItems] = useState<ContentItem[]>(DEFAULT_ITEMS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContentItem>(DEFAULT_ITEMS[0]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Comment management state
  const [comments, setComments] = useState<Comment[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("hope_studio_content");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (data: ContentItem[]) => {
    localStorage.setItem("hope_studio_content", JSON.stringify(data));
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
      saveComments(`hope-studio-${editingId}`, updated);
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
      saveComments(`hope-studio-${editingId}`, updated);
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
      saveComments(`hope-studio-${editingId}`, updatedComments);
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

  // Group items by category
  const itemsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.category === cat.value),
  }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm({ ...editForm, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleEdit = (item: ContentItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    loadComments(`hope-studio-${item.id}`);
  };

  const handleSave = () => {
    if (!editForm.title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    const updated = items.map(item => item.id === editingId ? { ...editForm, title: editForm.title.trim() } : item);
    saveToStorage(updated);
    setEditingId(null);
    setEditForm(DEFAULT_ITEMS[0]);
    setMessage({ type: "success", text: "Updated successfully!" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(DEFAULT_ITEMS[0]);
    setComments([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hope Studio</h1>
          <p className="mt-1 text-sm text-gray-500">Manage Hope Studio content</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Section</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="all">All Sections</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Edit Form */}
      {editingId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Edit: {CATEGORIES.find(c => c.value === editingId)?.label}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label>
              <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
                Choose Image
              </button>
              {editForm.image && (
                <div className="mt-3">
                  <img src={editForm.image} alt="Preview" className="h-40 w-auto rounded-md object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description (for listing page)</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Content (for detail page - HTML supported)</label>
              <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={5} className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm" />
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.hidden !== true}
                  onChange={(e) => setEditForm({ ...editForm, hidden: !e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Visible on website</span>
              </label>
              <span className="text-xs text-gray-400">(Uncheck to hide this section)</span>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button onClick={handleCancel} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleSave} className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Update</button>
            </div>
          </div>

          {/* Comment Management Section */}
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
        </div>
      )}

      {/* Section Items */}
      <div className="space-y-6">
        {itemsByCategory.map((cat) => {
          const categoryItems = filterCategory === "all" || filterCategory === cat.value ? cat.items : [];

          if (filterCategory !== "all" && filterCategory !== cat.value) return null;

          return (
            <div key={cat.value} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{cat.label}</span>
                </div>
                <span className="text-xs text-gray-400">{categoryItems.length} item(s)</span>
              </div>

              <div className="divide-y divide-gray-100">
                {categoryItems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No items in this section
                  </div>
                ) : (
                  categoryItems.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.image && (
                          <img src={item.image} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{item.title}</span>
                            {item.hidden && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Hidden</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => handleEdit(item)} className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">Edit</button>
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
