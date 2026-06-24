"use client";

import { useState, useRef, useEffect } from "react";
import { PERFORMANCE_CATEGORY_OPTIONS, GLOBAL_CITY_GROUPS } from "@/lib/constants";
import { useStageProductions, adminStageProductions, useStageProductionsForAdmin, type StageProduction } from "@/lib/useSupabase";

// ── Ticketmaster sync helpers ──────────────────────────────────────────────────
const SYNC_CATEGORIES = [
  { value: "musical", label: "Musical", sources: "Theatre, Musicals" },
  { value: "opera", label: "Opera", sources: "Opera" },
  { value: "classical", label: "Classical", sources: "Classical" },
  { value: "music", label: "Music", sources: "Music" },
  { value: "electronic", label: "Electronic", sources: "Electronic" },
  { value: "pop-rock", label: "Pop & Rock", sources: "18 sub-genres" },
  { value: "performance-art", label: "Performance Art", sources: "Performance Art, Variety" },
  { value: "dance", label: "Dance", sources: "Dance" },
  { value: "other", label: "Other", sources: "17 sub-genres" },
];

type SyncState = "idle" | "previewing" | "syncing";

interface SyncStatus {
  state: SyncState;
  result: any | null;
  error: string | null;
}

// ── Ticketmaster Sync Panel ────────────────────────────────────────────────────
function TMSyncPanel() {
  const [statuses, setStatuses] = useState<Record<string, SyncStatus>>({});

  const runSync = async (category: string, mode: "preview" | "sync") => {
    setStatuses((prev) => ({
      ...prev,
      [category]: { state: mode === "preview" ? "previewing" : "syncing", result: null, error: null },
    }));

    try {
      const res = await fetch("/api/ticketmaster-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStatuses((prev) => ({
        ...prev,
        [category]: { state: "idle", result: data, error: null },
      }));
    } catch (err: any) {
      setStatuses((prev) => ({
        ...prev,
        [category]: { state: "idle", result: null, error: err.message },
      }));
    }
  };

  const isRunning = (cat: string) =>
    statuses[cat]?.state === "previewing" || statuses[cat]?.state === "syncing";

  const result = (cat: string) => statuses[cat]?.result;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-semibold text-blue-900">Ticketmaster Sync</h2>
          <p className="text-xs text-blue-600 mt-0.5">
            Preview counts first, then sync to pull events into the database.
          </p>
        </div>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          API v2
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-blue-700 uppercase tracking-wide border-b border-blue-200">
              <th className="pb-2 pr-4 font-medium">Category</th>
              <th className="pb-2 pr-4 font-medium">Ticketmaster Sources</th>
              <th className="pb-2 font-medium text-center">Actions</th>
              <th className="pb-2 pl-4 font-medium">Result</th>
            </tr>
          </thead>
          <tbody>
            {SYNC_CATEGORIES.map((cat) => {
              const s = statuses[cat.value];
              return (
                <tr key={cat.value} className="border-b border-blue-100 last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-800">{cat.label}</td>
                  <td className="py-2 pr-4 text-xs text-gray-500">{cat.sources}</td>
                  <td className="py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => runSync(cat.value, "preview")}
                        disabled={isRunning(cat.value)}
                        className="px-3 py-1 text-xs rounded border border-blue-300 bg-white text-blue-700 hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {s?.state === "previewing" ? "..." : "Preview"}
                      </button>
                      <button
                        onClick={() => runSync(cat.value, "sync")}
                        disabled={isRunning(cat.value)}
                        className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {s?.state === "syncing" ? "..." : "Sync"}
                      </button>
                    </div>
                  </td>
                  <td className="py-2 pl-4">
                    {s?.error && (
                      <span className="text-xs text-red-600">Error: {s.error}</span>
                    )}
                    {s?.state === "previewing" && (
                      <span className="text-xs text-gray-400">Fetching...</span>
                    )}
                    {s?.state === "syncing" && (
                      <span className="text-xs text-blue-500">Writing to database...</span>
                    )}
                    {s?.state === "idle" && result(cat.value) && (
                      <span className="text-xs text-green-700">
                        {result(cat.value).mode === "preview"
                          ? `${result(cat.value).afterDedup} events (${result(cat.value).totalFetched} raw)`
                          : `Synced: ${result(cat.value).upserted} upserted, ${result(cat.value).errors} errors`}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// Rich Text Editor
// ============================================
function RichTextEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        execCommand("insertImage", base64);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

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
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] max-h-[400px] overflow-y-auto px-4 py-3 focus:outline-none"
        style={{ fontFamily: "Georgia, serif", fontSize: "15px", lineHeight: "1.7" }}
      />
    </div>
  );
}

// ============================================
// Helpers
// ============================================
function formatDate(timestamp?: number): string {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleDateString();
}

function formatDateForInput(timestamp?: number): string {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

// ============================================
// Main Component
// ============================================
export default function StageProductionsPage() {
  const [filterCategory, setFilterCategory] = useState<string>(PERFORMANCE_CATEGORY_OPTIONS[0]?.value ?? "musical");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past" | "draft">("all");
  const [filterCity, setFilterCity] = useState("");
  const [filterCityCustom, setFilterCityCustom] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("musical");
  const [status, setStatus] = useState<"upcoming" | "past" | "draft">("draft");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [itemCity, setItemCity] = useState("");
  const [url, setUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Featured IDs (tracked separately in local state)
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());

  // Supabase query
  const { productions: allProductions, loading, refresh } = useStageProductionsForAdmin();

  // Load featured IDs from fetched data
  useEffect(() => {
    if (allProductions) {
      setFeaturedIds(new Set(allProductions.filter(p => p.is_featured).map(p => p.id)));
    }
  }, [allProductions]);

  // Clear message after 5s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Filtered items
  const filteredItems = (allProductions || []).filter((p) => {
    if (p.category !== filterCategory) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterCity && p.city && !p.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
    return true;
  });

  // Items grouped by category (for stats)
  const itemsByCategory = PERFORMANCE_CATEGORY_OPTIONS.map((sub) => ({
    ...sub,
    count: (allProductions || []).filter((p) => p.category === sub.value).length,
  }));

  // Category counts for dropdown
  const getCategoryCount = (catValue: string) =>
    (allProductions || []).filter((p) => p.category === catValue).length;

  // Handle cover image selection
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCoverImage(base64);
        setCoverPreview(base64);
      };
      reader.readAsDataURL(file);
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // Reset form for new item
  const handleNew = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setContent("");
    setCategory(filterCategory);
    setStatus("draft");
    setEventDate("");
    setEventTime("");
    setItemCity("");
    setUrl("");
    setCoverImage("");
    setCoverPreview(null);
    setShowForm(true);
  };

  // Load item data into form for editing
  const handleEdit = (item: StageProduction) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setContent(item.content || "");
    setCategory(item.category || filterCategory);
    setStatus(item.status || "draft");
    const dateVal = formatDateForInput(item.event_date);
    setEventDate(dateVal);
    setEventTime(dateVal && item.event_time ? item.event_time.slice(0, 5) : "");
    setItemCity(item.city || "");
    setUrl(item.url || "");
    setCoverImage(item.cover_image || "");
    setCoverPreview(item.cover_image || null);
    setShowForm(true);
  };

  // Toggle featured
  const toggleFeatured = async (itemId: string) => {
    const item = (allProductions || []).find(p => p.id === itemId);
    if (!item) return;
    const newFeatured = !item.is_featured;
    if (newFeatured && featuredIds.size >= 9) {
      setMessage({ type: "error", text: "Maximum 9 featured items allowed" });
      return;
    }
    try {
      const { error } = await adminStageProductions.update(itemId, { is_featured: newFeatured });
      if (error) throw new Error(error.message);
      setFeaturedIds(prev => {
        const next = new Set(prev);
        if (newFeatured) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
      refresh();
      setMessage({ type: "success", text: newFeatured ? "Added to Featured" : "Removed from Featured" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update" });
    }
  };

  // Save (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage({ type: "error", text: "Title is required" });
      return;
    }

    const eventDateMs = eventDate
      ? new Date(eventDate + "T" + (eventTime || "00:00:00")).getTime()
      : undefined;

    const payload = {
      title: title.trim(),
      description,
      content,
      cover_image: coverImage,
      url,
      category,
      status,
      city: itemCity.trim() || null,
      event_date: eventDateMs,
      event_time: eventTime,
      media_links: [],
    };

    try {
      if (editingId) {
        const { error } = await adminStageProductions.update(editingId, payload);
        if (error) throw new Error(error.message);
        setMessage({ type: "success", text: "Updated successfully!" });
      } else {
        const { error } = await adminStageProductions.create(payload);
        if (error) throw new Error(error.message);
        setMessage({ type: "success", text: "Created successfully!" });
      }
      refresh();
      setShowForm(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" });
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      const { error } = await adminStageProductions.delete(id);
      if (error) throw new Error(error.message);
      refresh();
      setMessage({ type: "success", text: "Deleted" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  // Move item to a different category
  const handleMove = async (id: string, newCategory: string) => {
    try {
      const { error } = await adminStageProductions.update(id, { category: newCategory });
      if (error) throw new Error(error.message);
      setMovingId(null);
      refresh();
      setMessage({ type: "success", text: "Moved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to move" });
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "upcoming": return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">Upcoming</span>;
      case "past": return <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Past</span>;
      default: return <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-600">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage performances ({(allProductions || []).length} total)
          </p>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-sm">
              Featured: <span className={`font-semibold ${featuredIds.size > 0 ? "text-yellow-600" : "text-gray-400"}`}>
                {featuredIds.size}/9
              </span>
            </span>
            {loading && <span className="text-xs text-gray-400">Loading...</span>}
          </div>
        </div>
        <button
          onClick={handleNew}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + New Performance
        </button>
      </div>

      {/* Ticketmaster Sync Panel */}
      <TMSyncPanel />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {PERFORMANCE_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label} ({getCategoryCount(cat.value)})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="draft">Drafts</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">City</label>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm w-48"
          >
            <option value="">All cities</option>
            {GLOBAL_CITY_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </optgroup>
            ))}
            <optgroup label="Other">
              <option value="__custom__">Other (type below)...</option>
            </optgroup>
          </select>
          {filterCity === "__custom__" && (
            <input
              type="text"
              value={filterCityCustom}
              onChange={(e) => {
                setFilterCityCustom(e.target.value);
                setFilterCity(e.target.value);
              }}
              onBlur={() => {
                if (filterCityCustom.trim()) setFilterCity(filterCityCustom.trim());
              }}
              placeholder="Type city name..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
              autoFocus
            />
          )}
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
          <h2 className="mb-4 text-lg font-semibold">
            {editingId ? "Edit" : "New"} Performance
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  {PERFORMANCE_CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <input
                  list="city-suggestions"
                  type="text"
                  value={itemCity}
                  onChange={(e) => setItemCity(e.target.value)}
                  placeholder="e.g. New York"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Event Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Event Time</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ticket URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.ticketmaster.com/..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Cover Image</label>
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm"
                >
                  Choose Cover Image
                </button>
                {coverPreview && (
                  <div className="mt-2 flex items-center gap-4">
                    <img src={coverPreview} alt="Preview" className="h-20 w-32 rounded-md object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverImage(""); setCoverPreview(null); }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Summary (for list display)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Content</label>
                <RichTextEditor content={content} onChange={setContent} />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900">
              {PERFORMANCE_CATEGORY_OPTIONS.find(c => c.value === filterCategory)?.label || filterCategory}
            </span>
            <span className="text-sm text-gray-500">({filteredItems.length})</span>
          </div>
          <span className="text-xs text-gray-400">
            {filteredItems.filter(i => i.status === "upcoming").length} upcoming,{" "}
            {filteredItems.filter(i => i.status === "past").length} past
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No performances in this category
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.cover_image && (
                      <img
                        src={item.cover_image}
                        alt=""
                        className="h-10 w-16 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">{item.title}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      {item.event_date && (
                        <span className="text-xs text-gray-400">{formatDate(item.event_date)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {movingId === item.id ? (
                      <>
                        <select
                          value={item.category}
                          onChange={(e) => { /* preview update */ }}
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                        >
                          {PERFORMANCE_CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                        <select
                          id={`move-cat-${item.id}`}
                          defaultValue={item.category}
                          className="rounded border border-purple-300 bg-white px-2 py-1 text-xs focus:border-purple-500 focus:outline-none"
                        >
                          {PERFORMANCE_CATEGORY_OPTIONS
                            .filter((c) => c.value !== item.category)
                            .map((cat) => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                        <button
                          onClick={() => {
                            const sel = document.getElementById(`move-cat-${item.id}`) as HTMLSelectElement;
                            if (sel) handleMove(item.id, sel.value);
                          }}
                          className="px-3 py-1 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setMovingId(null)}
                          className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleFeatured(item.id)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            featuredIds.has(item.id)
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              : "text-gray-400 hover:text-yellow-600 hover:bg-gray-100"
                          }`}
                          title={featuredIds.has(item.id) ? "Remove from Featured" : "Add to Featured"}
                        >
                          {featuredIds.has(item.id) ? "★" : "☆"}
                        </button>
                        <button
                          onClick={() => setMovingId(item.id)}
                          className="px-3 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded"
                          title="Move to different category"
                        >
                          Move
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {movingId === item.id && (
                  <p className="mt-1 text-xs text-gray-400 pl-[calc(4rem+1rem)]">
                    Current: <strong>{PERFORMANCE_CATEGORY_OPTIONS.find(c => c.value === item.category)?.label ?? item.category}</strong>
                    {" "}— select a target category above to relocate this item.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
