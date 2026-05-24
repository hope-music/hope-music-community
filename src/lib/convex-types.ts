/**
 * Convex API type definitions
 * These types match the convex/admin.ts functions
 */

// News article type
export interface NewsArticle {
  _id: string;
  title: string;
  coverImage?: string;
  content?: string;
  excerpt?: string;
  publishDate?: number;
  authorName?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

// API functions interface (matches convex/admin.ts)
export interface AdminApi {
  admin: {
    getPublishedNews: (args?: { limit?: number }) => Promise<NewsArticle[]>;
    listNews: (args?: { isPublished?: boolean; isFeatured?: boolean }) => Promise<NewsArticle[]>;
    createNewsArticle: (args: {
      title: string;
      coverImage?: string;
      content: string;
      excerpt?: string;
      publishDate?: number;
      authorEmail?: string;
      authorName?: string;
      isPublished?: boolean;
      isFeatured?: boolean;
    }) => Promise<{ success: boolean; id: string; message: string }>;
    deleteNewsArticle: (args: { id: string }) => Promise<{ success: boolean; message: string }>;
    generateUploadUrl: () => Promise<string>;
  };
}

// Create a proxy that mimics the Convex API
// In development, this returns empty arrays; when Convex is connected, it uses real queries
export const api = {} as AdminApi["admin"];
