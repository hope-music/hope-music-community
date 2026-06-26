"use client";

import { useState, useRef, useEffect } from "react";
import { PERFORMANCE_CATEGORY_OPTIONS, GLOBAL_CITY_GROUPS } from "@/lib/constants";
import { useQuery, useMutation, api } from "@/lib/convex";

// ── Helpers ────────────────────────────────────────────────────────────────────
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

// ── Main Component ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export default function StageProductionsPage() {
  const adminEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "";
  const convexList = useQuery(api.admin.listStageProductions, { callerEmail: adminEmail }) as any[] | undefined;
  const loading = convexList === undefined;
  const productions = convexList ?? [];
  const totalCount = productions.length;

  const [filters, setFilters] = useState({ category: "all", status: "all", city: "", page: 1 });
  const updateFilter = (key: string, value: any) => {
    setFilters((p) => ({ ...p, [key]: value, page: key === "page" ? (typeof value === "number" ? value : 1) : 1 }));
  };

  const [filterCityCustom, setFilterCityCustom] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("musical");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [itemCity, setItemCity] = useState("");
  const [venueName, setVenueName] = useState("");
  const [countryScope, setCountryScope] = useState<"United States" | "International">("United States");
  const [url, setUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const createProduction = useMutation(api.admin.createStageProduction);
  const updateProduction = useMutation(api.admin.updateStageProduction);
  const deleteProduction = useMutation(api.admin.deleteStageProduction);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Clear message after 5s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    setCategory(filters.category || "musical");
    setEventDate("");
    setEventTime("");
    setItemCity("");
    setVenueName("");
    setCountryScope("United States");
    setUrl("");
    setCoverImage("");
    setCoverPreview(null);
    setShowForm(true);
  };

  // Load item data into form for editing
  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setCategory(item.category || filters.category);
    const dateVal = formatDateForInput(item.eventDate);
    setEventDate(dateVal);
    setEventTime(dateVal && item.eventTime ? item.eventTime.slice(0, 5) : "");
    setItemCity(item.city || "");
    setVenueName("");
    setUrl(item.url || "");
    setCoverImage(item.coverImage || "");
    setCoverPreview(item.coverImage || null);
    setShowForm(true);
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
      : null;

    try {
      if (editingId) {
        await updateProduction({
          callerEmail: adminEmail,
          id: editingId,
          title: title.trim(),
          description,
          coverImage: coverImage || undefined,
          url: url || undefined,
          category,
          eventDate: eventDateMs,
          eventTime: eventTime || undefined,
        });
        setMessage({ type: "success", text: "Updated successfully!" });
      } else {
        await createProduction({
          callerEmail: adminEmail,
          title: title.trim(),
          description,
          coverImage: coverImage || undefined,
          url: url || undefined,
          category,
          eventDate: eventDateMs,
          eventTime: eventTime || undefined,
        });
        setMessage({ type: "success", text: "Created successfully!" });
      }
      setShowForm(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save" });
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteProduction({ id, callerEmail: adminEmail });
      setMessage({ type: "success", text: "Deleted" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to delete" });
    }
  };

  // Move item to a different category
  const handleMove = async (id: string, newCategory: string) => {
    try {
      await updateProduction({ id, category: newCategory, callerEmail: adminEmail });
      setMovingId(null);
      setMessage({ type: "success", text: "Moved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to move" });
    }
  };

  const getStatusBadge = (s: string) => {
    return null;
  };

  const filteredProductions = productions.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage performances ({totalCount} total)
          </p>
          {loading && <span className="mt-2 block text-xs text-gray-400">Loading...</span>}
        </div>
        <button
          onClick={handleNew}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + New Performance
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Category</label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            {PERFORMANCE_CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">City</label>
          <select
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
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
          {filters.city === "__custom__" && (
            <input
              type="text"
              value={filterCityCustom}
              onChange={(e) => {
                setFilterCityCustom(e.target.value);
                updateFilter("city", e.target.value);
              }}
              onBlur={() => {
                if (filterCityCustom.trim()) updateFilter("city", filterCityCustom.trim());
              }}
              placeholder="Type city name..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
              autoFocus
            />
          )}
        </div>
        {/* Pagination */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Page {filters.page} / {Math.max(1, Math.ceil(filteredProductions.length / PAGE_SIZE))}
          </span>
          <button
            onClick={() => updateFilter("page", filters.page - 1)}
            disabled={filters.page <= 1}
            className="px-3 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <button
            onClick={() => updateFilter("page", filters.page + 1)}
            disabled={filters.page >= Math.ceil(filteredProductions.length / PAGE_SIZE)}
            className="px-3 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Venue</label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Lincoln Center"
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Summary</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
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
              {PERFORMANCE_CATEGORY_OPTIONS.find(c => c.value === filters.category)?.label || filters.category}
            </span>
            <span className="text-sm text-gray-500">({totalCount})</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">Loading...</div>
          ) : filteredProductions.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No performances in this category
            </div>
          ) : (
            filteredProductions.map((item) => (
              <div key={item._id} className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.coverImage && (
                      <img
                        src={item.coverImage}
                        alt=""
                        className="h-10 w-16 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">{item.title}</span>
                      </div>
                      {item.eventDate && (
                        <span className="text-xs text-gray-400">{formatDate(item.eventDate)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {movingId === item._id ? (
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
                          id={`move-cat-${item._id}`}
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
                            const sel = document.getElementById(`move-cat-${item._id}`) as HTMLSelectElement;
                            if (sel) handleMove(item._id, sel.value);
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
                          onClick={() => setMovingId(item._id)}
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
                          onClick={() => handleDelete(item._id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {movingId === item._id && (
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
