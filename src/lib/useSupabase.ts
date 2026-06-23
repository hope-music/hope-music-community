/**
 * useSupabase.ts
 *
 * Custom hooks for querying Supabase from client components.
 * These replace the JSON file fetches and Convex queries.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TMImage {
  url: string;
  width: number;
  height: number;
  ratio: string;
  fallback: boolean;
}

export interface TMEvent {
  id: string;         // composite: "${category}_${tm_id}"
  tm_id: string;
  name: string;
  url: string;
  locale: string;
  test: boolean;
  category: string;
  info: string;
  please_note: string;
  event_date: string;   // "YYYY-MM-DD"
  event_time: string;   // "HH:MM:SS"
  timezone: string;
  status_code: string;
  price_ranges: TMPriceRange[];
  images: TMImage[];
  classifications: TMClassification[];
  seatmap: { staticUrl: string };
  accessibility: { ticketLimit: number };
  sales: unknown;

  // Denormalised for convenience (populated from images/sales/etc.)
  _coverImage?: string;
  _venueName?: string;
  _venueCity?: string;
}

export interface TMPriceRange {
  type?: string;
  currency?: string;
  min?: number;
  max?: number;
}

export interface TMClassification {
  primary: boolean;
  segment?: { id: string; name: string };
  genre?: { id: string; name: string };
}

export interface StageProduction {
  id: string;
  title: string;
  description: string;
  content: string;
  cover_image: string;
  url: string;
  category: string;
  media_links: string[];
  status: "upcoming" | "past" | "draft";
  event_date: number | null;
  event_time: string;
  is_featured: boolean;
  created_at: number;
  updated_at: number | null;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch Ticketmaster events by category.
 * Replaces the `fetch('/data/ticketmaster/{Category}/data.json')` pattern.
 *
 * Returns events in the same shape the existing pages expect (with Ticketmaster's
 * nested `dates`, `_embedded`, `images` structure), PLUS denormalised convenience
 * fields: event_date, event_time, _coverImage, _venue*.
 */
/**
 * Fetch events for a static performance page.
 *
 * Lazy pagination: initial load = first page (100 rows). More pages can be
 * fetched on demand via fetchPage(n).
 *
 * upcomingOnly=true  →  only events on or after today (fast, small result set)
 * upcomingOnly=false →  all events sorted by date
 */
export function useSupabaseEvents(
  category: string,
  options?: { upcomingOnly?: boolean; pageSize?: number }
) {
  const { upcomingOnly = false, pageSize = 100 } = options ?? {};
  const [events, setEvents] = useState<SupabaseTMEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchedPagesRef = useRef<Map<number, SupabaseTMEvent[]>>(new Map());
  const pendingRef = useRef<Set<number>>(new Set());
  const totalCountRef = useRef(0);

  useEffect(() => {
    if (!category) {
      setEvents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetchedPagesRef.current.clear();
    pendingRef.current.clear();

    async function fetchPage(page: number): Promise<void> {
      if (pendingRef.current.has(page)) return;
      pendingRef.current.add(page);

      const start = (page - 1) * pageSize;
      const today = new Date().toISOString().slice(0, 10);

      let query = supabase
        .from("ticketmaster_events")
        .select("id, name, url, event_date, event_time, images, category", { count: "exact" })
        .eq("category", category)
        .order("event_date", { ascending: true })
        .range(start, start + pageSize - 1);

      if (upcomingOnly) {
        query = query.gte("event_date", today);
      }

      const { data, error: sbError } = await query;
      pendingRef.current.delete(page);

      if (cancelled) return;
      if (sbError) { setError(sbError.message); setLoading(false); return; }

      const parsed: SupabaseTMEvent[] = (data ?? []).map((row) => {
        let images: TMImage[] = [];
        try { images = JSON.parse(row.images as unknown as string ?? "[]"); } catch {}
        const _coverImage = images[0]?.url ?? "";
        return {
          ...row,
          event_date: row.event_date,
          event_time: row.event_time,
          _coverImage,
          _venueName: "",
          _venueCity: "",
          dates: {
            start: {
              localDate: row.event_date,
              localTime: row.event_time,
              dateTime: row.event_date
                ? `${row.event_date}T${row.event_time || "00:00:00"}Z`
                : undefined,
            },
            status: { code: row.status_code },
          },
          images,
          priceRanges: [],
        } as SupabaseTMEvent;
      });

      fetchedPagesRef.current.set(page, parsed);
      if (cancelled) return;

      const allEvents = Array.from(fetchedPagesRef.current.values()).flat();
      setEvents(allEvents);
      setLoading(false);
    }

    async function init() {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().slice(0, 10);
      let countQuery = supabase
        .from("ticketmaster_events")
        .select("*", { count: "exact", head: true })
        .eq("category", category);

      if (upcomingOnly) {
        countQuery = countQuery.gte("event_date", today);
      }

      const { count } = await countQuery;
      if (cancelled) return;
      totalCountRef.current = count ?? 0;

      await fetchPage(1);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [category, upcomingOnly]);

  return {
    events,
    loading,
    error,
    totalCount: totalCountRef.current,
  };
}

// Extended event type that adds denormalised fields to the classic Ticketmaster shape
export interface SupabaseTMEvent {
  id: string;
  name: string;
  url: string;
  locale?: string;
  test?: boolean;
  images: TMImage[];
  priceRanges?: TMPriceRange[];
  dates?: {
    start?: { localDate?: string; localTime?: string; dateTime?: string };
    status?: { code?: string };
  };
  _embedded?: {
    venues?: Array<{
      name?: string;
      city?: { name?: string };
      state?: { name?: string };
      country?: { name?: string };
    }>;
  };
  info?: string;

  // Denormalised fields (from DB, not from nested Ticketmaster shape)
  event_date: string;
  event_time: string;
  _coverImage: string;
  _venueName: string;
  _venueCity: string;
}

/**
 * Fetch featured stage productions for the homepage cards.
 * Replaces Convex useQuery(api.admin.getLatestStageProduction).
 */
export function useStageProductions(category?: string, limit = 1) {
  const [productions, setProductions] = useState<StageProduction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProductions() {
      setLoading(true);

      let query = supabase
        .from("stage_productions")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("event_date", { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (cancelled) return;

      if (!error && data) {
        const parsed: StageProduction[] = data.map((row) => ({
          ...row,
          event_date: row.event_date,
          media_links: Array.isArray(row.media_links) ? row.media_links : [],
        }));
        setProductions(parsed);
      }

      setLoading(false);
    }

    fetchProductions();

    return () => {
      cancelled = true;
    };
  }, [category, limit]);

  return { productions, loading };
}

/**
 * Adapter: returns stage productions in the shape the performance/[category] pages expect.
 * Converts snake_case Supabase fields → camelCase page fields.
 */
export interface PublicProduction {
  _id: string;
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  status: "upcoming" | "past" | "draft";
  eventDate?: number;
  city?: string;
  url?: string;
}

export function useStageProductionsPublic(category: string) {
  const [productions, setProductions] = useState<PublicProduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const fetchedPagesRef = useRef<Map<number, PublicProduction[]>>(new Map());
  const pendingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!category) {
      setProductions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      setLoading(true);
      fetchedPagesRef.current.clear();
      pendingRef.current.clear();

      const PAGE_SIZE = 100;

      const { count } = await supabase
        .from("stage_productions")
        .select("*", { count: "exact", head: true })
        .eq("category", category);

      if (cancelled) return;
      const total = count ?? 0;
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));

      // Fetch first page
      const { data, error } = await supabase
        .from("stage_productions")
        .select("id, title, category, description, cover_image, status, event_date, url")
        .eq("category", category)
        .order("event_date", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      if (!error && data) {
        const adapted: PublicProduction[] = data.map((row) => ({
          _id: row.id, id: row.id, title: row.title, category: row.category,
          description: row.description, coverImage: row.cover_image,
          status: row.status, eventDate: row.event_date ?? undefined,
          city: undefined, url: row.url,
        }));
        fetchedPagesRef.current.set(1, adapted);
        setProductions(adapted);
      }

      setLoading(false);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [category]);

  async function fetchPage(n: number) {
    if (n < 1 || fetchedPagesRef.current.has(n) || pendingRef.current.has(n)) return;
    pendingRef.current.add(n);
    const PAGE_SIZE = 100;
    const start = (n - 1) * PAGE_SIZE;

    const { data, error } = await supabase
      .from("stage_productions")
      .select("id, title, category, description, cover_image, status, event_date, url")
      .eq("category", category)
      .order("event_date", { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    pendingRef.current.delete(n);

    if (!error && data) {
      const adapted: PublicProduction[] = data.map((row) => ({
        _id: row.id, id: row.id, title: row.title, category: row.category,
        description: row.description, coverImage: row.cover_image,
        status: row.status, eventDate: row.event_date ?? undefined,
        city: undefined, url: row.url,
      }));
      fetchedPagesRef.current.set(n, adapted);
      const all = Array.from(fetchedPagesRef.current.values()).flat();
      setProductions(all);
    }
  }

  return { productions, loading, totalPages, fetchPage };
}

/**
 * Fetch a single stage production by its ID (for detail pages).
 */
export function useStageProductionDetail(id: string) {
  const [item, setItem] = useState<PublicProduction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchDetail() {
      setLoading(true);
      const { data, error } = await supabase
        .from("stage_productions")
        .select("*")
        .eq("id", id)
        .single();

      if (cancelled) return;

      if (!error && data) {
        setItem({
          _id: data.id,
          id: data.id,
          title: data.title,
          category: data.category,
          description: data.description,
          coverImage: data.cover_image,
          status: data.status,
          eventDate: data.event_date ?? undefined,
          city: undefined,
          url: data.url,
        });
      }

      setLoading(false);
    }

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { item, loading };
}

/**
 * Fetch ALL stage productions for the admin panel (no category filter).
 * Exposes a refresh() trigger so parent can call it after mutations.
 */
export function useStageProductionsForAdmin(_filterCategory?: string) {
  const [productions, setProductions] = useState<StageProduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAll() {
      setLoading(true);
      const { data, error } = await adminStageProductions.list();
      if (cancelled) return;
      if (!error && data) {
        setProductions(
          data.map((row) => ({
            ...row,
            event_date: row.event_date,
          }))
        );
      }
      setLoading(false);
    }

    fetchAll();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return { productions, loading, refresh };
}

/**
 * Count stage productions per category (for homepage counts).
 */
export function useStageProductionsCount() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCounts() {
      const BATCH = 1000;

      try {
        const { count } = await supabase
          .from("stage_productions")
          .select("*", { count: "exact", head: true });

        if (cancelled) return;
        const total = count ?? 0;
        const pageCount = Math.ceil(total / BATCH);

        const pagePromises = Array.from({ length: pageCount }, (_, i) =>
          supabase
            .from("stage_productions")
            .select("category")
            .range(i * BATCH, (i + 1) * BATCH - 1)
        );

        const results = await Promise.all(pagePromises);
        if (cancelled) return;

        const tally: Record<string, number> = {};
        for (const { data, error } of results) {
          if (error) { setLoading(false); return; }
          for (const row of data ?? []) {
            tally[row.category] = (tally[row.category] ?? 0) + 1;
          }
        }
        setCounts(tally);
      } catch {
        // Fallback to manual pagination
        const all: any[] = [];
        let page = 0;
        while (true) {
          const { data, error } = await supabase
            .from("stage_productions")
            .select("category")
            .range(page * BATCH, (page + 1) * BATCH - 1);

          if (cancelled) return;
          if (error || !data?.length) break;
          all.push(...data);
          if (data.length < BATCH) break;
          page++;
          if (page > 50) break;
        }

        if (cancelled) return;
        const tally: Record<string, number> = {};
        for (const row of all) {
          tally[row.category] = (tally[row.category] ?? 0) + 1;
        }
        setCounts(tally);
      }

      setLoading(false);
    }

    fetchCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  return { counts, loading };
}

// ── stage_productions as Ticketmaster-compatible events ────────────────────────

export interface StageProductionsEvent {
  id: string;
  name: string;
  url: string;
  dates: {
    start: { localDate?: string; localTime?: string };
    status?: { code?: string };
  };
  _embedded: {
    venues: Array<{
      name?: string;
      city?: { name?: string };
      state?: { name?: string };
      country?: { name?: string };
    }>;
  };
  images: Array<{ url: string }>;
  info?: string;
  event_date: string;
  event_time: string;
}

export function useStageProductionsEvents(category: string) {
  const [events, setEvents] = useState<StageProductionsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) { setEvents([]); setLoading(false); return; }
    let cancelled = false;

    async function init() {
      setLoading(true);
      setError(null);

      const BATCH = 1000;
      const all: StageProductionsEvent[] = [];
      let page = 0;

      while (true) {
        const { data, error: sbError } = await supabase
          .from("stage_productions")
          .select("id, title, url, event_date, event_time, status, cover_image")
          .eq("category", category)
          .order("event_date", { ascending: true })
          .range(page * BATCH, (page + 1) * BATCH - 1);

        if (cancelled) return;
        if (sbError) { setError(sbError.message); setLoading(false); return; }
        if (!data?.length) break;

        const adapted: StageProductionsEvent[] = data.map((row) => {
          const localDate = row.event_date
            ? new Date(Number(row.event_date) * 1000).toISOString().split("T")[0]
            : undefined;
          return {
            id: row.id,
            name: row.title,
            url: row.url || "",
            dates: {
              start: {
                localDate,
                localTime: row.event_time || undefined,
              },
              status: { code: row.status },
            },
            _embedded: { venues: [] },
            images: row.cover_image ? [{ url: row.cover_image }] : [],
            event_date: localDate ?? "",
            event_time: row.event_time || "",
          };
        });

        all.push(...adapted);
        if (data.length < BATCH) break;
        page++;
        if (page > 50) break;
      }

      if (!cancelled) {
        setEvents(all);
        setLoading(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [category]);

  return { events, loading, error };
}

// ── Admin CRUD helpers ───────────────────────────────────────────────────────

export const adminStageProductions = {
  async list(email?: string) {
    // Supabase returns max 1000 rows per query regardless of .limit()
    // → paginate to get all 25k+ rows
    const BATCH = 1000;
    const all: StageProduction[] = [];
    let page = 0;

    while (true) {
      const { data, error } = await supabase
        .from("stage_productions")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * BATCH, (page + 1) * BATCH - 1);

      if (error) return { data: null, error };
      if (!data?.length) break;

      all.push(...(data as StageProduction[]));
      if (data.length < BATCH) break;
      page++;
      if (page > 50) break; // safety
    }

    return { data: all.length ? all : null, error: null };
  },

  async create(item: Partial<StageProduction>) {
    const { data, error } = await supabase
      .from("stage_productions")
      .insert([item])
      .select()
      .single();
    return { data: data as StageProduction | null, error };
  },

  async update(id: string, item: Partial<StageProduction>) {
    const { data, error } = await supabase
      .from("stage_productions")
      .update({ ...item, updated_at: Date.now() })
      .eq("id", id)
      .select()
      .single();
    return { data: data as StageProduction | null, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from("stage_productions")
      .delete()
      .eq("id", id);
    return { error };
  },
};
