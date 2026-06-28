"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  { value: "opera", label: "Opera" },
  { value: "musical", label: "Musical" },
  { value: "classical", label: "Classical" },
  { value: "concert", label: "Concert" },
  { value: "electronic", label: "Electronic" },
  { value: "pop", label: "Pop" },
  { value: "rock", label: "Rock" },
  { value: "hip-hop-rap", label: "Hip-Hop/Rap" },
  { value: "country", label: "Country" },
  { value: "latin", label: "Latin" },
  { value: "dance", label: "Dance" },
  { value: "other", label: "Other" },
];

// Columns confirmed from actual Supabase schema
interface EventRow {
  id: number;
  ticketmaster_id: string;
  title: string;
  event_date: string | null;
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
  segment: string | null;
  genre: string | null;
  created_at: string;
  updated_at: string;
}

type RegionFilter = "all" | "US" | "international";

function fmt(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function categoryToTable(slug: string): string {
  return `${slug.replace(/-/g, "_")}_events`;
}

function fmtPrice(e: EventRow): string {
  if (!e.price_min && !e.price_max) return "Free";
  const min = e.price_min ?? "?";
  const max = e.price_max;
  if (max) return `${e.currency} ${min}–${max}`;
  return `${e.currency} ${min}+`;
}

// ── Modal Form ────────────────────────────────────────────────────────────────

type FormState = {
  title: string;
  event_date: string;
  image_url: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  region: "US" | "international";
  price_min: string;
  price_max: string;
  currency: string;
  ticket_url: string;
  segment: string;
  genre: string;
};

function blank(): FormState {
  return {
    title: "",
    event_date: "",
    image_url: "",
    venue: "",
    city: "",
    state: "",
    country: "US",
    region: "US",
    price_min: "",
    price_max: "",
    currency: "USD",
    ticket_url: "",
    segment: "",
    genre: "",
  };
}

function rowToForm(row: EventRow): FormState {
  return {
    title: row.title || "",
    event_date: row.event_date ? row.event_date.split("T")[0] : "",
    image_url: row.image_url || "",
    venue: row.venue || "",
    city: row.city || "",
    state: row.state || "",
    country: row.country || "US",
    region: (row.region as "US" | "international") || "US",
    price_min: row.price_min?.toString() ?? "",
    price_max: row.price_max?.toString() ?? "",
    currency: row.currency || "USD",
    ticket_url: row.ticket_url || "",
    segment: row.segment || "",
    genre: row.genre || "",
  };
}

type ModalState = { mode: "edit"; row: EventRow } | { mode: "add" };

function FormModal({
  modal,
  cat,
  onClose,
  onSaved,
}: {
  modal: ModalState | null;
  cat: string;
  onClose: () => void;
  onSaved: (row: EventRow) => void;
}) {
  const [form, setForm] = useState<FormState>(blank());
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!modal) return;
    setForm(modal.mode === "edit" ? rowToForm(modal.row) : blank());
    setErr(null);
  }, [modal]);

  if (!modal) return null;

  const catLabel = CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  const handleSave = async () => {
    if (!form.title.trim()) { setErr("Title is required"); return; }
    if (!form.event_date) { setErr("Event date is required"); return; }
    setErr(null);
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        event_date: form.event_date,
        image_url: form.image_url || null,
        venue: form.venue || null,
        city: form.city || null,
        state: form.state || null,
        country: form.country,
        region: form.region,
        price_min: form.price_min ? Number(form.price_min) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
        currency: form.currency,
        ticket_url: form.ticket_url || null,
        segment: form.segment || null,
        genre: form.genre || null,
      };

      if (modal.mode === "edit") {
        const { error } = await supabase
          .from(categoryToTable(cat))
          .update(payload)
          .eq("ticketmaster_id", modal.row.ticketmaster_id);
        if (error) throw error;
        onSaved({ ...modal.row, ...payload });
      } else {
        const id = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const { data, error } = await supabase
          .from(categoryToTable(cat))
          .insert({ ...payload, ticketmaster_id: id })
          .select()
          .single();
        if (error) throw error;
        onSaved(data as EventRow);
      }
      onClose();
    } catch (e: unknown) {
      setErr(`Save failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    required = false,
    extra?: React.ReactNode
  ) => (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {extra || (
        <input
          type="text"
          value={form[label.toLowerCase().replace(/ /g, "_").replace(/[^a-z_]/g, "") as keyof FormState] as string}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              [label.toLowerCase().replace(/ /g, "_").replace(/[^a-z_]/g, "") as keyof FormState]: e.target.value,
            }))
          }
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-hmc-orange focus:outline-none focus:ring-1 focus:ring-hmc-orange/30 transition-colors"
        />
      )}
    </div>
  );

  // Simpler field approach
  const FI = ({
    name,
    label,
    required,
    type = "text",
    placeholder,
    colSpan,
  }: {
    name: keyof FormState;
    label: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    colSpan?: boolean;
  }) => (
    <div className={colSpan ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-hmc-orange focus:outline-none focus:ring-1 focus:ring-hmc-orange/30 transition-colors"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {modal.mode === "edit" ? `Edit — ${modal.row.title}` : `Add to ${catLabel}`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {modal.mode === "edit"
                ? `Editing in ${catLabel} table`
                : `Creates a new entry in ${catLabel} table`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {err && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {err}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <FI name="title" label="Title" required colSpan />
            <FI name="event_date" label="Event Date" required type="date" />
            <FI name="segment" label="Segment" placeholder="e.g. Opera" />
            <FI name="genre" label="Genre" placeholder="e.g. Classical Opera" />
            <FI name="venue" label="Venue" placeholder="Venue name" colSpan />
            <FI name="city" label="City" placeholder="City" />
            <FI name="state" label="State / Province" placeholder="State" />
            <FI name="country" label="Country" placeholder="US" />
            <FI name="price_min" label="Price Min" type="number" placeholder="0" />
            <FI name="price_max" label="Price Max" type="number" placeholder="999" />
            <FI name="currency" label="Currency" placeholder="USD" />
            <FI name="ticket_url" label="Ticket URL" type="url" placeholder="https://ticketmaster.com/..." colSpan />
            <FI name="image_url" label="Image URL" type="url" placeholder="https://..." colSpan />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <span className="text-xs text-gray-400">* Required fields</span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-hmc-orange px-5 py-2 text-sm font-semibold text-white hover:bg-hmc-red transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : modal.mode === "edit" ? "Save Changes" : "Add Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const [cat, setCat] = useState("opera");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tableMissing, setTableMissing] = useState(false);

  const [modal, setModal] = useState<ModalState | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setTableMissing(false);
    try {
      const table = categoryToTable(cat);
      const offset = (page - 1) * pageSize;

      let q = supabase.from(table).select("*", { count: "exact" });

      if (region !== "all") q = q.eq("region", region);
      if (search.trim()) {
        q = q.or(
          `title.ilike.%${search}%,venue.ilike.%${search}%,city.ilike.%${search}%`
        );
      }

      const { data, error, count } = await q
        .order("event_date", { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) {
        if (error.code === "42P01") {
          setTableMissing(true);
          setRows([]);
          setTotal(0);
        } else {
          throw error;
        }
        return;
      }

      setRows((data as EventRow[]) || []);
      setTotal(count || 0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Load failed";
      setErr(msg);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [cat, region, search, page, pageSize]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  useEffect(() => {
    async function loadCounts() {
      const result: Record<string, number> = {};
      for (const c of CATEGORIES) {
        try {
          const { count, error } = await supabase
            .from(categoryToTable(c.value))
            .select("*", { count: "exact", head: true });
          if (error && error.code === "42P01") {
            result[c.value] = -1;
          } else {
            result[c.value] = count || 0;
          }
        } catch {
          result[c.value] = -1;
        }
      }
      setCounts(result);
    }
    loadCounts();
  }, []);

  useEffect(() => { setPage(1); }, [cat, region, search]);const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (row: EventRow) => {
    if (deletingId !== row.ticketmaster_id) {
      setDeletingId(row.ticketmaster_id);
      return;
    }
    try {
      const { error } = await supabase
        .from(categoryToTable(cat))
        .delete()
        .eq("ticketmaster_id", row.ticketmaster_id);
      if (error) throw error;
      setRows((prev) =>
        prev.filter((r) => r.ticketmaster_id !== row.ticketmaster_id)
      );
      setTotal((p) => Math.max(0, p - 1));
      setDeletingId(null);
    } catch (e: unknown) {
      alert(`Delete failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  const handleSaved = (updated: EventRow) => {
    setRows((prev) =>
      prev.map((r) =>
        r.ticketmaster_id === updated.ticketmaster_id ? updated : r
      )
    );
    fetchEvents();
  };

  const catLabel = CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage performance events — {catLabel}
            {!tableMissing && (
              <span className="ml-2 inline-flex items-center rounded-full bg-hmc-orange/10 px-2.5 py-0.5 text-xs font-semibold text-hmc-orange">
                {total.toLocaleString()} events
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2"><button
            onClick={() => setModal({ mode: "add" })}
            disabled={tableMissing}
            className="inline-flex items-center gap-2 rounded-lg bg-hmc-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-hmc-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((c) => {
          const missing = counts[c.value] === -1;
          const isActive = cat === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setCat(c.value)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-hmc-primary text-white shadow-sm"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{c.label}</span>
              {counts[c.value] >= 0 ? (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {(counts[c.value] || 0).toLocaleString()}
                </span>
              ) : (
                <span className="text-xs rounded-full px-1.5 py-0.5 bg-gray-100 text-gray-300">—</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table missing warning */}
      {tableMissing && (
        <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <svg className="w-5 h-5 flex-shrink-0 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            Table <strong>{cat}_events</strong> does not exist.{" "}
Run Sync first to create it and pull data from Ticketmaster.
          </div>
        </div>
      )}

      {/* Filters */}
      {!tableMissing && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, venue, city..."
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm focus:border-hmc-orange focus:outline-none focus:ring-1 focus:ring-hmc-orange/30 transition-colors"
            />
          </div>

          {/* Region Filter */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionFilter)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-hmc-orange focus:outline-none focus:ring-1 focus:ring-hmc-orange/30 transition-colors"
          >
            <option value="all">All Regions</option>
            <option value="US">United States</option>
            <option value="international">International</option>
          </select>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Pagination */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {total === 0 ? "No results" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
            </span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[4rem] text-center">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
      )}

      {/* Card Grid */}
      {!tableMissing && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-0 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No events found</p>
            <p className="text-sm text-gray-400 mt-1">
              {search ? `No results for "${search}"` : `No events in ${catLabel} yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.map((row) => (
              <div
                key={row.ticketmaster_id}
                className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-md hover:border-gray-200 transition-all duration-200"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  {row.image_url ? (
                    <img
                      src={row.image_url}
                      alt={row.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Region badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
                      row.region === "US"
                        ? "bg-blue-500 text-white"
                        : "bg-purple-500 text-white"
                    }`}>
                      {row.region === "US" ? "US" : "INTL"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                      {row.title}
                    </h3>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-gray-700">{fmt(row.event_date)}</span>
                  </div>

                  {/* Venue & City */}
                  {(row.venue || row.city) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">
                        {row.venue && <span>{row.venue}</span>}
                        {row.venue && row.city && <span className="text-gray-400"> · </span>}
                        {row.city && <span>{row.city}{row.state ? `, ${row.state}` : ""}</span>}
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{fmtPrice(row)}</span>
                    {row.genre && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="truncate text-gray-400">{row.genre}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    {row.ticket_url && (
                      <a
                        href={row.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ticket
                      </a>
                    )}
                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        onClick={() => setModal({ mode: "edit", row })}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                          deletingId === row.ticketmaster_id
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "border border-gray-200 text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingId === row.ticketmaster_id ? "Confirm" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Form Modal */}
      <FormModal
        modal={modal}
        cat={cat}
        onClose={() => setModal(null)}
        onSaved={handleSaved}
      />
    </div>
  );
}
