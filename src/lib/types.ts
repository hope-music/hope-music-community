// ============================================
// Types - Clean Supabase-first types
// ============================================

export interface User {
  id: string;
  email: string;
  username: string;
  avatar: string;
  role: "super_admin" | "operator" | "member";
  status: "active" | "disabled";
  is_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  author_email: string;
  author_username: string;
  author_avatar: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  reply_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  is_deleted: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_email: string;
  author_username: string;
  author_avatar: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

export interface StageProduction {
  id: string;
  title: string;
  description: string;
  content: string;
  cover_image: string;
  url: string;
  category: string;
  subcategory?: string;
  city?: string;
  state?: string;
  country?: string;
  event_date?: string;
  event_time?: string;
  venue?: string;
  media_links: string[];
  is_featured: boolean;
  is_visible: boolean;
  ticketmaster_id?: string;
  ticket_url?: string;
  price_range?: string;
  status?: string;
  country_scope?: string;
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface HopeStudioService {
  id: string;
  title: string;
  service_name?: string;
  description: string;
  category: string;
  availability?: string;
  pricing?: string;
  icon?: string;
  image_links: string[];
  link?: string;
  is_active: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content: string;
  cover_image: string;
  author?: string;
  author_name?: string;
  author_email?: string;
  publish_date?: string;
  excerpt?: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  title: string;
  summary?: string;
  content: string;
  cover_image: string;
  category: string;
  event_date?: string;
  author?: string;
  author_name?: string;
  author_email?: string;
  publish_date?: string;
  excerpt?: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

// API Response types (matching Convex response format)
export interface UserResponse {
  _id: string;
  email: string;
  username: string;
  avatar: string;
  role: string;
  status: string;
}

export interface NewsArticleResponse {
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

export interface InsightResponse {
  _id: string;
  title: string;
  coverImage: string;
  content: string;
  excerpt: string;
  category: string;
  publishDate: number;
  eventDate?: number;
  authorName: string;
  authorEmail?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface PostResponse {
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
  updatedAt?: number;
}

export interface StageProductionResponse {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  url: string;
  category: string;
  city?: string;
  eventDate?: number;
  eventTime?: string;
  venue?: string;
  isFeatured: boolean;
  createdAt: number;
}

export interface HopeStudioServiceResponse {
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
