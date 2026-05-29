"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "music", label: "Music" },
  { value: "production", label: "Production" },
  { value: "artical", label: "Resources" },
  { value: "other", label: "Others" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

interface Post {
  _id: Id<"posts">;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  isDeleted: boolean;
  isPinned: boolean;
  isFeatured: boolean;
  views: number;
  tags: string[];
  status: string;
  replyCount: number;
  createdAt: number;
  updatedAt?: number;
}

export default function AdminPostsPage() {
  const adminEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "";

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<Id<"posts">>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modal state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchAction, setBatchAction] = useState<"delete" | "pin" | "unpin" | "feature" | "unfeature" | "move" | "status">("delete");
  const [newCategory, setNewCategory] = useState("");
  const [newStatus, setNewStatus] = useState<string>("approved");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Query posts
  const posts = useQuery(api.admin.listAllPosts, {
    callerEmail: adminEmail,
    includeDeleted,
    category: category || undefined,
    status: status || undefined,
    searchQuery: searchQuery || undefined,
  }) as Post[] | undefined;

  // Mutations
  const deletePost = useMutation(api.admin.deletePost);
  const restorePost = useMutation(api.admin.restorePost);
  const togglePinPost = useMutation(api.admin.togglePinPost);
  const toggleFeaturePost = useMutation(api.admin.toggleFeaturePost);
  const updatePostStatus = useMutation(api.admin.updatePostStatus);
  const movePostCategory = useMutation(api.admin.movePostCategory);
  const batchUpdatePosts = useMutation(api.admin.batchUpdatePosts);
  const batchDeletePosts = useMutation(api.admin.batchDeletePosts);

  // Reset selection when posts change
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectAll(false);
  }, [posts]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(posts?.map(p => p._id) || []));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual selection
  const handleSelect = (id: Id<"posts">) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === posts?.length);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get category label
  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  // Get status badge
  const getStatusBadge = (status: string, isDeleted: boolean) => {
    if (isDeleted) return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">Deleted</span>;
    switch (status) {
      case "pending": return <span className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700">Pending</span>;
      case "approved": return <span className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-700">Approved</span>;
      case "rejected": return <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">Rejected</span>;
      default: return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-600">Approved</span>;
    }
  };

  // Handle individual actions
  const handleDelete = async (id: Id<"posts">) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost({ callerEmail: adminEmail, postId: id });
      setMessage({ type: "success", text: "Post deleted" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const handleRestore = async (id: Id<"posts">) => {
    try {
      await restorePost({ callerEmail: adminEmail, postId: id });
      setMessage({ type: "success", text: "Post restored" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const handleTogglePin = async (id: Id<"posts">) => {
    try {
      await togglePinPost({ callerEmail: adminEmail, postId: id });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const handleToggleFeature = async (id: Id<"posts">) => {
    try {
      await toggleFeaturePost({ callerEmail: adminEmail, postId: id });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const handleUpdateStatus = async (id: Id<"posts">, status: string) => {
    try {
      await updatePostStatus({ callerEmail: adminEmail, postId: id, status: status as any });
      setMessage({ type: "success", text: "Status updated" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  const handleMoveCategory = async (id: Id<"posts">, category: string) => {
    try {
      await movePostCategory({ callerEmail: adminEmail, postId: id, newCategory: category });
      setMessage({ type: "success", text: "Category updated" });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  // Handle batch actions
  const handleBatchAction = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    try {
      switch (batchAction) {
        case "delete":
          if (!confirm(`Delete ${ids.length} posts?`)) return;
          await batchDeletePosts({ callerEmail: adminEmail, postIds: ids });
          break;
        case "pin":
          await batchUpdatePosts({ callerEmail: adminEmail, postIds: ids, updates: { isPinned: true } });
          break;
        case "unpin":
          await batchUpdatePosts({ callerEmail: adminEmail, postIds: ids, updates: { isPinned: false } });
          break;
        case "feature":
          await batchUpdatePosts({ callerEmail: adminEmail, postIds: ids, updates: { isFeatured: true } });
          break;
        case "unfeature":
          await batchUpdatePosts({ callerEmail: adminEmail, postIds: ids, updates: { isFeatured: false } });
          break;
        case "move":
          if (!newCategory) return;
          await batchUpdatePosts({ callerEmail: adminEmail, postIds: ids, updates: { category: newCategory } });
          break;
        case "status":
          await batchUpdatePosts({ callerEmail: adminEmail, postIds: ids, updates: { status: newStatus as any } });
          break;
      }
      setSelectedIds(new Set());
      setSelectAll(false);
      setShowBatchModal(false);
      setMessage({ type: "success", text: `Batch action completed on ${ids.length} posts` });
    } catch (e: any) {
      setMessage({ type: "error", text: e.message });
    }
  };

  // Clear message after 3s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const isLoading = posts === undefined;
  const selectedCount = selectedIds.size;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all community posts with search, filter and batch operations</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-gray-600">Show deleted</span>
        </label>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by title, content or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {(searchQuery || category || status) && (
              <button
                onClick={() => { setSearchQuery(""); setCategory(""); setStatus(""); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 border border-blue-200">
          <span className="text-sm font-medium text-blue-700">{selectedCount} post(s) selected</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBatchAction("pin"); setShowBatchModal(true); }}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Pin
            </button>
            <button
              onClick={() => { setBatchAction("feature"); setShowBatchModal(true); }}
              className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
            >
              Feature
            </button>
            <button
              onClick={() => { setBatchAction("move"); setShowBatchModal(true); }}
              className="rounded bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
            >
              Move
            </button>
            <button
              onClick={() => { setBatchAction("status"); setShowBatchModal(true); }}
              className="rounded bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700"
            >
              Set Status
            </button>
            <button
              onClick={() => { setBatchAction("delete"); setShowBatchModal(true); }}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Post
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Author
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stats
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : posts?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No posts found</td>
                </tr>
              ) : (
                posts?.map((post) => (
                  <tr key={post._id} className={`hover:bg-gray-50 ${post.isDeleted ? "opacity-60" : ""}`}>
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(post._id)}
                        onChange={() => handleSelect(post._id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          {post.isPinned && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Pinned</span>}
                          {post.isFeatured && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Featured</span>}
                        </div>
                        <div className="font-medium text-gray-900 truncate">{post.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{post.content.replace(/<[^>]*>/g, "")}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.authorAvatar || "/default-avatar.png"}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.authorUsername}</div>
                          <div className="text-xs text-gray-500">{post.authorEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={post.category}
                        onChange={(e) => handleMoveCategory(post._id, e.target.value)}
                        className="text-xs rounded border border-gray-300 px-2 py-1"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-500">
                        <div>Views: {post.views}</div>
                        <div>Replies: {post.replyCount}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={post.isDeleted ? "deleted" : post.status}
                        onChange={(e) => {
                          if (e.target.value === "deleted") {
                            handleDelete(post._id);
                          } else {
                            handleUpdateStatus(post._id, e.target.value);
                          }
                        }}
                        className="text-xs rounded border border-gray-300 px-2 py-1"
                        disabled={post.isDeleted}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        {post.isDeleted && <option value="deleted">Deleted</option>}
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(post._id)}
                          className={`px-2 py-1 text-xs rounded ${post.isPinned ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          {post.isPinned ? "Unpin" : "Pin"}
                        </button>
                        <button
                          onClick={() => handleToggleFeature(post._id)}
                          className={`px-2 py-1 text-xs rounded ${post.isFeatured ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          {post.isFeatured ? "Unfeature" : "Feature"}
                        </button>
                        {post.isDeleted ? (
                          <button
                            onClick={() => handleRestore(post._id)}
                            className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">
        Showing {posts?.length || 0} posts
        {selectedCount > 0 && ` (${selectedCount} selected)`}
      </div>

      {/* Batch Confirm Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Confirm Batch Action</h3>
            <p className="mt-2 text-sm text-gray-600">
              You are about to {batchAction} {selectedCount} post(s). This action cannot be undone.
            </p>

            {(batchAction === "move") && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            )}

            {(batchAction === "status") && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchAction}
                disabled={batchAction === "move" && !newCategory}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  batchAction === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
