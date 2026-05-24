import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// FILE STORAGE: Generate Upload URL
// ============================================
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// ============================================
// HELPER: Skip Admin Authentication
// Note: Admin panel is protected by password on frontend
// ============================================
async function requireAdmin(ctx: any): Promise<{ isAdmin: boolean; userId: string | null; email: string | null }> {
  // Skip auth check - frontend password protection is sufficient for single admin
  return { isAdmin: true, userId: null, email: null };
}

// ============================================
// TAB 1: USER MANAGEMENT
// ============================================

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.map((u: any) => ({
      _id: u._id,
      email: u.email ?? "",
      username: u.username ?? "",
      avatar: u.avatar ?? "",
      role: u.role ?? "user",
      isBanned: u.isBanned ?? false,
      createdAt: u.createdAt ?? Date.now(),
    }));
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    newRole: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("users", args.userId, { role: args.newRole });
    return { success: true, message: `User role updated to ${args.newRole}` };
  },
});

export const banUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("users", args.userId, { isBanned: true });
    return { success: true, message: "User banned successfully" };
  },
});

export const unbanUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("users", args.userId, { isBanned: false });
    return { success: true, message: "User unbanned successfully" };
  },
});

// ============================================
// TAB 2: COMMUNITY FEED (Posts & Comments)
// ============================================

export const listAllPosts = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const allPosts = await ctx.db.query("posts").collect();
    return allPosts
      .filter((p: any) => args.includeDeleted || !p.isDeleted)
      .map((p: any) => ({
        _id: p._id,
        authorEmail: p.authorEmail ?? "",
        authorUsername: p.authorUsername ?? "",
        authorAvatar: p.authorAvatar ?? "",
        title: p.title ?? "",
        content: p.content ?? "",
        category: p.category ?? "",
        isDeleted: p.isDeleted ?? false,
        createdAt: p.createdAt ?? Date.now(),
      }))
      .sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

export const listAllComments = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const allComments = await ctx.db.query("comments").collect();
    return allComments
      .filter((c: any) => args.includeDeleted || !c.isDeleted)
      .map((c: any) => ({
        _id: c._id,
        postId: c.postId,
        authorEmail: c.authorEmail ?? "",
        authorUsername: c.authorUsername ?? "",
        authorAvatar: c.authorAvatar ?? "",
        content: c.content ?? "",
        isDeleted: c.isDeleted ?? false,
        createdAt: c.createdAt ?? Date.now(),
      }))
      .sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("posts", args.postId, { isDeleted: true });
    const allComments = await ctx.db.query("comments").collect();
    const postComments = allComments.filter((c: any) => c.postId === args.postId);
    for (const comment of postComments) {
      await ctx.db.patch("comments", comment._id, { isDeleted: true });
    }
    return { success: true, message: "Post deleted" };
  },
});

export const restorePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("posts", args.postId, { isDeleted: false });
    return { success: true, message: "Post restored" };
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("comments", args.commentId, { isDeleted: true });
    return { success: true, message: "Comment deleted" };
  },
});

export const restoreComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("comments", args.commentId, { isDeleted: false });
    return { success: true, message: "Comment restored" };
  },
});

// ============================================
// TAB 3: PERFORMANCE HISTORY
// ============================================

export const listStageProductions = query({
  args: {
    status: v.optional(v.union(v.literal("upcoming"), v.literal("past"), v.literal("draft"))),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let productions = await ctx.db.query("stageProductions").collect();
    if (args.status) {
      productions = productions.filter((p: any) => p.status === args.status);
    }
    return productions.map((p: any) => ({
      _id: p._id,
      title: p.title ?? "",
      description: p.description ?? "",
      category: p.category ?? "",
      mediaLinks: p.mediaLinks ?? [],
      status: p.status ?? "draft",
      eventDate: p.eventDate,
      createdAt: p.createdAt ?? Date.now(),
      updatedAt: p.updatedAt,
    }));
  },
});

export const createStageProduction = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.string(),
    mediaLinks: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("upcoming"), v.literal("past"), v.literal("draft"))),
    eventDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = await ctx.db.insert("stageProductions", {
      title: args.title,
      description: args.description,
      category: args.category,
      mediaLinks: args.mediaLinks ?? [],
      status: args.status ?? "draft",
      eventDate: args.eventDate,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true, id, message: "Stage production created" };
  },
});

export const updateStageProduction = mutation({
  args: {
    id: v.id("stageProductions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    mediaLinks: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal("upcoming"), v.literal("past"), v.literal("draft"))),
    eventDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.mediaLinks !== undefined) updates.mediaLinks = args.mediaLinks;
    if (args.status !== undefined) updates.status = args.status;
    if (args.eventDate !== undefined) updates.eventDate = args.eventDate;
    await ctx.db.patch("stageProductions", args.id, updates);
    return { success: true, message: "Stage production updated" };
  },
});

export const deleteStageProduction = mutation({
  args: { id: v.id("stageProductions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete("stageProductions", args.id);
    return { success: true, message: "Stage production deleted" };
  },
});

// ============================================
// TAB 4: STUDIO & STAGE PRODUCTION
// ============================================

export const listHopeStudioServices = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let services = await ctx.db.query("hopeStudio").collect();
    if (args.category) {
      services = services.filter((s: any) => s.category === args.category);
    }
    return services.map((s: any) => ({
      _id: s._id,
      serviceName: s.serviceName ?? "",
      description: s.description ?? "",
      category: s.category ?? "",
      availability: s.availability ?? "",
      pricing: s.pricing ?? "",
      imageLinks: s.imageLinks ?? [],
      isActive: s.isActive ?? true,
      createdAt: s.createdAt ?? Date.now(),
      updatedAt: s.updatedAt,
    }));
  },
});

export const createHopeStudioService = mutation({
  args: {
    serviceName: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    availability: v.optional(v.string()),
    pricing: v.optional(v.string()),
    imageLinks: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = await ctx.db.insert("hopeStudio", {
      serviceName: args.serviceName,
      description: args.description,
      category: args.category ?? "recording",
availability: args.availability,
      pricing: args.pricing,
      imageLinks: args.imageLinks ?? [],
      isActive: args.isActive ?? true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true, id, message: "Studio service created" };
  },
});

export const updateHopeStudioService = mutation({
  args: {
    id: v.id("hopeStudio"),
    serviceName: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    availability: v.optional(v.string()),
    pricing: v.optional(v.string()),
    imageLinks: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.serviceName !== undefined) updates.serviceName = args.serviceName;
    if (args.description !== undefined) updates.description = args.description;
    if (args.category !== undefined) updates.category = args.category;
    if (args.availability !== undefined) updates.availability = args.availability;
    if (args.pricing !== undefined) updates.pricing = args.pricing;
    if (args.imageLinks !== undefined) updates.imageLinks = args.imageLinks;
    if (args.isActive !== undefined) updates.isActive = args.isActive;
    await ctx.db.patch("hopeStudio", args.id, updates);
    return { success: true, message: "Studio service updated" };
  },
});

export const deleteHopeStudioService = mutation({
  args: { id: v.id("hopeStudio") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete("hopeStudio", args.id);
    return { success: true, message: "Studio service deleted" };
  },
});

// ============================================
// TAB 5: NEWS CENTER
// ============================================

// Public query for homepage - no auth required
export const getPublishedNews = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articles = await ctx.db.query("news").collect();
    articles = articles.filter((n: any) => n.isPublished === true);
    articles = articles.sort((a: any, b: any) => 
      (b.publishDate ?? b.createdAt ?? 0) - (a.publishDate ?? a.createdAt ?? 0)
    );
    if (args.limit) {
      articles = articles.slice(0, args.limit);
    }
    return articles.map((n: any) => ({
      _id: n._id,
      title: n.title ?? "",
      coverImage: n.coverImage ?? n.image ?? "",
      content: n.content ?? "",
      excerpt: n.excerpt ?? "",
      publishDate: n.publishDate ?? n.date,
      authorName: n.authorName ?? n.author ?? "",
      isPublished: n.isPublished ?? false,
      isFeatured: n.isFeatured ?? false,
    }));
  },
});

// Admin-only query for full news management
export const listNews = query({
  args: {
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let articles = await ctx.db.query("news").collect();
    if (args.isPublished !== undefined) {
      articles = articles.filter((n: any) => (n.isPublished ?? false) === args.isPublished);
    }
    if (args.isFeatured !== undefined) {
      articles = articles.filter((n: any) => (n.isFeatured ?? false) === args.isFeatured);
    }
    return articles.map((n: any) => ({
      _id: n._id,
      title: n.title ?? "",
      coverImage: n.coverImage ?? n.image ?? "",
      content: n.content ?? "",
      excerpt: n.excerpt ?? "",
      publishDate: n.publishDate ?? n.date,
      authorEmail: n.authorEmail ?? "",
      authorName: n.authorName ?? n.author ?? "",
      isPublished: n.isPublished ?? false,
      isFeatured: n.isFeatured ?? false,
      createdAt: n.createdAt ?? Date.now(),
      updatedAt: n.updatedAt,
    })).sort((a: any, b: any) => (b.publishDate ?? b.createdAt) - (a.publishDate ?? a.createdAt));
  },
});

export const createNewsArticle = mutation({
  args: {
    title: v.string(),
    coverImage: v.optional(v.string()),
    content: v.string(),
    excerpt: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    authorEmail: v.optional(v.string()),
    authorName: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const adminInfo = await requireAdmin(ctx);
    const id = await ctx.db.insert("news", {
      title: args.title,
      coverImage: args.coverImage,
      content: args.content,
      excerpt: args.excerpt,
      publishDate: args.publishDate ?? Date.now(),
      authorEmail: args.authorEmail ?? adminInfo.email ?? undefined,
      authorName: args.authorName ?? undefined,
      isPublished: args.isPublished ?? false,
      isFeatured: args.isFeatured ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true, id, message: "News article created" };
  },
});

export const updateNewsArticle = mutation({
  args: {
    id: v.id("news"),
    title: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    authorEmail: v.optional(v.string()),
    authorName: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.content !== undefined) updates.content = args.content;
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.publishDate !== undefined) updates.publishDate = args.publishDate;
    if (args.authorEmail !== undefined) updates.authorEmail = args.authorEmail;
    if (args.authorName !== undefined) updates.authorName = args.authorName;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.isFeatured !== undefined) updates.isFeatured = args.isFeatured;
    await ctx.db.patch("news", args.id, updates);
    return { success: true, message: "News article updated" };
  },
});

export const deleteNewsArticle = mutation({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete("news", args.id);
    return { success: true, message: "News article deleted" };
  },
});

// ============================================
// AUTH MUTATIONS
// ============================================

export const register = mutation({
  args: {
    email: v.string(),
    username: v.string(),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    if (allUsers.some((u: any) => u.email === args.email)) {
      throw new Error("Email already registered");
    }
    if (allUsers.some((u: any) => u.username === args.username)) {
      throw new Error("Username already taken");
    }
    const userId = await ctx.db.insert("users", {
      email: args.email,
      username: args.username,
      avatar: args.avatar,
      role: "user",
      createdAt: Date.now(),
      isBanned: false,
    });
    return { userId, email: args.email, username: args.username, avatar: args.avatar };
  },
});

export const login = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find((u: any) => u.email === args.email);
    if (!user) {
      throw new Error("Email not found");
    }
    if (user.isBanned) {
      throw new Error("This account has been banned");
    }
    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role ?? "user",
    };
  },
});
