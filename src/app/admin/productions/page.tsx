"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PERFORMANCE_CATEGORY_OPTIONS } from "@/lib/constants";

const CATEGORIES = [
  { value: "opera", label: "Opera", icon: "🎭" },
  { value: "musical", label: "Musical", icon: "🎬" },
  { value: "classical", label: "Classical", icon: "🎻" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "dance", label: "Dance", icon: "💃" },
  { value: "electronic", label: "Electronic", icon: "🎛️" },
  { value: "pop-rock", label: "Pop & Rock", icon: "🎸" },
  { value: "performance-art", label: "Performance Art", icon: "🎪" },
  { value: "other", label: "Other", icon: "🌟" },
];

interface EventItem {
  id: string;
  ticketmaster_id: string;
  title: string;
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
}

const PAGE_SIZE = 50;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString();
}

export default function StageProductionsPage() {
  const [selectedCategory, setSelectedCategory] = useState("opera");
  const [selectedRegion, setSelectedRegion] = useState<"US" | "international" | "all">("all");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase configuration missing");
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const tableName = `${selectedCategory}_events`;
      let query = supabase.from(tableName).select("*");

      if (selectedRegion !== "all") {
        query = query.eq("region", selectedRegion);
      }

      query = query.order("event_date", { ascending: true });

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;
      setEvents(data || []);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Failed to fetch events:", err);
      setError(err.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedRegion]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.country?.toLowerCase().includes(q)
    );
  }, [events, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEvents.slice(start, start + PAGE_SIZE);
  }, [filteredEvents, currentPage]);

  const getCategoryCounts = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return {};

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
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

  const handleDelete = async (event: EventItem) => {
    if (deleteConfirm !== event.ticketmaster_id) {
      setDeleteConfirm(event.ticketmaster_id);
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase configuration missing");
      }

      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const tableName = `${selectedCategory}_events`;
      const { error: deleteError } = await supabase.from(tableName).delete().eq("ticketmaster_id", event.ticketmaster_id);

      if (deleteError) throw deleteError;

      setEvents((prev) => prev.filter((e) => e.ticketmaster_id !== event.ticketmaster_id));
      setDeleteConfirm(null);

      // Update count
      setCategoryCounts((prev) => ({
        ...prev,
        [selectedCategory]: Math.max(0, (prev[selectedCategory] || 1) - 1),
      }));
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const currentCatInfo = CATEGORIES.find((c) => c.value === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage {currentCatInfo?.label || selectedCategory} events from Supabase
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {filteredEvents.length.toLocaleString()} events
            </span>
          </p>
        </div>
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="mb-1 block text-xs text-gray-500">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as any)}
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
                <th className="px-4 py-3 font-medium w-16">Image</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Venue</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Country</th>
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
              ) : paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => (
                  <tr key={event.ticketmaster_id} className="hover:bg-gray-50">
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
                          No img
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-gray-900 max-w-[200px] truncate">
                        {event.title}
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
                    <td className="px-4 py-2 text-gray-600">{event.country}</td>
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
                      <button
                        onClick={() => handleDelete(event)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          deleteConfirm === event.ticketmaster_id
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {deleteConfirm === event.ticketmaster_id ? "Confirm Delete" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> This page displays events from Supabase database.
          Use the{" "}
          <a href="/admin/sync" className="text-blue-600 hover:underline">
            Sync Events
          </a>{" "}
          page to fetch new events from Ticketmaster.
        </p>
      </div>
    </div>
  );
}
