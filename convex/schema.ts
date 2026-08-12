import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    email: v.string(),
    username: v.string(),
    avatar: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("operator"), v.literal("member")),
    status: v.union(v.literal("active"), v.literal("disabled")),
    isBanned: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Posts table (Community feed)
  posts: defineTable({
    authorEmail: v.string(),
    authorUsername: v.string(),
    authorAvatar: v.string(),
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    views: v.number(),
    replyCount: v.number(),
    isPinned: v.boolean(),
    isFeatured: v.boolean(),
    isDeleted: v.boolean(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_author", ["authorEmail"])
    .index("by_category", ["category"])
    .index("by_status", ["status"]),

  // Comments table
  comments: defineTable({
    postId: v.id("posts"),
    authorEmail: v.string(),
    authorUsername: v.string(),
    authorAvatar: v.string(),
    content: v.string(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  // Stage productions table
  stageProductions: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    url: v.optional(v.string()),
    category: v.string(),
    subcategory: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    eventTime: v.optional(v.string()),
    venue: v.optional(v.string()),
    mediaLinks: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    isVisible: v.optional(v.boolean()),
    ticketmaster_id: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    status: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    countryScope: v.optional(v.string()),
    source: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_category", ["category"])
    .index("by_date", ["eventDate"])
    .index("by_ticketmaster_id", ["ticketmaster_id"])
    .index("by_visible", ["isVisible"]),

  // Hope Studio Services table
  hopeStudioServices: defineTable({
    title: v.string(),
    serviceName: v.optional(v.string()),
    description: v.string(),
    category: v.string(),
    availability: v.optional(v.string()),
    pricing: v.optional(v.string()),
    icon: v.optional(v.string()),
    imageLinks: v.optional(v.array(v.string())),
    link: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    order: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  // News table
  news: defineTable({
    title: v.string(),
    summary: v.optional(v.string()),
    content: v.string(),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    authorName: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    views: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_published", ["isPublished"])
    .index("by_featured", ["isFeatured"])
    .index("by_created", ["createdAt"]),

  // Insights table
  insights: defineTable({
    title: v.string(),
    summary: v.optional(v.string()),
    content: v.string(),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    author: v.optional(v.string()),
    authorName: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    excerpt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    views: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_published", ["isPublished"])
    .index("by_featured", ["isFeatured"])
    .index("by_created", ["createdAt"])
    .index("by_category", ["category"])
    .index("by_publishDate", ["publishDate"]),
});
