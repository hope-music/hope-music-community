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
    description: v.string(),
    content: v.string(),
    coverImage: v.string(),
    url: v.string(),
    category: v.string(),
    city: v.string(),
    eventDate: v.optional(v.number()),
    eventTime: v.string(),
    mediaLinks: v.array(v.string()),
    isFeatured: v.boolean(),
    status: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_category", ["category"]),

  // Hope Studio table
  hopeStudio: defineTable({
    serviceName: v.string(),
    description: v.string(),
    category: v.string(),
    availability: v.string(),
    pricing: v.string(),
    imageLinks: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_category", ["category"]),

  // News table
  news: defineTable({
    title: v.string(),
    coverImage: v.string(),
    content: v.string(),
    excerpt: v.string(),
    publishDate: v.number(),
    authorEmail: v.string(),
    authorName: v.string(),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_publishDate", ["publishDate"])
    .index("by_isPublished", ["isPublished"]),

  // Insights table
  insights: defineTable({
    title: v.string(),
    coverImage: v.string(),
    content: v.string(),
    excerpt: v.string(),
    category: v.string(),
    eventDate: v.optional(v.number()),
    publishDate: v.number(),
    authorEmail: v.string(),
    authorName: v.string(),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_category", ["category"])
    .index("by_publishDate", ["publishDate"])
    .index("by_isPublished", ["isPublished"]),
});
