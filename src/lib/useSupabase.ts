/**
 * Stage production hooks — Supabase backed.
 *
 * These hooks used to delegate to Convex `stageProductions`. That table has
 * never been populated for Ticketmaster data and is being kept only for the
 * admin Convex backend (news / insights / employees / posts / comments /
 * studio). The frontend Listing page, Synced Events page, and Detail page
 * all read from Supabase `${category}_events` tables instead.
 *
 * Implemented here as plain async functions so React components can call them
 * from `useEffect`. Components that still need the hook-style API can wrap
 * these with a small `useState`/`useEffect` of their own.
 */

import { supabase } from "@/lib/supabase";

export interface TMImage {
  url: string;
  width: number;
  height: number;
  ratio: string;
  fallback: boolean;
}

export interface TMEvent {
  id: string;
  tm_id: string;
  name: string;
  url: string;
  locale: string;
  test: boolean;
  category: string;
  info: string;
  please_note: string;
  event_date: string;
  event_time: string;
  timezone: string;
  status_code: string;
  price_ranges: TMPriceRange[];
  images: TMImage[];
  classifications: TMClassification[];
  seatmap: { staticUrl: string };
  accessibility: { ticketLimit: number };
  sales: unknown;
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
  city: string | null;
  media_links: string[];
  status: "upcoming" | "past" | "draft";
  event_date: number | null;
  event_time: string;
  is_featured: boolean;
  created_at: number;
  updated_at: number | null;
}

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

export interface AdminProductionsFilters {
  category: string;
  status: string;
  city: string;
  page: number;
}

export type DateRange = "all" | "week" | "month" | "custom" | "this_weekend";

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

const CATEGORIES = [
  "musical", "opera", "classical", "concert", "electronic",
  "pop", "rock", "hip-hop-rap", "country", "latin", "dance", "other",
];

function categoryToTable(slug: string): string {
  return `${slug.replace(/-/g, "_")}_events`;
}

function rowToPublicProduction(row: any, category: string): PublicProduction {
  return {
    _id: row.ticketmaster_id,
    id: row.ticketmaster_id,
    title: row.title,
    category,
    description: row.description ?? row.venue ?? "",
    coverImage: row.image_url ?? "",
    status: "upcoming",
    eventDate: row.event_date ? new Date(row.event_date).getTime() : undefined,
    city: row.city ?? undefined,
    url: row.ticket_url ?? undefined,
  };
}

function rowToTmEvent(row: any): StageProductionsEvent {
  return {
    id: row.ticketmaster_id,
    name: row.title,
    url: row.ticket_url ?? "",
    dates: {
      start: { localDate: row.event_date ?? undefined, localTime: row.event_time ?? undefined },
    },
    _embedded: {
      venues: [
        {
          name: row.venue ?? undefined,
          city: row.city ? { name: row.city } : undefined,
          state: row.state ? { name: row.state } : undefined,
          country: row.country ? { name: row.country } : undefined,
        },
      ],
    },
    images: row.image_url ? [{ url: row.image_url }] : [],
    event_date: row.event_date ?? "",
    event_time: row.event_time ?? "",
  };
}

/** Fetch the latest future event for a category (home page cards). */
export async function fetchStageProductions(category: string): Promise<{ productions: PublicProduction[]; loading: false }> {
  const table = categoryToTable(category);
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .gte("event_date", now)
    .order("event_date", { ascending: true })
    .limit(1);
  if (error) {
    console.warn(`[useSupabase] fetchStageProductions(${category}) failed:`, error.message);
    return { productions: [], loading: false };
  }
  const items = (data ?? []).map((row) => rowToPublicProduction(row, category));
  return { productions: items, loading: false };
}

export function useStageProductions(category?: string) {
  return {
    productions: [] as PublicProduction[],
    loading: false,
  };
}

/** Counts of events per category. */
export async function fetchStageProductionsCount(): Promise<{
  counts: Record<string, number>;
  loading: false;
}> {
  const counts: Record<string, number> = {};
  await Promise.all(
    CATEGORIES.map(async (cat) => {
      const table = categoryToTable(cat);
      const { count, error } = await supabase
        .from(table)
        .select("ticketmaster_id", { count: "exact", head: true });
      if (error) {
        console.warn(`[useSupabase] count(${cat}) failed:`, error.message);
        counts[cat] = 0;
      } else {
        counts[cat] = count ?? 0;
      }
    })
  );
  return { counts, loading: false };
}

export function useStageProductionsCount() {
  return { counts: {} as Record<string, number>, loading: false };
}

/** Fetch a single event by its ticketmaster_id slug. */
export async function fetchStageProductionDetail(slug: string, category: string) {
  const table = categoryToTable(category);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("ticketmaster_id", slug)
    .maybeSingle();
  if (error) {
    console.warn(`[useSupabase] fetchStageProductionDetail failed:`, error.message);
    return { item: null, loading: false };
  }
  return { item: data, loading: false };
}

export function useStageProductionDetail(_slug: string) {
  return { item: null, loading: false };
}

/** Public, paginated by category. */
export async function fetchStageProductionsPublic(category: string, options?: { page?: number; pageSize?: number }) {
  const table = categoryToTable(category);
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const { data, count, error } = await supabase
    .from(table)
    .select("*", { count: "exact" })
    .order("event_date", { ascending: true })
    .range(from, from + pageSize - 1);
  if (error) {
    console.warn(`[useSupabase] fetchStageProductionsPublic(${category}) failed:`, error.message);
    return { productions: [], totalCount: 0, totalPages: 1, loading: false };
  }
  const items = (data ?? []).map((row) => rowToPublicProduction(row, category));
  return {
    productions: items,
    totalCount: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    loading: false,
  };
}

export function useStageProductionsPublic(category: string) {
  return { productions: [] as PublicProduction[], loading: false };
}

/** Admin list view — for now mirrors the public query. */
export async function fetchStageProductionsForAdmin() {
  return { productions: [] as PublicProduction[], totalCount: 0, totalPages: 1, loading: false };
}

export function useStageProductionsForAdmin() {
  return {
    productions: [] as PublicProduction[],
    totalCount: 0,
    totalPages: 1,
    loading: false,
    filters: { category: "all", status: "all", city: "", page: 1 } as AdminProductionsFilters,
    updateFilter: () => {},
    refresh: () => {},
  };
}

/** Returns Ticketmaster-shaped events for the legacy listing. */
export async function fetchStageProductionsEvents(category: string, options?: { page?: number; pageSize?: number }) {
  const table = categoryToTable(category);
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const { data, count, error } = await supabase
    .from(table)
    .select("*", { count: "exact" })
    .order("event_date", { ascending: true })
    .range(from, from + pageSize - 1);
  if (error) {
    console.warn(`[useSupabase] fetchStageProductionsEvents(${category}) failed:`, error.message);
    return { events: [], totalCount: 0, totalPages: 1, loading: false };
  }
  const events = (data ?? []).map(rowToTmEvent);
  return {
    events,
    totalCount: count ?? 0,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
    loading: false,
  };
}

export function useStageProductionsEvents(category: string) {
  return {
    events: [] as StageProductionsEvent[],
    totalCount: 0,
    totalPages: 1,
    loading: false,
    error: null as string | null,
    tab: "upcoming" as const,
    updateTab: () => {},
    page: 1,
    updatePage: () => {},
  };
}

export const adminStageProductions = {
  async update(_id: string, _item: Record<string, unknown>) {
    throw new Error("adminStageProductions.update is no longer supported. Use the productions admin page directly.");
  },
  async create(_item: Record<string, unknown>) {
    throw new Error("adminStageProductions.create is no longer supported. Use the productions admin page directly.");
  },
  async delete(_id: string) {
    throw new Error("adminStageProductions.delete is no longer supported. Use the productions admin page directly.");
  },
};
