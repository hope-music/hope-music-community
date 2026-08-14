// ============================================
// API Hooks - Clean Supabase-first, replaces Convex
// ============================================
import { useState, useEffect, useCallback, useRef } from "react";
import { supabaseAdmin } from "./supabase-admin";

// =====================
// Helper: Convert DB row to Convex format
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

export function usePublishedNews(limit?: number) {
  const [data, setData] = useState<NewsArticle[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        let query = supabaseAdmin
          .from("news")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data: rows, error: err } = await query;
        if (err) throw err;

        const articles = (rows || []).map((r: any) => ({
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
        }));

        setData(articles);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
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
      const { data: rows, error: err } = await supabaseAdmin
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;

      const articles = (rows || []).map((r: any) => ({
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
      }));

      setData(articles);
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
  const insertData = {
    title: data.title,
    content: data.content,
    cover_image: data.coverImage || null,
    excerpt: data.excerpt || null,
    author: data.authorName || null,
    author_email: data.authorEmail || null,
    is_published: data.isPublished ?? true,
    is_featured: data.isFeatured ?? false,
  };
  const { error } = await supabaseAdmin.from("news").insert(insertData as any);

  if (error) throw error;
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
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.coverImage !== undefined) updates.cover_image = data.coverImage;
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  if (data.authorName !== undefined) updates.author = data.authorName;
  if (data.isPublished !== undefined) updates.is_published = data.isPublished;
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;

  const { error } = await supabaseAdmin
    .from("news")
    .update(updates as any)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteNewsArticle(id: string) {
  const { error } = await supabaseAdmin.from("news").delete().eq("id", id);
  if (error) throw error;
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

    async function fetchNews() {
      try {
        const { data: row, error: err } = await supabaseAdmin
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (err) throw err;
        if (!row || row.is_published !== true) {
          setData(null);
          return;
        }

        setData({
          _id: row.id,
          title: row.title || "",
          coverImage: row.cover_image || "",
          content: row.content || "",
          excerpt: row.excerpt || row.summary || "",
          publishDate: toTimestamp(row.publish_date || row.created_at),
          authorName: row.author_name || row.author || "",
          authorEmail: row.author_email,
          isPublished: row.is_published ?? false,
          isFeatured: row.is_featured ?? false,
          createdAt: toTimestamp(row.created_at),
          updatedAt: row.updated_at ? toTimestamp(row.updated_at) : undefined,
        });
      } catch (err: any) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
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

export function usePublishedInsights(category?: string, limit?: number) {
  const [data, setData] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        let query = supabaseAdmin
          .from("insights")
          .select("*")
          .eq("is_published", true);

        if (category) {
          query = query.eq("category", category);
        }

        query = query.order("created_at", { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data: rows, error: err } = await query;
        if (err) throw err;

        const items = (rows || []).map((r: any) => ({
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
        }));

        setData(items);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
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
      const { data: rows, error: err } = await supabaseAdmin
        .from("insights")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;

      const items = (rows || []).map((r: any) => ({
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
        updatedAt: r.updated_at ? toTimestamp(r.updated_at) : undefined,
      }));

      setData(items);
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
  const insertData = {
    title: data.title,
    content: data.content,
    cover_image: data.coverImage || null,
    excerpt: data.excerpt || null,
    category: data.category || "general",
    author: data.authorName || null,
    is_published: data.isPublished ?? false,
    is_featured: data.isFeatured ?? false,
  };
  const { error } = await supabaseAdmin.from("insights").insert(insertData as any);

  if (error) throw error;
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
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.coverImage !== undefined) updates.cover_image = data.coverImage;
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  if (data.category !== undefined) updates.category = data.category;
  if (data.authorName !== undefined) updates.author = data.authorName;
  if (data.isPublished !== undefined) updates.is_published = data.isPublished;
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;

  const { error } = await supabaseAdmin
    .from("insights")
    .update(updates as any)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteInsight(id: string) {
  const { error } = await supabaseAdmin.from("insights").delete().eq("id", id);
  if (error) throw error;
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

    async function fetchInsight() {
      try {
        const { data: row, error: err } = await supabaseAdmin
          .from("insights")
          .select("*")
          .eq("id", id)
          .single();

        if (err) throw err;
        if (!row || row.is_published !== true) {
          setData(null);
          return;
        }

        setData({
          _id: row.id,
          title: row.title || "",
          coverImage: row.cover_image || "",
          content: row.content || "",
          excerpt: row.excerpt || row.summary || "",
          category: row.category || "general",
          publishDate: toTimestamp(row.publish_date || row.created_at),
          eventDate: row.event_date ? toTimestamp(row.event_date) : undefined,
          authorName: row.author_name || row.author || "",
          isPublished: row.is_published ?? false,
          isFeatured: row.is_featured ?? false,
          createdAt: toTimestamp(row.created_at),
        });
      } catch (err: any) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchInsight();
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

export function usePosts(options?: {
  category?: string;
  status?: string;
  authorEmail?: string;
}) {
  const [data, setData] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        let query = supabaseAdmin
          .from("posts")
          .select("*")
          .eq("is_deleted", false)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false });

        if (options?.category) {
          query = query.eq("category", options.category);
        }
        if (options?.status) {
          query = query.eq("status", options.status);
        }
        if (options?.authorEmail) {
          query = query.eq("author_email", options.authorEmail);
        }

        const { data: rows, error: err } = await query;
        if (err) throw err;

        // Get comment counts
        const postIds = (rows || []).map((r: any) => r.id);
        let commentCounts: Record<string, number> = {};

        if (postIds.length > 0) {
          const { data: comments } = await supabaseAdmin
            .from("comments")
            .select("post_id")
            .in("post_id", postIds)
            .eq("is_deleted", false);

          (comments || []).forEach((c: any) => {
            commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
          });
        }

        const posts = (rows || []).map((r: any) => ({
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
        }));

        setData(posts);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [options?.category, options?.status, options?.authorEmail]);

  return { data, loading, error };
}

export function useComments(postId: string) {
  const [data, setData] = useState<Comment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComments() {
      try {
        const { data: rows, error: err } = await supabaseAdmin
          .from("comments")
          .select("*")
          .eq("post_id", postId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true });

        if (err) throw err;

        const comments = (rows || []).map((r: any) => ({
          _id: r.id,
          postId: r.post_id,
          authorEmail: r.author_email || "",
          authorUsername: r.author_username || "",
          authorAvatar: r.author_avatar || "",
          content: r.content || "",
          isDeleted: r.is_deleted || false,
          createdAt: toTimestamp(r.created_at),
        }));

        setData(comments);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchComments();
  }, [postId]);

  return { data, loading, error };
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
  const insertData = {
    author_email: data.authorEmail,
    author_username: data.authorUsername,
    author_avatar: data.authorAvatar,
    title: data.title,
    content: data.content,
    category: data.category,
    tags: data.tags || [],
    status: "approved",
  };
  const { error } = await supabaseAdmin.from("posts").insert(insertData as any);

  if (error) throw error;
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
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.category !== undefined) updates.category = data.category;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.isPinned !== undefined) updates.is_pinned = data.isPinned;
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;
  if (data.status !== undefined) updates.status = data.status;

  const { error } = await supabaseAdmin
    .from("posts")
    .update(updates as any)
    .eq("id", id);

  if (error) throw error;
}

export async function deletePost(id: string) {
  // Soft delete post
  const { error: postError } = await supabaseAdmin
    .from("posts")
    .update({ is_deleted: true })
    .eq("id", id);

  if (postError) throw postError;

  // Soft delete all comments
  await supabaseAdmin
    .from("comments")
    .update({ is_deleted: true })
    .eq("post_id", id);
}

export async function createComment(data: {
  postId: string;
  authorEmail: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
}) {
  const insertData = {
    post_id: data.postId,
    author_email: data.authorEmail,
    author_username: data.authorUsername,
    author_avatar: data.authorAvatar,
    content: data.content,
  };
  const { error } = await supabaseAdmin.from("comments").insert(insertData as any);

  if (error) throw error;

  // Update reply count
  const { count } = await supabaseAdmin
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", data.postId)
    .eq("is_deleted", false);

  await supabaseAdmin
    .from("posts")
    .update({ reply_count: count || 0 })
    .eq("id", data.postId);
}

export async function deleteComment(id: string, postId: string) {
  const { error } = await supabaseAdmin
    .from("comments")
    .update({ is_deleted: true })
    .eq("id", id);

  if (error) throw error;

  // Update reply count
  const { count } = await supabaseAdmin
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId)
    .eq("is_deleted", false);

  await supabaseAdmin
    .from("posts")
    .update({ reply_count: count || 0 })
    .eq("id", postId);
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

export function useUsers() {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error: err } = await supabaseAdmin
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;

      const users = (rows || []).map((r: any) => ({
        _id: r.id,
        email: r.email || "",
        username: r.username || "",
        avatar: r.avatar || "",
        role: r.role || "member",
        status: r.status || "active",
        createdAt: toTimestamp(r.created_at),
      }));

      setData(users);
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
  const insertData = {
    email: data.email,
    username: data.username,
    avatar: data.avatar,
    role: data.role,
    status: "active",
  };
  const { error } = await supabaseAdmin.from("users").insert(insertData as any);

  if (error) throw error;
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
  const updates: any = {};
  if (data.role !== undefined) updates.role = data.role;
  if (data.status !== undefined) updates.status = data.status;
  if (data.username !== undefined) updates.username = data.username;
  if (data.avatar !== undefined) updates.avatar = data.avatar;

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates as any)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteUser(id: string) {
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) throw error;
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

export function useStageProductions(category?: string, limit?: number) {
  const [data, setData] = useState<StageProduction[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductions() {
      try {
        let query = supabaseAdmin
          .from("stage_productions")
          .select("*")
          .eq("is_visible", true)
          .order("event_date", { ascending: false });

        if (category) {
          query = query.eq("category", category);
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data: rows, error: err } = await query;
        if (err) throw err;

        const productions = (rows || []).map((r: any) => ({
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
        }));

        setData(productions);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProductions();
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
      const { data: rows, error: err } = await supabaseAdmin
        .from("stage_productions")
        .select("*")
        .order("event_date", { ascending: false });

      if (err) throw err;

      const productions = (rows || []).map((r: any) => ({
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
        updatedAt: r.updated_at ? toTimestamp(r.updated_at) : undefined,
      }));

      setData(productions);
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
  const insertData = {
    title: data.title,
    description: data.description || "",
    content: data.content || "",
    cover_image: data.coverImage || "",
    url: data.url || "",
    category: data.category,
    event_date: data.eventDate ? new Date(data.eventDate).toISOString() : null,
    is_featured: data.isFeatured ?? false,
  };
  const { error } = await supabaseAdmin.from("stage_productions").insert(insertData as any);

  if (error) throw error;
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
  const updates: any = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.content !== undefined) updates.content = data.content;
  if (data.coverImage !== undefined) updates.cover_image = data.coverImage;
  if (data.url !== undefined) updates.url = data.url;
  if (data.category !== undefined) updates.category = data.category;
  if (data.eventDate !== undefined) {
    updates.event_date = new Date(data.eventDate).toISOString();
  }
  if (data.isFeatured !== undefined) updates.is_featured = data.isFeatured;

  const { error } = await supabaseAdmin
    .from("stage_productions")
    .update(updates as any)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteStageProduction(id: string) {
  const { error } = await supabaseAdmin
    .from("stage_productions")
    .delete()
    .eq("id", id);
  if (error) throw error;
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

export function useHopeStudioServices(category?: string) {
  const [data, setData] = useState<HopeStudioService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        let query = supabaseAdmin
          .from("hope_studio_services")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (category) {
          query = query.eq("category", category);
        }

        const { data: rows, error: err } = await query;
        if (err) throw err;

        const services = (rows || []).map((r: any) => ({
          _id: r.id,
          serviceName: r.title || r.service_name || "",
          description: r.description || "",
          category: r.category || "",
          availability: r.availability,
          pricing: r.pricing,
          imageLinks: r.image_links || [],
          isActive: r.is_active ?? true,
          createdAt: toTimestamp(r.created_at),
        }));

        setData(services);
      } catch (err: any) {
        setError(err.message);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
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
      const { data: rows, error: err } = await supabaseAdmin
        .from("hope_studio_services")
        .select("*")
        .order("sort_order", { ascending: true });

      if (err) throw err;

      const services = (rows || []).map((r: any) => ({
        _id: r.id,
        serviceName: r.title || r.service_name || "",
        description: r.description || "",
        category: r.category || "",
        availability: r.availability,
        pricing: r.pricing,
        imageLinks: r.image_links || [],
        isActive: r.is_active ?? true,
        createdAt: toTimestamp(r.created_at),
        updatedAt: r.updated_at ? toTimestamp(r.updated_at) : undefined,
      }));

      setData(services);
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

export async function createHopeStudioService(data: {
  serviceName: string;
  description: string;
  category?: string;
  availability?: string;
  pricing?: string;
  imageLinks?: string[];
  isActive?: boolean;
}) {
  const insertData = {
    title: data.serviceName,
    service_name: data.serviceName,
    description: data.description,
    category: data.category || "recording",
    availability: data.availability,
    pricing: data.pricing,
    image_links: data.imageLinks || [],
    is_active: data.isActive ?? true,
    is_published: true,
  };
  const { error } = await supabaseAdmin.from("hope_studio_services").insert(insertData as any);

  if (error) throw error;
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
  const updates: any = {};
  if (data.serviceName !== undefined) {
    updates.title = data.serviceName;
    updates.service_name = data.serviceName;
  }
  if (data.description !== undefined) updates.description = data.description;
  if (data.category !== undefined) updates.category = data.category;
  if (data.availability !== undefined) updates.availability = data.availability;
  if (data.pricing !== undefined) updates.pricing = data.pricing;
  if (data.imageLinks !== undefined) updates.image_links = data.imageLinks;
  if (data.isActive !== undefined) updates.is_active = data.isActive;

  const { error } = await supabaseAdmin
    .from("hope_studio_services")
    .update(updates as any)
    .eq("id", id);

  if (error) throw error;
}

export async function deleteHopeStudioService(id: string) {
  const { error } = await supabaseAdmin
    .from("hope_studio_services")
    .delete()
    .eq("id", id);
  if (error) throw error;
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
