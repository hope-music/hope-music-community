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

  // Stage productions table (Performance events from Ticketmaster)
  stageProductions: defineTable({
    ticketmaster_id: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    subcategory: v.optional(v.string()),
    eventDate: v.string(),
    eventTime: v.optional(v.string()),
    venue: v.string(),
    city: v.string(),
    state: v.optional(v.string()),
    country: v.string(),
    imageUrl: v.optional(v.string()),
    ticketUrl: v.optional(v.string()),
    priceRange: v.optional(v.string()),
    status: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    featured: v.boolean(),
    countryScope: v.optional(v.string()),
    source: v.optional(v.string()),
  }).index("by_category", ["category"])
    .index("by_date", ["eventDate"])
    .index("by_ticketmaster_id", ["ticketmaster_id"])
    .index("by_visible", ["isVisible"]),

  // Hope Studio Services table
  hopeStudioServices: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    icon: v.optional(v.string()),
    link: v.optional(v.string()),
    isPublished: v.boolean(),
    order: v.optional(v.number()),
  }).index("by_category", ["category"])
    .index("by_published", ["isPublished"]),

  // News table
  news: defineTable({
    title: v.string(),
    summary: v.optional(v.string()),
    content: v.string(),
    coverImage: v.optional(v.string()),
    author: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    views: v.number(),
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
    author: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    views: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_published", ["isPublished"])
    .index("by_featured", ["isFeatured"])
    .index("by_created", ["createdAt"]),
});
