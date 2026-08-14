// ============================================
// API Hooks - Clean Supabase-first
// ============================================
//
// Split in two layers:
//
// 1. Read hooks (usePublishedNews, etc.) use the *anon* browser client and rely
//    on RLS for safety. Safe to ship to the browser; no server keys required.
// 2. Write helpers (createNewsArticle, etc.) call authenticated admin API
//    routes under /api/admin/*. They work from both server and browser
//    contexts because the service-role key stays on the server inside the
//    route handler.
// ============================================
import { useState, useEffect, useCallback } from "react";
import { supabase as browserSupabase } from "./supabase";

// =====================
// Admin fetch helpers — never throw on missing service key
// =====================
async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res;
}

// =====================
// Helper: Convert DB row to UI format
// =====================
function toTimestamp(dateStr: string | undefined): number {
  if (!dateStr) return Date.now();
  return new Date(dateStr).getTime();
}

// =====================
// NEWS
// =====================
export interface NewsArticle {
  _id: string;
  title: string;
  coverImage: string;
  content: string;
  excerpt: string;
  publishDate: number;
  authorName: string;
  authorEmail?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
  updatedAt?: number;
}

function rowToNews(r: any): NewsArticle {
  return {
    _id: r.id,
    title: r.title || "",
    coverImage: r.cover_image || "",
    content: r.content || "",
    excerpt: r.excerpt || r.summary || "",
    publishDate: toTimestamp(r.publish_date || r.created_at),
    authorName: r.author_name || r.author || "",
    authorEmail: r.author_email,
    isPublished: r.is_published ?? false,
    isFeatured: r.is_featured ?? false,
    createdAt: toTimestamp(r.created_at),
    updatedAt: r.updated_at ? toTimestamp(r.updated_at) : undefined,
  };
}

export function usePublishedNews(limit?: number) {
  const [data, setData] = useState<NewsArticle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchNews() {
      try {
        let query = browserSupabase
          .from("news")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });
        if (limit) query = query.limit(limit);
        const { data: rows, error: err } = await query;
        if (err) throw err;
        if (!cancelled) setData((rows || []).map(rowToNews));
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNews();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return { data, loading, error };
}

export function useNewsList() {
  const [data, setData] = useState<NewsArticle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error: err } = await browserSupabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setData((rows || []).map(rowToNews));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function createNewsArticle(data: {
  title: string;
  content: string;
  coverImage?: string;
  excerpt?: string;
  authorName?: string;
  authorEmail?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}) {
  await adminFetch("/api/admin/news", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateNewsArticle(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    coverImage: string;
    excerpt: string;
    authorName: string;
    isPublished: boolean;
    isFeatured: boolean;
  }>
) {
  await adminFetch(`/api/admin/news/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteNewsArticle(id: string) {
  await adminFetch(`/api/admin/news/${id}`, { method: "DELETE" });
}

export function useNewsById(id: string | undefined) {
  const [data, setData] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchNews() {
      try {
        const { data: row, error: err } = await browserSupabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();
        if (err) throw err;
        if (!cancelled) {
          if (!row || row.is_published !== true) {
            setData(null);
          } else {
            setData(rowToNews(row));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNews();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}

// =====================
// INSIGHTS
// =====================
export interface Insight {
  _id: string;
  title: string;
  coverImage: string;
  content: string;
  excerpt: string;
  category: string;
  publishDate: number;
  eventDate?: number;
  authorName: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
}

function rowToInsight(r: any): Insight {
  return {
    _id: r.id,
    title: r.title || "",
    coverImage: r.cover_image || "",
    content: r.content || "",
    excerpt: r.excerpt || r.summary || "",
    category: r.category || "general",
    publishDate: toTimestamp(r.publish_date || r.created_at),
    eventDate: r.event_date ? toTimestamp(r.event_date) : undefined,
    authorName: r.author_name || r.author || "",
    isPublished: r.is_published ?? false,
    isFeatured: r.is_featured ?? false,
    createdAt: toTimestamp(r.created_at),
  };
}

export function usePublishedInsights(category?: string, limit?: number) {
  const [data, setData] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchInsights() {
      try {
        let query = browserSupabase
          .from("insights")
          .select("*")
          .eq("is_published", true);
        if (category) query = query.eq("category", category);
        query = query.order("created_at", { ascending: false });
        if (limit) query = query.limit(limit);
        const { data: rows, error: err } = await query;
        if (err) throw err;
        if (!cancelled) setData((rows || []).map(rowToInsight));
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInsights();
    return () => {
      cancelled = true;
    };
  }, [category, limit]);

  return { data, loading, error };
}

export function useInsightsList() {
  const [data, setData] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error: err } = await browserSupabase
        .from("insights")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setData((rows || []).map(rowToInsight));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function createInsight(data: {
  title: string;
  content: string;
  coverImage?: string;
  excerpt?: string;
  category?: string;
  authorName?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}) {
  await adminFetch("/api/admin/insights", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInsight(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    coverImage: string;
    excerpt: string;
    category: string;
    authorName: string;
    isPublished: boolean;
    isFeatured: boolean;
  }>
) {
  await adminFetch(`/api/admin/insights/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteInsight(id: string) {
  await adminFetch(`/api/admin/insights/${id}`, { method: "DELETE" });
}

export function useInsightById(id: string | undefined) {
  const [data, setData] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchInsight() {
      try {
        const { data: row, error: err } = await browserSupabase
          .from("insights")
          .select("*")
          .eq("id", id)
          .single();
        if (err) throw err;
        if (!cancelled) {
          if (!row || row.is_published !== true) {
            setData(null);
          } else {
            setData(rowToInsight(row));
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInsight();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, loading, error };
}

// =====================
// POSTS (Interaction/Community)
// =====================
export interface Post {
  _id: string;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  replyCount: number;
  isPinned: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  status: string;
  createdAt: number;
}

export interface Comment {
  _id: string;
  postId: string;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  isDeleted: boolean;
  createdAt: number;
}

function rowToPost(r: any, commentCounts: Record<string, number>): Post {
  return {
    _id: r.id,
    authorEmail: r.author_email || "",
    authorUsername: r.author_username || "",
    authorAvatar: r.author_avatar || "",
    title: r.title || "",
    content: r.content || "",
    category: r.category || "",
    tags: r.tags || [],
    views: r.views || 0,
    replyCount: commentCounts[r.id] || 0,
    isPinned: r.is_pinned || false,
    isFeatured: r.is_featured || false,
    isDeleted: r.is_deleted || false,
    status: r.status || "approved",
    createdAt: toTimestamp(r.created_at),
  };
}

function rowToComment(r: any): Comment {
  return {
    _id: r.id,
    postId: r.post_id,
    authorEmail: r.author_email || "",
    authorUsername: r.author_username || "",
    authorAvatar: r.author_avatar || "",
    content: r.content || "",
    isDeleted: r.is_deleted || false,
    createdAt: toTimestamp(r.created_at),
  };
}

export function usePosts(options?: {
  category?: string;
  status?: string;
  authorEmail?: string;
}) {
  const [data, setData] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPosts() {
      try {
        let query = browserSupabase
          .from("posts")
          .select("*")
          .eq("is_deleted", false)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });
        if (options?.category) query = query.eq("category", options.category);
        if (options?.status) query = query.eq("status", options.status);
        if (options?.authorEmail) query = query.eq("author_email", options.authorEmail);
        const { data: rows, error: err } = await query;
        if (err) throw err;
        const postIds = (rows || []).map((r: any) => r.id);
        let commentCounts: Record<string, number> = {};
        if (postIds.length > 0) {
          const { data: comments } = await browserSupabase
            .from("comments")
            .select("post_id")
            .in("post_id", postIds)
            .eq("is_deleted", false);
          (comments || []).forEach((c: any) => {
            commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
          });
        }
        if (!cancelled) setData((rows || []).map((r) => rowToPost(r, commentCounts)));
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [options?.category, options?.status, options?.authorEmail]);

  return { data, loading, error };
}

export function useComments(postId: string) {
  const [data, setData] = useState<Comment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchComments() {
      try {
        const { data: rows, error: err } = await browserSupabase
          .from("comments")
          .select("*")
          .eq("post_id", postId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });
        if (err) throw err;
        if (!cancelled) setData((rows || []).map(rowToComment));
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchComments();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  return { data, loading, error };
}

// POSTS — write helpers are not yet wired to API routes. Until then, throw a
// clear error so callers know to use the legacy admin path (REST routes
// under /api/admin) instead.
function notImplemented(fnName: string): never {
  throw new Error(
    `${fnName} is not yet wired through an admin API route.`
  );
}

export async function createPost(data: {
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
}) {
  notImplemented("createPost");
  void data;
}

export async function updatePost(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    isPinned: boolean;
    isFeatured: boolean;
    status: string;
  }>
) {
  notImplemented("updatePost");
  void id;
  void data;
}

export async function deletePost(id: string) {
  notImplemented("deletePost");
  void id;
}

export async function createComment(data: {
  postId: string;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
}) {
  notImplemented("createComment");
  void data;
}

export async function deleteComment(id: string, postId: string) {
  notImplemented("deleteComment");
  void id;
  void postId;
}

export async function createStageProduction(data: {
  title: string;
  description?: string;
  content?: string;
  coverImage?: string;
  url?: string;
  category: string;
  eventDate?: number;
  isFeatured?: boolean;
}) {
  notImplemented("createStageProduction");
  void data;
}

export async function updateStageProduction(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    content: string;
    coverImage: string;
    url: string;
    category: string;
    eventDate: number;
    isFeatured: boolean;
  }>
) {
  notImplemented("updateStageProduction");
  void id;
  void data;
}

export async function deleteStageProduction(id: string) {
  notImplemented("deleteStageProduction");
  void id;
}

export async function createHopeStudioService(data: {
  serviceName: string;
  description: string;
  category?: string;
  availability?: string;
  pricing?: string;
  imageLinks?: string[];
  isActive?: boolean;
}) {
  notImplemented("createHopeStudioService");
  void data;
}

export async function updateHopeStudioService(
  id: string,
  data: Partial<{
    serviceName: string;
    description: string;
    category: string;
    availability: string;
    pricing: string;
    imageLinks: string[];
    isActive: boolean;
  }>
) {
  notImplemented("updateHopeStudioService");
  void id;
  void data;
}

export async function deleteHopeStudioService(id: string) {
  notImplemented("deleteHopeStudioService");
  void id;
}

// =====================
// USERS
// =====================
export interface User {
  _id: string;
  email: string;
  username: string;
  avatar: string;
  role: string;
  status: string;
  createdAt: number;
}

function rowToUser(r: any): User {
  return {
    _id: r.id,
    email: r.email || "",
    username: r.username || "",
    avatar: r.avatar || "",
    role: r.role || "member",
    status: r.status || "active",
    createdAt: toTimestamp(r.created_at),
  };
}

export function useUsers() {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error: err } = await browserSupabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setData((rows || []).map(rowToUser));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export async function createUser(data: {
  email: string;
  username: string;
  avatar: string;
  role: string;
}) {
  await adminFetch("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  id: string,
  data: Partial<{
    role: string;
    status: string;
    username: string;
    avatar: string;
  }>
) {
  await adminFetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  await adminFetch(`/api/admin/users/${id}`, { method: "DELETE" });
}

// =====================
// STAGE PRODUCTIONS
// =====================
export interface StageProduction {
  _id: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  url: string;
  category: string;
  city?: string;
  eventDate?: number;
  isFeatured: boolean;
  createdAt: number;
}

function rowToStageProduction(r: any): StageProduction {
  return {
    _id: r.id,
    title: r.title || "",
    description: r.description || "",
    content: r.content || "",
    coverImage: r.cover_image || "",
    url: r.url || "",
    category: r.category || "",
    city: r.city,
    eventDate: r.event_date ? toTimestamp(r.event_date) : undefined,
    isFeatured: r.is_featured || false,
    createdAt: toTimestamp(r.created_at),
  };
}

export function useStageProductions(category?: string, limit?: number) {
  const [data, setData] = useState<StageProduction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProductions() {
      try {
        let query = browserSupabase
          .from("stage_productions")
          .select("*")
          .eq("is_visible", true)
          .order("event_date", { ascending: false });
        if (category) query = query.eq("category", category);
        if (limit) query = query.limit(limit);
        const { data: rows, error: err } = await query;
        if (err) throw err;
        if (!cancelled) setData((rows || []).map(rowToStageProduction));
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProductions();
    return () => {
      cancelled = true;
    };
  }, [category, limit]);

  return { data, loading, error };
}

export function useStageProductionsList() {
  const [data, setData] = useState<StageProduction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error: err } = await browserSupabase
        .from("stage_productions")
        .select("*")
        .order("event_date", { ascending: false });
      if (err) throw err;
      setData((rows || []).map(rowToStageProduction));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// =====================
// HOPE STUDIO SERVICES
// =====================
export interface HopeStudioService {
  _id: string;
  serviceName: string;
  description: string;
  category: string;
  availability?: string;
  pricing?: string;
  imageLinks: string[];
  isActive: boolean;
  createdAt: number;
}

function rowToService(r: any): HopeStudioService {
  return {
    _id: r.id,
    serviceName: r.title || r.service_name || "",
    description: r.description || "",
    category: r.category || "",
    availability: r.availability,
    pricing: r.pricing,
    imageLinks: r.image_links || [],
    isActive: r.is_active ?? true,
    createdAt: toTimestamp(r.created_at),
  };
}

export function useHopeStudioServices(category?: string) {
  const [data, setData] = useState<HopeStudioService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchServices() {
      try {
        let query = browserSupabase
          .from("hope_studio_services")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });
        if (category) query = query.eq("category", category);
        const { data: rows, error: err } = await query;
        if (err) throw err;
        if (!cancelled) setData((rows || []).map(rowToService));
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchServices();
    return () => {
      cancelled = true;
    };
  }, [category]);

  return { data, loading, error };
}

export function useHopeStudioServicesList() {
  const [data, setData] = useState<HopeStudioService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error: err } = await browserSupabase
        .from("hope_studio_services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (err) throw err;
      setData((rows || []).map(rowToService));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// =====================
// IMAGE UPLOAD
// =====================
export async function uploadImageToStorage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}
