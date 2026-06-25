/**
 * useSupabase.ts — Convex compatibility shim
 *
 * These hooks previously called Supabase directly. They now delegate to
 * the Convex API so that existing callers keep working without changes.
 */

import { useQuery, api } from "@/lib/convex";

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Hook adapters ─────────────────────────────────────────────────────────────

export function useStageProductions(category?: string, _limit?: number) {
  const raw = useQuery(
    api.admin.getLatestStageProduction,
    category ? { category } : ({} as any)
  ) as { _id: string; title: string; coverImage: string; url: string; eventDate?: number; category?: string } | null | undefined;
  return {
    productions: raw ? [raw] : [],
    loading: raw === undefined,
  };
}

export function useStageProductionsCount() {
  const raw = useQuery(api.admin.getStageProductionsCount) as Record<string, number> | undefined;
  return {
    counts: raw ?? {},
    loading: raw === undefined,
  };
}

export function useStageProductionDetail(slug: string) {
  const raw = useQuery(api.admin.getAllPublicStageProductions) as any[] | undefined;
  const item = raw?.find((p) => p._id === slug) ?? null;
  return {
    item,
    loading: raw === undefined,
  };
}

export function useStageProductionsPublic(category: string, _options?: { countryScope?: string }) {
  const raw = useQuery(api.admin.getStageProductionsByCategory, { category }) as
    | { items: any[]; total: number }
    | undefined;
  const loading = raw === undefined;
  const productions: PublicProduction[] = (raw?.items ?? []).map((p) => ({
    _id: p._id,
    id: p._id,
    title: p.title,
    category: p.category,
    description: p.description,
    coverImage: p.coverImage,
    status: (p.status ?? "upcoming") as PublicProduction["status"],
    eventDate: p.eventDate,
    city: p.city,
    url: p.url,
  }));
  return { productions, loading };
}

const PAGE_SIZE = 20;

export function useStageProductionsForAdmin(_initialFilters?: Partial<AdminProductionsFilters>) {
  const raw = useQuery(api.admin.listStageProductions, {}) as any[] | undefined;
  const loading = raw === undefined;
  const productions = raw ?? [];
  const totalCount = productions.length;

  return {
    productions,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    loading,
    filters: { category: "all", status: "all", city: "", page: 1 } as AdminProductionsFilters,
    updateFilter: (_key: string, _value: string | number) => {},
    refresh: () => {},
  };
}

// ── Stage productions as Ticketmaster-compatible events ────────────────────────

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

export function useStageProductionsEvents(category: string, options?: { tab?: "upcoming" | "past" | "archived"; page?: number }) {
  const raw = useQuery(api.admin.getStageProductionsByCategory, { category }) as
    | { items: any[]; total: number }
    | undefined;
  const loading = raw === undefined;

  const adapted: StageProductionsEvent[] = (raw?.items ?? []).map((p) => {
    const localDate = p.eventDate
      ? new Date(p.eventDate).toISOString().split("T")[0]
      : undefined;
    return {
      id: p._id,
      name: p.title,
      url: p.url || "",
      dates: {
        start: { localDate, localTime: p.eventTime },
        status: { code: p.status },
      },
      _embedded: { venues: [{ city: { name: p.city } }] },
      images: p.coverImage ? [{ url: p.coverImage }] : [],
      event_date: localDate ?? "",
      event_time: p.eventTime || "",
    };
  });

  return {
    events: adapted,
    totalCount: raw?.total ?? 0,
    totalPages: 1,
    loading,
    error: null as string | null,
    tab: (options?.tab ?? "upcoming") as "upcoming" | "past" | "archived",
    updateTab: () => {},
    page: options?.page ?? 1,
    updatePage: () => {},
  };
}

// ── Admin CRUD helpers ─────────────────────────────────────────────────────────
//
// Note: The mutation helpers are now in-use in the admin productions page
// via useMutation hooks directly. These legacy helpers are kept for
// backward compatibility but should not be called from hooks or event handlers
// in new code.
// ──────────────────────────────────────────────────────────────────────────────

export const adminStageProductions = {
  async update(_id: string, _item: Record<string, unknown>) {
    throw new Error("adminStageProductions.update is no longer supported. Use useMutation(api.admin.updateStageProduction) instead.");
  },
  async create(_item: Record<string, unknown>) {
    throw new Error("adminStageProductions.create is no longer supported. Use useMutation(api.admin.createStageProduction) instead.");
  },
  async delete(_id: string) {
    throw new Error("adminStageProductions.delete is no longer supported. Use useMutation(api.admin.deleteStageProduction) instead.");
  },
};
