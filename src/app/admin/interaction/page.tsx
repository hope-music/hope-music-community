"use client";

import { useState, useEffect, useRef } from "react";
import { ViolationModal, type ViolationAction } from "@/components/ui/ViolationModal";
import { INTERACTION_CATEGORY_OPTIONS } from "@/lib/constants";
import {
  INTERACTION_STORAGE_KEY,
  normalizeInteractionCategory,
  normalizeInteractionItems,
  parseInteractionItems,
} from "@/lib/interaction";

type TimeFilter = "all" | "today" | "week" | "month" | "year";

const CATEGORIES = INTERACTION_CATEGORY_OPTIONS;
const CATEGORY_OPTIONS = INTERACTION_CATEGORY_OPTIONS;

// ============================================
// TYPES
// ============================================
interface Interaction {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  content: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  // Violation audit fields
  managedBy?: string;
  managedAt?: number;
  reason?: string;
  isHidden?: boolean;
  // Featured fields
  isPinned?: boolean;
  isFeatured?: boolean;
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

// ============================================
// CONSTANTS
// ============================================
// Default comments
const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "placeholder_1",
    authorName: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    authorAvatar: "🎵",
    content: "Great discussion! Very informative.",
    createdAt: Date.now() - 86400000 * 3,
    replies: [
      {
        id: "placeholder_1_reply",
        authorName: "Mike Chen",
        authorEmail: "mike@example.com",
        authorAvatar: "🎤",
        content: "I agree! Thanks for sharing.",
        createdAt: Date.now() - 86400000 * 2,
        replies: [],
      },
    ],
  },
  {
    id: "placeholder_2",
    authorName: "Emily Davis",
    authorEmail: "emily@example.com",
    authorAvatar: "🎸",
    content: "This is exactly what I needed. Bookmarking for later!",
    createdAt: Date.now() - 86400000 * 5,
    replies: [],
  },
  {
    id: "placeholder_3",
    authorName: "Alex Thompson",
    authorEmail: "alex@example.com",
    authorAvatar: "🎹",
    content: "Looking forward to more content like this.",
    createdAt: Date.now() - 86400000 * 7,
    replies: [],
  },
];

const COMMENTS_STORAGE_KEY = "interaction_comments";
const BANNED_USERS_KEY = "interaction_banned_users";

// ============================================
// RICH TEXT EDITOR
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================
export default function AdminInteractionPage() {
  // Data state
  const [items, setItems] = useState<Interaction[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string>(CATEGORIES[0]?.value ?? "software");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // UI state
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Interaction | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("software");
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Comment management state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBannedUsers, setCommentBannedUsers] = useState<BanEntry[]>([]);

  // Violation modal state
  const [violationModal, setViolationModal] = useState<{
    isOpen: boolean;
    targetType: "post" | "comment";
    targetId: string;
    targetTitle: string;
    targetAuthor: string;
    targetAuthorEmail?: string;
  } | null>(null);
  const [violationLoading, setViolationLoading] = useState(false);

  // Load data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(INTERACTION_STORAGE_KEY);
      if (stored) {
        try {
          const data = parseInteractionItems<Interaction>(stored);
          const normalizedData = normalizeInteractionItems(data);

          // If data is corrupted or too few, reset to default
          if (!normalizedData || normalizedData.length < 10) {
            const defaults = getDefaultPosts();
            setItems(defaults);
            localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(defaults));
          } else {
            setItems(normalizedData);
            localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(normalizedData));
          }
        } catch {
          const defaults = getDefaultPosts();
          setItems(defaults);
          localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(defaults));
        }
      } else {
        const defaults = getDefaultPosts();
        setItems(defaults);
          localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(defaults));
      }
      setIsInitialized(true);
    }
  }, []);

  // Show toast message
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // ============================================
  // STORAGE HELPERS
  // ============================================
  const saveToStorage = (data: Interaction[]) => {
    localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(data));
    setItems(data);
  };

  // ============================================
  // COMMENT MANAGEMENT
  // ============================================
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
      setCommentBannedUsers(JSON.parse(banned));
    } else {
      setCommentBannedUsers([]);
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
    return commentBannedUsers.some(b => b.email === email && (b.expiresAt === null || b.expiresAt > now));
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm("Delete this comment and all its replies?")) return;
    const updated = comments.filter((c) => c.id !== commentId);
    if (editingItem) {
      saveComments(editingItem.id, updated);
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
    if (editingItem) {
      saveComments(editingItem.id, updated);
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
    const newBanned = commentBannedUsers.filter(b => b.email !== email);
    newBanned.push({ email, expiresAt });
    setCommentBannedUsers(newBanned);
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));
    if (editingItem && deleteComments) {
      saveComments(editingItem.id, updatedComments);
    }
    const durationText = duration === null ? "permanently" : `${duration / 86400000} day(s)`;
    setMessage({ type: "success", text: `User ${email} banned ${durationText}` });
  };

  const handleUnbanUser = (email: string) => {
    const newBanned = commentBannedUsers.filter(b => b.email !== email);
    setCommentBannedUsers(newBanned);
    localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));
    setMessage({ type: "success", text: `User ${email} unbanned` });
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

  // ============================================
  // VIOLATION HANDLING
  // ============================================
  const openViolationModal = (
    targetType: "post" | "comment",
    targetId: string,
    targetTitle: string,
    targetAuthor: string,
    targetAuthorEmail?: string
  ) => {
    setViolationModal({
      isOpen: true,
      targetType,
      targetId,
      targetTitle,
      targetAuthor,
      targetAuthorEmail,
    });
  };

  const handleViolationAction = async (action: ViolationAction) => {
    setViolationLoading(true);
    try {
      if (violationModal) {
        const { targetType, targetId } = violationModal;

        if (targetType === "post") {
          // Update post with violation audit
          const updated = items.map((item) => {
            if (item.id === targetId) {
              const updates: Partial<Interaction> = {
                managedBy: action.managedBy,
                managedAt: Date.now(),
                reason: action.reason,
              };

              if (action.action === "delete") {
                // Mark as hidden and delete
                return { ...item, ...updates, isHidden: true };
              } else {
                // Just hide, keep content
                return { ...item, ...updates, isHidden: true };
              }
            }
            return item;
          });
          saveToStorage(updated);
          setMessage({ type: "success", text: `Post handled: ${action.action === "delete" ? "deleted" : "hidden"}` });
        } else {
          // Handle comment
          const updatedComments = comments.filter((c) => c.id !== targetId);
          if (editingItem) {
            saveComments(editingItem.id, updatedComments);
          }
          setMessage({ type: "success", text: "Comment deleted" });
        }

        // Handle user ban
        if (action.banUser && action.banDuration) {
          const durations: Record<string, number | null> = {
            "1day": 86400000,
            "7days": 604800000,
            "permanent": null,
          };
          const banDurationMs = durations[action.banDuration];

          if (violationModal.targetAuthorEmail) {
            const newBanned = commentBannedUsers.filter((b) => b.email !== violationModal!.targetAuthorEmail);
            newBanned.push({
              email: violationModal.targetAuthorEmail,
              expiresAt: banDurationMs === null ? null : Date.now() + banDurationMs,
            });
            setCommentBannedUsers(newBanned);
            localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(newBanned));

            const durationText = action.banDuration === "permanent" ? "permanently" : `for ${action.banDuration}`;
            setMessage((prev) => ({
              type: "success",
              text: `${prev?.text || ""} User banned ${durationText}.`.trim(),
            }));
          }
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to handle violation" });
    } finally {
      setViolationLoading(false);
      setViolationModal(null);
    }
  };

  // ============================================
  // PIN & FEATURE HANDLING
  // ============================================
  const togglePin = (itemId: string) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, isPinned: !item.isPinned, updatedAt: Date.now() };
      }
      return item;
    });
    saveToStorage(updated);
    setMessage({ type: "success", text: "Pin status updated" });
  };

  const toggleFeatured = (itemId: string) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, isFeatured: !item.isFeatured, updatedAt: Date.now() };
      }
      return item;
    });
    saveToStorage(updated);
    setMessage({ type: "success", text: "Highlight status updated" });
  };

  const moveCategory = (itemId: string, newCategory: string) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, category: newCategory, updatedAt: Date.now() };
      }
      return item;
    });
    saveToStorage(updated);
    setMessage({ type: "success", text: `Moved to ${newCategory}` });
  };

  // ============================================
  // FORM HANDLERS
  // ============================================
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
    setEditingItem(null);
    setTitle("");
    setDescription("");
    setContent("");
    setCategory(filterCategory || "software");
    setAuthor("");
    setCoverImage("");
    setCoverPreview(null);
    setComments(DEFAULT_COMMENTS);
    setCommentBannedUsers([]);
    setShowForm(true);
  };

  const handleEdit = (item: Interaction) => {
    setEditingItem(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setContent(item.content || "");
    setCategory(item.category || "software");
    setAuthor(item.author || "");
    setCoverImage(item.coverImage || "");
    setCoverPreview(item.coverImage || null);
    loadComments(item.id);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    setLoading(true);
    try {
      const now = Date.now();
      if (editingItem) {
        const updated = items.map((item) => item.id === editingItem.id ? { ...item, title: title.trim(), description, content, category, author, coverImage, updatedAt: now } : item);
        saveToStorage(updated);
        setMessage({ type: "success", text: "Updated successfully!" });
      } else {
        const newItem: Interaction = { id: now.toString(), title: title.trim(), category, description, content, author, coverImage, createdAt: now, updatedAt: now };
        saveToStorage([newItem, ...items]);
        setMessage({ type: "success", text: "Created successfully!" });
      }
      setShowForm(false);
    } catch { setMessage({ type: "error", text: "Failed" }); } finally { setLoading(false); }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this item?")) return;
    saveToStorage(items.filter((item) => item.id !== id));
    setMessage({ type: "success", text: "Deleted" });
  };

  // ============================================
  // SELECTION HANDLERS
  // ============================================
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAllInCategory = (categoryValue: string) => {
    const categoryItems = items.filter((p) => p.category === categoryValue);
    const allSelected = categoryItems.every((p) => selectedIds.has(p.id));

    const newSelected = new Set(selectedIds);
    if (allSelected) {
      categoryItems.forEach((p) => newSelected.delete(p.id));
    } else {
      categoryItems.forEach((p) => newSelected.add(p.id));
    }
    setSelectedIds(newSelected);
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) {
      setMessage({ type: "error", text: "No items selected" });
      return;
    }
    if (!confirm(`Delete ${selectedIds.size} item(s)?`)) return;
    const updated = items.filter((item) => !selectedIds.has(item.id));
    saveToStorage(updated);
    setSelectedIds(new Set());
    setMessage({ type: "success", text: `${selectedIds.size} item(s) deleted` });
  };

  // ============================================
  // HELPERS
  // ============================================
  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString();

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

  // ============================================
  // FILTERED DATA
  // ============================================
  const itemsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((p) => p.category === cat.value),
  }));

  const isWithinTimeFilter = (timestamp: number): boolean => {
    const now = Date.now();
    const itemDate = new Date(timestamp);

    switch (timeFilter) {
      case "today": {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return timestamp >= startOfDay.getTime();
      }
      case "week": {
        return now - timestamp <= 7 * 24 * 60 * 60 * 1000;
      }
      case "month": {
        return itemDate.getFullYear() === new Date(now).getFullYear() && itemDate.getMonth() === new Date(now).getMonth();
      }
      case "year": {
        return itemDate.getFullYear() === new Date(now).getFullYear();
      }
      case "all":
      default:
        return true;
    }
  };

  const filteredItems = items.filter((p) => {
    const matchesTime = isWithinTimeFilter(p.createdAt);
    if (!matchesTime) return false;

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.author.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    );
  });

  const filteredItemsByCategory = itemsByCategory.map((cat) => ({
    ...cat,
    items: filteredItems.filter((p) => p.category === cat.value),
  })).filter((cat) => cat.value === filterCategory || (searchQuery.trim() || timeFilter !== "all") && cat.items.length > 0);

  // ============================================
  // RENDER
  // ============================================
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interaction</h1>
          <p className="mt-1 text-sm text-gray-500">Manage interaction posts</p>
        </div>
        <button onClick={handleNew} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">+ New Topic</button>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const count = itemsByCategory.find((c) => c.value === cat.value)?.items.length || 0;
            const isActive = filterCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setFilterCategory(cat.value)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md ml-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Time Filter */}
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchDelete}
              className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Violation Modal */}
      {violationModal && (
        <ViolationModal
          isOpen={violationModal.isOpen}
          onClose={() => setViolationModal(null)}
          onConfirm={handleViolationAction}
          targetType={violationModal.targetType}
          targetTitle={violationModal.targetTitle}
          targetAuthor={violationModal.targetAuthor}
          targetAuthorEmail={violationModal.targetAuthorEmail}
          loading={violationLoading}
        />
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">{editingItem ? "Edit" : "New"} Topic</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2">
                  {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Author</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label>
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                <button type="button" onClick={() => coverInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Image</button>
                {coverPreview && (
                  <div className="mt-2 flex items-center gap-4">
                    <img src={coverPreview} alt="Preview" className="h-20 w-32 rounded-md object-cover" />
                    <button type="button" onClick={() => { setCoverImage(""); setCoverPreview(null); }} className="text-sm text-red-500 hover:text-red-700">Remove</button>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Summary (for list display)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Content</label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button>
              <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-white disabled:opacity-50">{loading ? "Saving..." : editingItem ? "Update" : "Create"}</button>
            </div>
          </form>

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
                          <button onClick={() => openViolationModal("comment", comment.id, comment.content.substring(0, 50) + "...", comment.authorName, comment.authorEmail)} className="text-xs text-orange-600 hover:text-orange-700 font-medium">Handle</button>
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

      {/* Category Posts */}
      <div className="space-y-6">
        {filteredItemsByCategory.map((cat) => {
          const categoryItems = searchQuery.trim()
            ? filteredItems.filter((p) => p.category === cat.value)
            : cat.items;

          const allSelected = categoryItems.length > 0 && categoryItems.every((p) => selectedIds.has(p.id));

          return (
            <div key={cat.value} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => toggleSelectAllInCategory(cat.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="font-medium text-gray-900">{cat.label}</span>
                  <span className="text-sm text-gray-500">({categoryItems.length})</span>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {categoryItems.length === 0 ? (
                  <div className="px-4 py-6 text-center text-gray-500 text-sm">
                    No topics in this category
                  </div>
                ) : (
                  categoryItems.map((item) => (
                    <div key={item.id} className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${selectedIds.has(item.id) ? "bg-blue-50/30" : ""}`}>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        {item.coverImage && (
                          <img src={item.coverImage} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{item.title}</span>
                            {item.author && <span className="text-xs text-gray-400">by {item.author}</span>}
                          </div>
                          <span className="text-xs text-gray-400 truncate">{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        {item.isPinned && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Pinned</span>
                        )}
                        {item.isFeatured && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded">Featured</span>
                        )}
                        <button
                          onClick={() => togglePin(item.id)}
                          className={`px-2 py-1 text-xs font-medium rounded ${item.isPinned ? "bg-blue-100 text-blue-700" : "text-blue-600 hover:bg-blue-50"}`}
                        >
                          {item.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={() => toggleFeatured(item.id)}
                          className={`px-2 py-1 text-xs font-medium rounded ${item.isFeatured ? "bg-yellow-100 text-yellow-700" : "text-yellow-600 hover:bg-yellow-50"}`}
                        >
                          {item.isFeatured ? "Unhighlight" : "Highlight"}
                        </button>
                        <select
                          value={item.category}
                          onChange={(e) => {
                            if (e.target.value !== item.category) {
                              moveCategory(item.id, e.target.value);
                            }
                          }}
                          className="px-2 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          {CATEGORY_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        {item.isHidden ? (
                          <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 rounded">Hidden</span>
                        ) : (
                          <button
                            onClick={() => openViolationModal("post", item.id, item.title, item.author || "Unknown")}
                            className="px-2 py-1 text-xs font-medium text-orange-600 hover:bg-orange-50 rounded"
                          >
                            Handle
                          </button>
                        )}
                        <button onClick={() => handleEdit(item)} className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded">Delete</button>
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

// ============================================
// DEFAULT POSTS DATA
// ============================================
function getDefaultPosts(): Interaction[] {
  const now = Date.now();
  return [
    // Software
    { id: "ph-soft-1", title: "ISAT Interaction 2023 v1.0.4 Released", author: "DevTeam", description: "Latest version announcement", coverImage: "", content: "<p>Release notes...</p>", category: "software", createdAt: now - 3600000 * 2, updatedAt: now - 3600000 * 2 },
    { id: "ph-soft-2", title: "How to optimize latent settings in DAW Soundworks", author: "AudioPro", description: "Latency optimization guide", coverImage: "", content: "<p>Guide content...</p>", category: "software", createdAt: now - 3600000 * 5, updatedAt: now - 3600000 * 5 },
    { id: "ph-soft-3", title: "MIDI controller mapping tutorial for live performance", author: "MIDI_Master", description: "MIDI mapping guide", coverImage: "", content: "<p>Tutorial content...</p>", category: "software", createdAt: now - 3600000 * 12, updatedAt: now - 3600000 * 12 },
    { id: "ph-soft-4", title: "Best free VST plugins for orchestral composition", author: "OrchestraFan", description: "Free VST plugins list", coverImage: "", content: "<p>List content...</p>", category: "software", createdAt: now - 3600000 * 24, updatedAt: now - 3600000 * 24 },
    { id: "ph-soft-5", title: "Audio interface latency troubleshooting guide", author: "StudioGuru", description: "Latency troubleshooting", coverImage: "", content: "<p>Guide content...</p>", category: "software", createdAt: now - 3600000 * 36, updatedAt: now - 3600000 * 36 },
    { id: "ph-soft-6", title: "Setting up multi-monitor workspace for mixing", author: "MixEngineer", description: "Multi-monitor setup", coverImage: "", content: "<p>Setup guide...</p>", category: "software", createdAt: now - 3600000 * 48, updatedAt: now - 3600000 * 48 },
    { id: "ph-soft-7", title: "Cloud collaboration tools for remote music production", author: "RemoteBeat", description: "Cloud collaboration tools", coverImage: "", content: "<p>Tools overview...</p>", category: "software", createdAt: now - 3600000 * 60, updatedAt: now - 3600000 * 60 },
    { id: "ph-soft-8", title: "Automating reverb sends with sidechain compression", author: "FXWizard", description: "Reverb automation techniques", coverImage: "", content: "<p>Techniques...</p>", category: "software", createdAt: now - 3600000 * 72, updatedAt: now - 3600000 * 72 },
    { id: "ph-soft-9", title: "Exporting stems correctly for film scoring projects", author: "FilmScore", description: "Stem export guide", coverImage: "", content: "<p>Guide content...</p>", category: "software", createdAt: now - 3600000 * 84, updatedAt: now - 3600000 * 84 },
    { id: "ph-soft-10", title: "Building a custom macro pad for live DJ sets", author: "DJLIVE", description: "Custom macro pad DIY", coverImage: "", content: "<p>DIY guide...</p>", category: "software", createdAt: now - 3600000 * 96, updatedAt: now - 3600000 * 96 },
    // Hardware
    { id: "ph-hard-1", title: "Best audio interfaces of 2026 — comprehensive comparison", author: "GearReviewer", description: "Audio interface comparison", coverImage: "", content: "<p>Comparison content...</p>", category: "hardware", createdAt: now - 3600000 * 3, updatedAt: now - 3600000 * 3 },
    { id: "ph-hard-2", title: "Monitor speaker placement guide — acoustics for small rooms", author: "AcousticPro", description: "Speaker placement guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 8, updatedAt: now - 3600000 * 8 },
    { id: "ph-hard-3", title: "Understanding microphone polar patterns", author: "MicExpert", description: "Mic polar patterns explained", coverImage: "", content: "<p>Explanation...</p>", category: "hardware", createdAt: now - 3600000 * 20, updatedAt: now - 3600000 * 20 },
    { id: "ph-hard-4", title: "DI box explained: active vs passive", author: "LiveSound", description: "DI box guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 32, updatedAt: now - 3600000 * 32 },
    { id: "ph-hard-5", title: "Audio cabling basics — balanced vs unbalanced", author: "CableKing", description: "Cabling basics", coverImage: "", content: "<p>Basics...</p>", category: "hardware", createdAt: now - 3600000 * 44, updatedAt: now - 3600000 * 44 },
    { id: "ph-hard-6", title: "DIY acoustic treatment on a budget", author: "BudgetStudio", description: "Budget acoustic treatment", coverImage: "", content: "<p>DIY guide...</p>", category: "hardware", createdAt: now - 3600000 * 56, updatedAt: now - 3600000 * 56 },
    { id: "ph-hard-7", title: "Headphone amplifier pairing guide", author: "Audiophile", description: "Headphone amp pairing", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 68, updatedAt: now - 3600000 * 68 },
    { id: "ph-hard-8", title: "How to choose the right MIDI keyboard", author: "KeysPlayer", description: "MIDI keyboard guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 80, updatedAt: now - 3600000 * 80 },
    { id: "ph-hard-9", title: "Studio furniture and desk setup essentials", author: "StudioBuilder", description: "Studio desk setup", coverImage: "", content: "<p>Setup guide...</p>", category: "hardware", createdAt: now - 3600000 * 92, updatedAt: now - 3600000 * 92 },
    { id: "ph-hard-10", title: "Power conditioning and surge protection guide", author: "SafetyFirst", description: "Power protection guide", coverImage: "", content: "<p>Guide content...</p>", category: "hardware", createdAt: now - 3600000 * 104, updatedAt: now - 3600000 * 104 },
    // Music
    { id: "ph-music-1", title: "Songwriting 101: Finding your unique melodic voice", author: "Songsmith", description: "Songwriting basics", coverImage: "", content: "<p>Basics...</p>", category: "music", createdAt: now - 3600000 * 4, updatedAt: now - 3600000 * 4 },
    { id: "ph-music-2", title: "Orchestral arrangement tips for small ensembles", author: "Arranger", description: "Orchestral arrangement tips", coverImage: "", content: "<p>Tips...</p>", category: "music", createdAt: now - 3600000 * 16, updatedAt: now - 3600000 * 16 },
    { id: "ph-music-3", title: "Understanding modal scales beyond major and minor", author: "TheoryNerd", description: "Modal scales guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 28, updatedAt: now - 3600000 * 28 },
    { id: "ph-music-4", title: "Music theory for producers", author: "BeatMaker", description: "Music theory basics", coverImage: "", content: "<p>Basics...</p>", category: "music", createdAt: now - 3600000 * 40, updatedAt: now - 3600000 * 40 },
    { id: "ph-music-5", title: "Creating emotional chord progressions", author: "Composer", description: "Chord progression guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 52, updatedAt: now - 3600000 * 52 },
    { id: "ph-music-6", title: "Rhythm and groove fundamentals", author: "Drummer", description: "Rhythm fundamentals", coverImage: "", content: "<p>Fundamentals...</p>", category: "music", createdAt: now - 3600000 * 64, updatedAt: now - 3600000 * 64 },
    { id: "ph-music-7", title: "Melody writing techniques", author: "Melodist", description: "Melody techniques", coverImage: "", content: "<p>Techniques...</p>", category: "music", createdAt: now - 3600000 * 76, updatedAt: now - 3600000 * 76 },
    { id: "ph-music-8", title: "Harmonic color — using extended chords", author: "JazzCat", description: "Extended chords guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 88, updatedAt: now - 3600000 * 88 },
    { id: "ph-music-9", title: "Arranging for different ensembles", author: "EnsembleLead", description: "Arranging guide", coverImage: "", content: "<p>Guide...</p>", category: "music", createdAt: now - 3600000 * 100, updatedAt: now - 3600000 * 100 },
    { id: "ph-music-10", title: "Music production workflow optimization", author: "ProducerX", description: "Workflow optimization", coverImage: "", content: "<p>Tips...</p>", category: "music", createdAt: now - 3600000 * 112, updatedAt: now - 3600000 * 112 },
    // Production
    { id: "ph-prod-1", title: "Lighting design fundamentals for live stage", author: "LightMaster", description: "Lighting design basics", coverImage: "", content: "<p>Basics...</p>", category: "production", createdAt: now - 3600000 * 6, updatedAt: now - 3600000 * 6 },
    { id: "ph-prod-2", title: "Sound reinforcement setup for live theater", author: "SoundTech", description: "Sound setup guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 18, updatedAt: now - 3600000 * 18 },
    { id: "ph-prod-3", title: "Stage rigging safety standards", author: "SafetyOfficer", description: "Rigging safety", coverImage: "", content: "<p>Standards...</p>", category: "production", createdAt: now - 3600000 * 30, updatedAt: now - 3600000 * 30 },
    { id: "ph-prod-4", title: "Projection mapping techniques", author: "VisualArtist", description: "Projection mapping", coverImage: "", content: "<p>Techniques...</p>", category: "production", createdAt: now - 3600000 * 42, updatedAt: now - 3600000 * 42 },
    { id: "ph-prod-5", title: "Set design and construction on a budget", author: "SetBuilder", description: "Budget set design", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 54, updatedAt: now - 3600000 * 54 },
    { id: "ph-prod-6", title: "AV system integration for venues", author: "AVIntegrator", description: "AV integration guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 66, updatedAt: now - 3600000 * 66 },
    { id: "ph-prod-7", title: "Backstage communication protocols", author: "StageManager", description: "Communication protocols", coverImage: "", content: "<p>Protocols...</p>", category: "production", createdAt: now - 3600000 * 78, updatedAt: now - 3600000 * 78 },
    { id: "ph-prod-8", title: "Pyrotechnics and special effects safety", author: "FXTech", description: "FX safety guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 90, updatedAt: now - 3600000 * 90 },
    { id: "ph-prod-9", title: "Live mixing techniques for bands", author: "LiveMixer", description: "Live mixing tips", coverImage: "", content: "<p>Tips...</p>", category: "production", createdAt: now - 3600000 * 102, updatedAt: now - 3600000 * 102 },
    { id: "ph-prod-10", title: "Stage management best practices", author: "ProManager", description: "Stage management guide", coverImage: "", content: "<p>Guide...</p>", category: "production", createdAt: now - 3600000 * 114, updatedAt: now - 3600000 * 114 },
    // Article
    { id: "ph-res-1", title: "The rich history of musical theater", author: "TheaterBuff", description: "Musical theater history", coverImage: "", content: "<p>History...</p>", category: "article", createdAt: now - 3600000 * 7, updatedAt: now - 3600000 * 7 },
    { id: "ph-res-2", title: "The evolution of recording technology", author: "HistoryNerd", description: "Recording tech history", coverImage: "", content: "<p>History...</p>", category: "article", createdAt: now - 3600000 * 19, updatedAt: now - 3600000 * 19 },
    { id: "ph-res-3", title: "The 10 most influential composers of the 21st century", author: "MusicScholar", description: "Influential composers", coverImage: "", content: "<p>List...</p>", category: "article", createdAt: now - 3600000 * 31, updatedAt: now - 3600000 * 31 },
    { id: "ph-res-4", title: "Psychoacoustics: how the brain processes music", author: "ScienceGuy", description: "Psychoacoustics guide", coverImage: "", content: "<p>Guide...</p>", category: "article", createdAt: now - 3600000 * 43, updatedAt: now - 3600000 * 43 },
    { id: "ph-res-5", title: "Music therapy research — evidence-based practice", author: "Therapist", description: "Music therapy research", coverImage: "", content: "<p>Research...</p>", category: "article", createdAt: now - 3600000 * 55, updatedAt: now - 3600000 * 55 },
    { id: "ph-res-6", title: "Copyright law for independent musicians", author: "LegalEagle", description: "Copyright guide", coverImage: "", content: "<p>Guide...</p>", category: "article", createdAt: now - 3600000 * 67, updatedAt: now - 3600000 * 67 },
    { id: "ph-res-7", title: "The streaming era — understanding music economics", author: "EconMajor", description: "Music economics", coverImage: "", content: "<p>Analysis...</p>", category: "article", createdAt: now - 3600000 * 79, updatedAt: now - 3600000 * 79 },
    { id: "ph-res-8", title: "AI in music composition", author: "AITech", description: "AI music tools", coverImage: "", content: "<p>Overview...</p>", category: "article", createdAt: now - 3600000 * 91, updatedAt: now - 3600000 * 91 },
    { id: "ph-res-9", title: "The future of live music performances", author: "Futurist", description: "Future of live music", coverImage: "", content: "<p>Predictions...</p>", category: "article", createdAt: now - 3600000 * 103, updatedAt: now - 3600000 * 103 },
    { id: "ph-res-10", title: "Music education trends and innovations", author: "EduExpert", description: "Music education trends", coverImage: "", content: "<p>Trends...</p>", category: "article", createdAt: now - 3600000 * 115, updatedAt: now - 3600000 * 115 },
    // Others
    { id: "ph-oth-1", title: "Community guidelines — keeping our forum respectful", author: "Admin", description: "Forum guidelines", coverImage: "", content: "<p>Guidelines...</p>", category: "others", createdAt: now - 3600000 * 168, updatedAt: now - 3600000 * 168 },
    { id: "ph-oth-2", title: "Community event calendar — upcoming meetups", author: "EventLead", description: "Event calendar", coverImage: "", content: "<p>Events...</p>", category: "others", createdAt: now - 3600000 * 72, updatedAt: now - 3600000 * 72 },
    { id: "ph-oth-3", title: "Weekly feedback thread — share your tracks", author: "WeeklyHost", description: "Weekly feedback thread", coverImage: "", content: "<p>Thread...</p>", category: "others", createdAt: now - 3600000 * 168, updatedAt: now - 3600000 * 168 },
    { id: "ph-oth-4", title: "Best resources for learning music theory from scratch", author: "TheoryNewbie", description: "Theory resources", coverImage: "", content: "<p>Resources...</p>", category: "others", createdAt: now - 3600000 * 96, updatedAt: now - 3600000 * 96 },
    { id: "ph-oth-5", title: "Recommended YouTube channels for audio engineering", author: "VideoFan", description: "YouTube recommendations", coverImage: "", content: "<p>Recommendations...</p>", category: "others", createdAt: now - 3600000 * 120, updatedAt: now - 3600000 * 120 },
    { id: "ph-oth-6", title: "Collaborative projects — find your bandmates here", author: "CollabKing", description: "Collaboration thread", coverImage: "", content: "<p>Thread...</p>", category: "others", createdAt: now - 3600000 * 144, updatedAt: now - 3600000 * 144 },
    { id: "ph-oth-7", title: "Monthly challenges — May 2026: Ambient Soundscapes", author: "ChallengeHost", description: "Monthly challenge", coverImage: "", content: "<p>Challenge...</p>", category: "others", createdAt: now - 3600000 * 96, updatedAt: now - 3600000 * 96 },
    { id: "ph-oth-8", title: "Show off your home studio setup!", author: "SetupShare", description: "Studio setup showcase", coverImage: "", content: "<p>Showcase...</p>", category: "others", createdAt: now - 3600000 * 168, updatedAt: now - 3600000 * 168 },
    { id: "ph-oth-9", title: "Tips for performing musicians on tour", author: "TourVet", description: "Touring tips", coverImage: "", content: "<p>Tips...</p>", category: "others", createdAt: now - 3600000 * 192, updatedAt: now - 3600000 * 192 },
    { id: "ph-oth-10", title: "How to deal with performance anxiety", author: "MindsetCoach", description: "Performance anxiety guide", coverImage: "", content: "<p>Guide...</p>", category: "others", createdAt: now - 3600000 * 216, updatedAt: now - 3600000 * 216 },
  ];
}
