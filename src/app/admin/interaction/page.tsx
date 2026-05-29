"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import type { Id } from "@/types/convex";

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

type User = {
  _id: Id<"users">;
  email: string;
  username: string;
  avatar: string;
  role: "user" | "admin";
  isBanned: boolean;
  createdAt: number;
};

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
}

const CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "hardware", label: "Hardware" },
  { value: "music", label: "Music" },
  { value: "production", label: "Production" },
  { value: "resources", label: "Resources" },
  { value: "other", label: "Other" },
];

export default function AdminInteractionPage() {
  const [activeTab, setActiveTab] = useState<"items" | "users">("items");
  const [items, setItems] = useState<Interaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("software");
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // User management state
  const [userFilter, setUserFilter] = useState<"all" | "active" | "banned" | "admins">("all");
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [expandedUserCategory, setExpandedUserCategory] = useState<string | null>(null);

  // Convex queries and mutations for users
  const allUsers = useQuery(api.admin.listAllUsers) ?? [];
  const updateRole = useMutation(api.admin.updateUserRole);
  const banUser = useMutation(api.admin.banUser);
  const unbanUser = useMutation(api.admin.unbanUser);

  useEffect(() => {
    const stored = localStorage.getItem("admin_interaction");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const saveToStorage = (data: Interaction[]) => {
    localStorage.setItem("admin_interaction", JSON.stringify(data));
    setItems(data);
  };

  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 5000); return () => clearTimeout(t); } }, [message]);

  // Group items by category
  const itemsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((p) => p.category === cat.value),
  }));

  const filteredItems = items.filter((p) => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    return true;
  });

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
    setCategory(filterCategory !== "all" ? filterCategory : "software");
    setAuthor("");
    setCoverImage("");
    setCoverPreview(null);
    setShowForm(true);
  };

  const handleEdit = (item: Interaction) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setContent(item.content || "");
    setCategory(item.category || "software");
    setAuthor(item.author || "");
    setCoverImage(item.coverImage || "");
    setCoverPreview(item.coverImage || null);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setMessage({ type: "error", text: "Title is required" }); return; }
    setLoading(true);
    try {
      const now = Date.now();
      if (editingId) {
        const updated = items.map((item) => item.id === editingId ? { ...item, title: title.trim(), description, content, category, author, coverImage, updatedAt: now } : item);
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

  const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString();

  // User management functions
  const filteredUsers = allUsers.filter((u: User) => {
    if (userFilter === "active") return !u.isBanned;
    if (userFilter === "banned") return u.isBanned;
    if (userFilter === "admins") return u.role === "admin";
    return true;
  });

  const handleUserRoleChange = async (userId: Id<"users">, newRole: "user" | "admin") => {
    setUserActionLoading(true);
    try {
      await updateRole({ userId, newRole });
      setMessage({ type: "success", text: `User role updated to ${newRole}` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update role" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUserBan = async (userId: Id<"users">) => {
    if (!confirm("Ban this user? They will not be able to log in.")) return;
    setUserActionLoading(true);
    try {
      await banUser({ userId });
      setMessage({ type: "success", text: "User banned" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to ban user" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUserUnban = async (userId: Id<"users">) => {
    setUserActionLoading(true);
    try {
      await unbanUser({ userId });
      setMessage({ type: "success", text: "User unbanned" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to unban user" });
    } finally {
      setUserActionLoading(false);
    }
  };

  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter((u: User) => !u.isBanned).length;
  const bannedUsers = allUsers.filter((u: User) => u.isBanned).length;
  const adminCount = allUsers.filter((u: User) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Interaction</h1><p className="mt-1 text-sm text-gray-500">Manage resources and users</p></div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200">
        <button
          onClick={() => setActiveTab("items")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "items"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Resources ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`border-b-2 px-4 py-3 text-sm font-medium ${
            activeTab === "users"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Users ({totalUsers})
        </button>
      </div>

      {message && <div className={`rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message.text}</div>}

      {/* Resources Tab */}
      {activeTab === "items" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Filter by Category</label>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-md border border-gray-300 px-3 py-2 text-sm">
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label} ({itemsByCategory.find(c => c.value === cat.value)?.items.length || 0})</option>
                ))}
              </select>
            </div>
            <div className="ml-auto">
              <button onClick={handleNew} className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">+ New Resource</button>
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">{editingId ? "Edit" : "New"} Resource</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div><label className="mb-1 block text-sm font-medium text-gray-700">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2" required /></div>
                  <div><label className="mb-1 block text-sm font-medium text-gray-700">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2">{CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                  <div><label className="mb-1 block text-sm font-medium text-gray-700">Author</label><input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
                  <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label><input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" /><button type="button" onClick={() => coverInputRef.current?.click()} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Choose Image</button>{coverPreview && <div className="mt-2 flex items-center gap-4"><img src={coverPreview} alt="Preview" className="h-20 w-32 rounded-md object-cover" /><button type="button" onClick={() => { setCoverImage(""); setCoverPreview(null); }} className="text-sm text-red-500 hover:text-red-700">Remove</button></div>}</div>
                  <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-gray-700">Summary (for list display)</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2" /></div>
                </div>
                <div className="flex justify-end gap-3 border-t pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-6 py-2 text-white disabled:opacity-50">{loading ? "Saving..." : editingId ? "Update" : "Create"}</button></div>
              </form>
            </div>
          )}

          {/* Category Accordion */}
          <div className="space-y-6">
            {itemsByCategory.map((cat) => {
              const categoryItems = filterCategory === "all" || filterCategory === cat.value ? cat.items : [];

              if (filterCategory !== "all" && filterCategory !== cat.value) return null;

              return (
                <div key={cat.value} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(expandedCategory === cat.value ? null : cat.value)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{expandedCategory === cat.value ? "▼" : "▶"}</span>
                      <span className="font-medium text-gray-900">{cat.label}</span>
                      <span className="text-sm text-gray-500">({categoryItems.length})</span>
                    </div>
                  </button>

                  {expandedCategory === cat.value && (
                    <div className="divide-y divide-gray-100">
                      {categoryItems.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                          No items in this category
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
                                  {item.author && <span className="text-xs text-gray-400">by {item.author}</span>}
                                </div>
                                <span className="text-xs text-gray-400 truncate">{formatDate(item.createdAt)}</span>
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
                  )}
                </div>
              );
            })}
          </div>

          {/* All Items List */}
          {filterCategory === "all" && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <span className="font-medium text-gray-900">All Items</span>
                <span className="ml-2 text-sm text-gray-500">({filteredItems.length})</span>
              </div>
              <div className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">No items found</div>
                ) : (
                  filteredItems.map((item) => (
                    <div key={item.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.coverImage && (
                          <img src={item.coverImage} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">{item.title}</span>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                              {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                            </span>
                          </div>
                          {item.author && <span className="text-xs text-gray-400">by {item.author} • {formatDate(item.createdAt)}</span>}
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
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-red-600">{bannedUsers}</div>
              <div className="text-sm text-gray-500">Banned</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-2xl font-bold text-blue-600">{adminCount}</div>
              <div className="text-sm text-gray-500">Admins</div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center justify-end">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value as any)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Users</option>
              <option value="active">Active Only</option>
              <option value="banned">Banned Only</option>
              <option value="admins">Admins Only</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user: User) => (
                    <tr key={user._id} className={user.isBanned ? "bg-red-50" : ""}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{user.avatar}</span>
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleUserRoleChange(user._id, e.target.value as "user" | "admin")}
                          disabled={userActionLoading}
                          className="rounded border border-gray-300 px-2 py-1 text-sm disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isBanned ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">Banned</span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600">Active</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isBanned ? (
                          <button onClick={() => handleUserUnban(user._id)} disabled={userActionLoading} className="rounded bg-green-500 px-3 py-1 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50">Unban</button>
                        ) : (
                          <button onClick={() => handleUserBan(user._id)} disabled={userActionLoading} className="rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50">Ban</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
