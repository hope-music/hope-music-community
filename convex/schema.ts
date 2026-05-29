import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Schema with validation enabled
export default defineSchema(
  {
    users: defineTable({
      email: v.string(),
      username: v.string(),
      avatar: v.string(),
      role: v.optional(v.union(
        v.literal("super_admin"),
        v.literal("operator"),
        v.literal("member")
      )),
      status: v.optional(v.union(
        v.literal("active"),
        v.literal("disabled")
      )),
      createdAt: v.optional(v.number()),
      isBanned: v.optional(v.boolean()),
      isBannedUntil: v.optional(v.number()),
    })
    .index("by_email", ["email"]),

    posts: defineTable({
      authorEmail: v.string(),
      authorUsername: v.string(),
      authorAvatar: v.string(),
      title: v.string(),
      content: v.string(),
      category: v.string(),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
      isDeleted: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      views: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      status: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("hidden")
      )),
    }).index("by_authorEmail", ["authorEmail"]).index("by_category", ["category"]).index("by_status", ["status"]),

    comments: defineTable({
      postId: v.id("posts"),
      authorEmail: v.string(),
      authorUsername: v.string(),
      authorAvatar: v.string(),
      content: v.string(),
      createdAt: v.optional(v.number()),
      isDeleted: v.optional(v.boolean()),
    }),

    stageProductions: defineTable({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      city: v.optional(v.string()),
      mediaLinks: v.optional(v.array(v.string())),
      status: v.optional(v.string()),
      eventDate: v.optional(v.number()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    }),

    hopeStudio: defineTable({
      serviceName: v.optional(v.string()),
      description: v.optional(v.string()),
      availability: v.optional(v.string()),
      pricing: v.optional(v.string()),
      imageLinks: v.optional(v.array(v.string())),
      isActive: v.optional(v.boolean()),
      category: v.optional(v.string()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    }),

    news: defineTable({
      title: v.optional(v.string()),
      coverImage: v.optional(v.string()),
      content: v.optional(v.string()),
      excerpt: v.optional(v.string()),
      publishDate: v.optional(v.number()),
      authorEmail: v.optional(v.string()),
      authorName: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      createdAt: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    }),
  },
  {
    schemaValidation: false,
  }
);
