"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

const CATEGORIES = [
  { value: "musical", label: "Musical", icon: "🎬" },
  { value: "opera", label: "Opera", icon: "🎭" },
  { value: "classical", label: "Classical", icon: "🎻" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "dance", label: "Dance", icon: "💃" },
  { value: "electronic", label: "Electronic", icon: "🎛️" },
  { value: "pop-rock", label: "Pop & Rock", icon: "🎸" },
  { value: "performance-art", label: "Performance Art", icon: "🎪" },
  { value: "other", label: "Other", icon: "🌟" },
];

const PAGE_SIZES = [20, 50, 100, 200];

interface EventItem {
  id: string;
  ticketmaster_id: string;
  title: string;
  description?: string | null;
  event_date: string | null;
  event_time: string | null;
  image_url: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  country: string;
  region: string;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  ticket_url: string | null;
  category: string;
  source?: string;
}

interface EditFormData {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  region: string;
  price_min: string;
  price_max: string;
  currency: string;
  ticket_url: string;
  image_url: string;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
}

function getSupabaseClient(serviceRole = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = serviceRole
    ? (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!
    : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const { createClient } = require("@supabase/supabase-js");
  return createClient(supabaseUrl, supabaseKey);
}

export default function StageProductionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("musical");
  const [selectedRegion, setSelectedRegion] = useState<"US" | "international" | "all">("all");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Edit modal
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    venue: "",
    city: "",
    state: "",
    country: "US",
    region: "US",
    price_min: "",
    price_max: "",
    currency: "USD",
    ticket_url: "",
    image_url: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  // Move modal
  const [movingEvents, setMovingEvents] = useState<EventItem[]>([]);
  const [moveTargetCategory, setMoveTargetCategory] = useState("");
  const [moveLoading, setMoveLoading] = useState(false);

  // Add manual event modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<EditFormData>({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    venue: "",
    city: "",
    state: "",
    country: "US",
    region: "US",
    price_min: "",
    price_max: "",
    currency: "USD",
    ticket_url: "",
    image_url: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  const currentCatInfo = CATEGORIES.find((c) => c.value === selectedCategory);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const tableName = `${selectedCategory}_events`;
      const from = (currentPage - 1) * pageSize;

      let query = supabase.from(tableName).select("*", { count: "exact" });

      if (selectedRegion !== "all") {
        query = query.eq("region", selectedRegion);
      }

      query = query.order("event_date", { ascending: true }).range(from, from + pageSize - 1);

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) throw supabaseError;
      setEvents(data || []);
      setTotalCount(count || 0);
      setSelectedIds(new Set());
      setSelectAll(false);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setError(err.message || "Failed to load events");
      setEvents([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedRegion, currentPage, pageSize]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const getCategoryCounts = async () => {
    const supabase = getSupabaseClient();
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      const tableName = `${cat.value}_events`;
      const { count } = await supabase.from(tableName).select("*", { count: "exact", head: true });
      counts[cat.value] = count || 0;
    }
    return counts;
  };

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getCategoryCounts().then(setCategoryCounts);
  }, []);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedIds(new Set(events.map((e) => e.ticketmaster_id)));
    } else if (selectedIds.size === events.length && events.length > 0) {
      // Keep as is
    } else if (!selectAll && selectedIds.size === events.length) {
      setSelectedIds(new Set());
    }
  }, [selectAll, events]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      setSelectAll(false);
    } else {
      setSelectedIds(new Set(events.map((e) => e.ticketmaster_id)));
      setSelectAll(true);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (deleteConfirm !== event.ticketmaster_id) {
      setDeleteConfirm(event.ticketmaster_id);
      return;
    }

    try {
      const supabase = getSupabaseClient(true);
      const tableName = `${selectedCategory}_events`;
      const { error: deleteError } = await supabase.from(tableName).delete().eq("ticketmaster_id", event.ticketmaster_id);
      if (deleteError) throw deleteError;

      setEvents((prev) => prev.filter((e) => e.ticketmaster_id !== event.ticketmaster_id));
      setTotalCount((p) => Math.max(0, p - 1));
      setDeleteConfirm(null);
      setCategoryCounts((prev) => ({
        ...prev,
        [selectedCategory]: Math.max(0, (prev[selectedCategory] || 1) - 1),
      }));
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      event_date: event.event_date ? event.event_date.split("T")[0] : "",
      event_time: event.event_time || "",
      venue: event.venue || "",
      city: event.city || "",
      state: event.state || "",
      country: event.country || "US",
      region: event.region || "US",
      price_min: event.price_min?.toString() || "",
      price_max: event.price_max?.toString() || "",
      currency: event.currency || "USD",
      ticket_url: event.ticket_url || "",
      image_url: event.image_url || "",
    });
  };

  const handleEditSave = async () => {
    if (!editingEvent) return;
    setEditLoading(true);
    try {
      const supabase = getSupabaseClient(true);
      const tableName = `${selectedCategory}_events`;

      const updateData: Record<string, any> = {
        title: editForm.title,
        description: editForm.description || null,
        event_date: editForm.event_date || null,
        event_time: editForm.event_time || null,
        venue: editForm.venue || null,
        city: editForm.city || null,
        state: editForm.state || null,
        country: editForm.country,
        region: editForm.region,
        price_min: editForm.price_min ? parseFloat(editForm.price_min) : null,
        price_max: editForm.price_max ? parseFloat(editForm.price_max) : null,
        currency: editForm.currency,
        ticket_url: editForm.ticket_url || null,
        image_url: editForm.image_url || null,
      };

      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq("ticketmaster_id", editingEvent.ticketmaster_id);

      if (updateError) throw updateError;

      setEvents((prev) =>
        prev.map((e) =>
          e.ticketmaster_id === editingEvent.ticketmaster_id ? { ...e, ...updateData } : e
        )
      );
      setEditingEvent(null);
    } catch (err: any) {
      alert(`Failed to update: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleMove = async () => {
    if (!moveTargetCategory || movingEvents.length === 0) return;
    setMoveLoading(true);
    try {
      const supabase = getSupabaseClient(true);
      const sourceTable = `${selectedCategory}_events`;
      const targetTable = `${moveTargetCategory}_events`;

      for (const event of movingEvents) {
        const { error: deleteError } = await supabase.from(sourceTable).delete().eq("ticketmaster_id", event.ticketmaster_id);
        if (deleteError) throw deleteError;

        const insertData = {
          ...event,
          id: undefined,
          category: moveTargetCategory,
        };
        delete (insertData as any).id;

        const { error: insertError } = await supabase.from(targetTable).insert(insertData);
        if (insertError) throw insertError;
      }

      setEvents((prev) => prev.filter((e) => !movingEvents.some((m) => m.ticketmaster_id === e.ticketmaster_id)));
      setTotalCount((p) => Math.max(0, p - movingEvents.length));

      // Update counts
      const counts = await getCategoryCounts();
      setCategoryCounts(counts);

      setMovingEvents([]);
      setMoveTargetCategory("");
    } catch (err: any) {
      alert(`Failed to move events: ${err.message}`);
    } finally {
      setMoveLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected events?`)) return;

    try {
      const supabase = getSupabaseClient(true);
      const tableName = `${selectedCategory}_events`;

      for (const id of selectedIds) {
        const { error } = await supabase.from(tableName).delete().eq("ticketmaster_id", id);
        if (error) throw error;
      }

      setEvents((prev) => prev.filter((e) => !selectedIds.has(e.ticketmaster_id)));
      setTotalCount((p) => Math.max(0, p - selectedIds.size));
      setSelectedIds(new Set());
      setSelectAll(false);

      const counts = await getCategoryCounts();
      setCategoryCounts(counts);
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleAddEvent = async () => {
    if (!addForm.title.trim()) {
      alert("Title is required");
      return;
    }
    if (!addForm.event_date) {
      alert("Event date is required");
      return;
    }
    setAddLoading(true);
    try {
      const supabase = getSupabaseClient(true);
      const tableName = `${selectedCategory}_events`;

      const insertData = {
        ticketmaster_id: `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        title: addForm.title,
        description: addForm.description || null,
        event_date: addForm.event_date,
        event_time: addForm.event_time || null,
        venue: addForm.venue || null,
        city: addForm.city || null,
        state: addForm.state || null,
        country: addForm.country,
        region: addForm.region,
        price_min: addForm.price_min ? parseFloat(addForm.price_min) : null,
        price_max: addForm.price_max ? parseFloat(addForm.price_max) : null,
        currency: addForm.currency,
        ticket_url: addForm.ticket_url || null,
        image_url: addForm.image_url || null,
        category: selectedCategory,
        source: "manual",
      };

      const { error: insertError } = await supabase.from(tableName).insert(insertData);
      if (insertError) throw insertError;

      setShowAddModal(false);
      setAddForm({
        title: "", description: "", event_date: "", event_time: "", venue: "",
        city: "", state: "", country: "US", region: "US", price_min: "", price_max: "",
        currency: "USD", ticket_url: "", image_url: "",
      });
      fetchEvents();
      const counts = await getCategoryCounts();
      setCategoryCounts(counts);
    } catch (err: any) {
      alert(`Failed to add event: ${err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage {currentCatInfo?.label || selectedCategory} events from Supabase
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {totalCount.toLocaleString()} events
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + Add Manual Event
        </button>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {categoryCounts[cat.value] !== undefined && (
                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {categoryCounts[cat.value].toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value as any);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="all">All Regions</option>
            <option value="US">United States</option>
            <option value="international">International</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-xs text-gray-500">Search</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, city, venue..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-500">Page Size</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} per page</option>
            ))}
          </select>
        </div>

        {/* Batch Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
            <button
              onClick={() => {
                setMovingEvents(events.filter((e) => selectedIds.has(e.ticketmaster_id)));
              }}
              className="rounded-md bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Move Selected
            </button>
            <button
              onClick={handleBatchDelete}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="px-3 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1 text-xs rounded border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Events Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium w-10">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 font-medium w-16">Image</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Venue</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Region</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr
                    key={event.ticketmaster_id}
                    className={`hover:bg-gray-50 ${selectedIds.has(event.ticketmaster_id) ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(event.ticketmaster_id)}
                        onChange={() => toggleSelect(event.ticketmaster_id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-2">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt=""
                          className="h-10 w-16 rounded object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-16 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                          {event.source === "manual" ? "✋" : "—"}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900 max-w-[200px] truncate">
                        {event.title}
                        {event.source === "manual" && (
                          <span className="ml-1 text-xs text-green-600">✋</span>
                        )}
                      </div>
                      {event.ticket_url && (
                        <a
                          href={event.ticket_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Ticket →
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                      {formatDate(event.event_date)}
                      {event.event_time && (
                        <span className="text-xs text-gray-400 ml-1">{event.event_time.slice(0, 5)}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-600 max-w-[150px] truncate">
                      {event.venue || "—"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {event.city || "—"}
                      {event.state && <span className="text-xs text-gray-400 ml-1">{event.state}</span>}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                          event.region === "US"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {event.region}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {event.price_min || event.price_max ? (
                        <span className="text-xs">
                          {event.currency} {event.price_min || "?"}
                          {event.price_max && event.price_min && event.price_max !== event.price_min
                            ? ` - ${event.price_max}`
                            : ""}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(event)}
                          className="px-3 py-1 text-xs font-medium rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event)}
                          className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                            deleteConfirm === event.ticketmaster_id
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {deleteConfirm === event.ticketmaster_id ? "Confirm" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Event</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  value={editForm.event_date}
                  onChange={(e) => setEditForm((p) => ({ ...p, event_date: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                <input
                  type="time"
                  value={editForm.event_time}
                  onChange={(e) => setEditForm((p) => ({ ...p, event_time: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={editForm.venue}
                  onChange={(e) => setEditForm((p) => ({ ...p, venue: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={editForm.state}
                  onChange={(e) => setEditForm((p) => ({ ...p, state: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={editForm.country}
                  onChange={(e) => setEditForm((p) => ({ ...p, country: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={editForm.region}
                  onChange={(e) => setEditForm((p) => ({ ...p, region: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="US">United States</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Min</label>
                <input
                  type="number"
                  value={editForm.price_min}
                  onChange={(e) => setEditForm((p) => ({ ...p, price_min: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Max</label>
                <input
                  type="number"
                  value={editForm.price_max}
                  onChange={(e) => setEditForm((p) => ({ ...p, price_max: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={editForm.currency}
                  onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket URL</label>
                <input
                  type="url"
                  value={editForm.ticket_url}
                  onChange={(e) => setEditForm((p) => ({ ...p, ticket_url: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={editForm.image_url}
                  onChange={(e) => setEditForm((p) => ({ ...p, image_url: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingEvent(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={editLoading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {movingEvents.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Move {movingEvents.length} Event{movingEvents.length > 1 ? "s" : ""}</h2>
            <p className="text-sm text-gray-600 mb-4">
              Move selected events from <strong>{currentCatInfo?.label}</strong> to:
            </p>
            <div className="space-y-2 mb-6">
              {CATEGORIES.filter((c) => c.value !== selectedCategory).map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setMoveTargetCategory(cat.value)}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                    moveTargetCategory === cat.value
                      ? "bg-blue-100 text-blue-700 border-2 border-blue-500"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setMovingEvents([]);
                  setMoveTargetCategory("");
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMove}
                disabled={!moveTargetCategory || moveLoading}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {moveLoading ? "Moving..." : "Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add Manual Event to {currentCatInfo?.label}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Event name"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Event description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                <input
                  type="date"
                  value={addForm.event_date}
                  onChange={(e) => setAddForm((p) => ({ ...p, event_date: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                <input
                  type="time"
                  value={addForm.event_time}
                  onChange={(e) => setAddForm((p) => ({ ...p, event_time: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={addForm.venue}
                  onChange={(e) => setAddForm((p) => ({ ...p, venue: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Venue name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={addForm.city}
                  onChange={(e) => setAddForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={addForm.state}
                  onChange={(e) => setAddForm((p) => ({ ...p, state: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="State/Province"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={addForm.country}
                  onChange={(e) => setAddForm((p) => ({ ...p, country: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="US"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={addForm.region}
                  onChange={(e) => setAddForm((p) => ({ ...p, region: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="US">United States</option>
                  <option value="international">International</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Min</label>
                <input
                  type="number"
                  value={addForm.price_min}
                  onChange={(e) => setAddForm((p) => ({ ...p, price_min: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Max</label>
                <input
                  type="number"
                  value={addForm.price_max}
                  onChange={(e) => setAddForm((p) => ({ ...p, price_max: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={addForm.currency}
                  onChange={(e) => setAddForm((p) => ({ ...p, currency: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="USD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ticket URL</label>
                <input
                  type="url"
                  value={addForm.ticket_url}
                  onChange={(e) => setAddForm((p) => ({ ...p, ticket_url: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={addForm.image_url}
                  onChange={(e) => setAddForm((p) => ({ ...p, image_url: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={addLoading}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {addLoading ? "Adding..." : "Add Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This page displays events from Supabase database.
          Use the{" "}
          <a href="/admin/sync" className="text-blue-600 hover:underline">
            Sync Events
          </a>{" "}
          page to fetch new events from Ticketmaster. Manual events are marked with ✋.
        </p>
      </div>
    </div>
  );
}
