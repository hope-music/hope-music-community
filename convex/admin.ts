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
// FILE STORAGE: Get File URL
// ============================================
export const getFileUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// ============================================
// HELPER: Require Super Admin
// ============================================
const ADMIN_EMAILS = ["admin@hopemusic.com"];

async function requireSuperAdmin(ctx: any, email: string | null): Promise<any> {
  if (!email) {
    throw new Error("Please log in first");
  }

  if (ADMIN_EMAILS.includes(email)) {
    return {
      _id: "admin",
      email: email,
      username: "Administrator",
      role: "super_admin",
      status: "active"
    };
  }

  const allUsers = await ctx.db.query("users").collect();
  const user = allUsers.find((u: any) => u.email === email);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "super_admin") {
    throw new Error("Insufficient permissions: Super Admin access required");
  }
  if (user.status === "disabled") {
    throw new Error("Your account has been disabled");
  }
  return user;
}

// ============================================
// HELPER: Require Admin Authentication
// ============================================
async function requireAdmin(ctx: any, callerEmail?: string | null): Promise<{ isAdmin: boolean; userId: string | null; email: string | null }> {
  if (!callerEmail) {
    throw new Error("Unauthorized: Please login first");
  }

  const ADMIN_EMAILS = ["admin@hopemusic.com"];
  if (ADMIN_EMAILS.includes(callerEmail)) {
    return { isAdmin: true, userId: null, email: callerEmail };
  }

  const allUsers = await ctx.db.query("users").collect();
  const user = allUsers.find((u: any) => u.email === callerEmail);

  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  if (user.role !== "super_admin" && user.role !== "operator") {
    throw new Error("Unauthorized: Admin access required");
  }

  if (user.status === "disabled" || user.isBanned) {
    throw new Error("Unauthorized: Account is disabled");
  }

  return { isAdmin: true, userId: user._id, email: callerEmail };
}

// ============================================
// RBAC: Employee Management (Super Admin Only)
// ============================================

export const listEmployees = query({
  args: { callerEmail: v.string() },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);
    const allUsers = await ctx.db.query("users").collect();
    return allUsers.map((u: any) => ({
      _id: u._id,
      email: u.email ?? "",
      username: u.username ?? "",
      avatar: u.avatar ?? "",
      role: u.role ?? "member",
      status: u.status ?? "active",
      createdAt: u.createdAt ?? Date.now(),
    })).sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

export const createEmployee = mutation({
  args: {
    callerEmail: v.string(),
    email: v.string(),
    username: v.string(),
    avatar: v.string(),
    role: v.union(
      v.literal("super_admin"),
      v.literal("operator"),
      v.literal("member")
    ),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);

    const allUsers = await ctx.db.query("users").collect();

    if (allUsers.some((u: any) => u.email === args.email)) {
      throw new Error("This email is already registered");
    }

    if (allUsers.some((u: any) => u.username === args.username)) {
      throw new Error("This username is already in use");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      username: args.username,
      avatar: args.avatar,
      role: args.role,
      status: "active",
      createdAt: Date.now(),
      isBanned: false,
    });

    return {
      success: true,
      userId,
      message: `Employee created successfully with role: ${args.role}`
    };
  },
});

export const toggleUserStatus = mutation({
  args: {
    callerEmail: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);

    const allUsers = await ctx.db.query("users").collect();
    const caller = allUsers.find((u: any) => u.email === args.callerEmail);
    if (caller && caller._id === args.userId) {
      throw new Error("You cannot disable your own account");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const newStatus = user.status === "disabled" ? "active" : "disabled";
    await ctx.db.patch(args.userId, { status: newStatus });

    return {
      success: true,
      message: `User status updated to: ${newStatus === "active" ? "Active" : "Disabled"}`
    };
  },
});

export const updateUserRole = mutation({
  args: {
    callerEmail: v.string(),
    userId: v.id("users"),
    newRole: v.union(
      v.literal("super_admin"),
      v.literal("operator"),
      v.literal("member")
    ),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);

    const allUsers = await ctx.db.query("users").collect();
    const caller = allUsers.find((u: any) => u.email === args.callerEmail);
    if (caller && caller._id === args.userId && args.newRole !== "super_admin") {
      throw new Error("You cannot change your own Super Admin role");
    }

    await ctx.db.patch(args.userId, { role: args.newRole });
    return { success: true, message: `User role updated to: ${args.newRole}` };
  },
});

export const deleteUser = mutation({
  args: {
    callerEmail: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);

    const allUsers = await ctx.db.query("users").collect();
    const caller = allUsers.find((u: any) => u.email === args.callerEmail);
    if (caller && caller._id === args.userId) {
      throw new Error("You cannot delete your own account");
    }

    await ctx.db.delete(args.userId);
    return { success: true, message: "User deleted successfully" };
  },
});

// ============================================
// COMMUNITY FEED: Posts (used by interaction/[category]/page.tsx)
// ============================================

export const listAllPosts = query({
  args: {
    callerEmail: v.optional(v.string()),
    includeDeleted: v.optional(v.boolean()),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    authorEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    let allPosts = await ctx.db.query("posts").collect();

    if (!args.includeDeleted) {
      allPosts = allPosts.filter((p: any) => !p.isDeleted);
    }
    if (args.category) {
      allPosts = allPosts.filter((p: any) => p.category === args.category);
    }
    if (args.status) {
      allPosts = allPosts.filter((p: any) => (p.status ?? "approved") === args.status);
    }
    if (args.authorEmail) {
      allPosts = allPosts.filter((p: any) => p.authorEmail === args.authorEmail);
    }
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      allPosts = allPosts.filter((p: any) =>
        p.title?.toLowerCase().includes(query) ||
        p.content?.toLowerCase().includes(query) ||
        p.authorUsername?.toLowerCase().includes(query)
      );
    }

    const allComments = await ctx.db.query("comments").collect();
    const commentCounts = new Map<string, number>();
    allComments.forEach((c: any) => {
      if (!c.isDeleted) {
        const count = commentCounts.get(c.postId) || 0;
        commentCounts.set(c.postId, count + 1);
      }
    });

    return allPosts
      .map((p: any) => ({
        _id: p._id,
        authorEmail: p.authorEmail ?? "",
        authorUsername: p.authorUsername ?? "",
        authorAvatar: p.authorAvatar ?? "",
        title: p.title ?? "",
        content: p.content ?? "",
        category: p.category ?? "",
        isDeleted: p.isDeleted ?? false,
        isPinned: p.isPinned ?? false,
        isFeatured: p.isFeatured ?? false,
        views: p.views ?? 0,
        tags: p.tags ?? [],
        status: p.status ?? "approved",
        replyCount: commentCounts.get(p._id) || 0,
        createdAt: p.createdAt ?? Date.now(),
        updatedAt: p.updatedAt,
      }))
      .sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt - a.createdAt;
      });
  },
});

// ============================================
// NEWS CENTER
// ============================================

export const getPublishedNews = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      let articles = await ctx.db.query("news").collect();
      articles = articles.filter((n: any) => n.isPublished !== false && n.isPublished != null);
      articles = articles.sort((a: any, b: any) =>
        (b.createdAt ?? 0) - (a.createdAt ?? 0)
      );
      if (args.limit) {
        articles = articles.slice(0, args.limit);
      }
      return articles.map((n: any) => ({
        _id: n._id,
        title: n.title ?? "",
        coverImage: n.coverImage ?? n.image ?? "",
        content: n.content ?? "",
        excerpt: n.summary ?? "",
        publishDate: n.createdAt ?? 0,
        authorName: n.author ?? "",
        isPublished: n.isPublished ?? false,
        isFeatured: n.isFeatured ?? false,
      }));
    } catch (e: any) {
      console.error("getPublishedNews error:", e);
      return [];
    }
  },
});

export const getNewsById = query({
  args: { id: v.id("news") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article || article.isPublished !== true) {
      return null;
    }
    return {
      _id: article._id,
      title: article.title ?? "",
      coverImage: (article.coverImage as string) ?? "",
      content: article.content ?? "",
      excerpt: article.summary ?? "",
      publishDate: article.createdAt ?? 0,
      authorName: article.author ?? "",
      isPublished: article.isPublished ?? false,
      isFeatured: article.isFeatured ?? false,
      createdAt: article.createdAt ?? Date.now(),
    };
  },
});

export const listNews = query({
  args: {
    callerEmail: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
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
      excerpt: n.summary ?? "",
      publishDate: n.createdAt ?? 0,
      authorEmail: n.authorEmail ?? "",
      authorName: n.author ?? "",
      isPublished: n.isPublished ?? false,
      isFeatured: n.isFeatured ?? false,
      createdAt: n.createdAt ?? Date.now(),
      updatedAt: n.updatedAt,
    })).sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
});

export const createNewsArticle = mutation({
  args: {
    callerEmail: v.string(),
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
    const id = await ctx.db.insert("news", {
      title: args.title,
      coverImage: args.coverImage,
      content: args.content,
      summary: args.excerpt,
      author: args.authorName,
      authorEmail: args.authorEmail ?? undefined,
      isPublished: args.isPublished ?? true,
      isFeatured: args.isFeatured ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true, id, message: "News article created" };
  },
});

export const updateNewsArticle = mutation({
  args: {
    callerEmail: v.string(),
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
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.content !== undefined) updates.content = args.content;
    if (args.excerpt !== undefined) updates.summary = args.excerpt;
    if (args.publishDate !== undefined) updates.createdAt = args.publishDate;
    if (args.authorEmail !== undefined) updates.authorEmail = args.authorEmail;
    if (args.authorName !== undefined) updates.author = args.authorName;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.isFeatured !== undefined) updates.isFeatured = args.isFeatured;
    await ctx.db.patch("news", args.id, updates);
    return { success: true, message: "News article updated" };
  },
});

export const deleteNewsArticle = mutation({
  args: { callerEmail: v.string(), id: v.id("news") },
  handler: async (ctx, args) => {
    await ctx.db.delete("news", args.id);
    return { success: true, message: "News article deleted" };
  },
});

// ============================================
// INSIGHTS
// ============================================

export const getPublishedInsights = query({
  args: { category: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("insights").collect();
    items = items.filter((item: any) => item.isPublished === true);
    if (args.category) {
      items = items.filter((item: any) => item.category === args.category);
    }
    items = items.sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return items.map((item: any) => ({
      _id: item._id,
      title: item.title ?? "",
      coverImage: item.coverImage ?? "",
      content: item.content ?? "",
      excerpt: item.summary ?? "",
      category: item.category ?? "",
      publishDate: item.createdAt ?? 0,
      eventDate: item.eventDate,
      authorName: item.author ?? "",
      isPublished: item.isPublished ?? false,
      isFeatured: item.isFeatured ?? false,
    }));
  },
});

export const getInsightById = query({
  args: { id: v.id("insights") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item || item.isPublished !== true) return null;
    return {
      _id: item._id,
      title: item.title ?? "",
      coverImage: item.coverImage ?? "",
      content: item.content ?? "",
      excerpt: item.summary ?? "",
      category: item.category ?? "",
      publishDate: item.createdAt ?? 0,
      eventDate: item.eventDate,
      authorName: item.author ?? "",
      isPublished: item.isPublished ?? false,
      isFeatured: item.isFeatured ?? false,
      createdAt: item.createdAt ?? Date.now(),
    };
  },
});

export const listInsights = query({
  args: {
    callerEmail: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("insights").collect();
    if (args.category) {
      items = items.filter((item: any) => item.category === args.category);
    }
    return items
      .map((item: any) => ({
        _id: item._id,
        title: item.title ?? "",
        coverImage: item.coverImage ?? "",
        content: item.content ?? "",
        excerpt: item.summary ?? "",
        category: item.category ?? "",
        publishDate: item.createdAt ?? 0,
        eventDate: item.eventDate,
        authorName: item.author ?? "",
        isPublished: item.isPublished ?? false,
        isFeatured: item.isFeatured ?? false,
        createdAt: item.createdAt ?? Date.now(),
        updatedAt: item.updatedAt,
      }))
      .sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  },
});

export const createInsight = mutation({
  args: {
    callerEmail: v.string(),
    title: v.string(),
    coverImage: v.optional(v.string()),
    content: v.string(),
    excerpt: v.optional(v.string()),
    category: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    publishDate: v.optional(v.number()),
    authorEmail: v.optional(v.string()),
    authorName: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("insights", {
      title: args.title,
      coverImage: args.coverImage,
      content: args.content,
      summary: args.excerpt,
      author: args.authorName,
      authorEmail: args.authorEmail ?? undefined,
      category: args.category ?? "general",
      eventDate: args.eventDate,
      isPublished: args.isPublished ?? false,
      isFeatured: args.isFeatured ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true, id, message: "Insight created" };
  },
});

export const updateInsight = mutation({
  args: {
    callerEmail: v.string(),
    id: v.id("insights"),
    title: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    category: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    publishDate: v.optional(v.number()),
    authorEmail: v.optional(v.string()),
    authorName: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.content !== undefined) updates.content = args.content;
    if (args.excerpt !== undefined) updates.summary = args.excerpt;
    if (args.category !== undefined) updates.category = args.category;
    if (args.eventDate !== undefined) updates.eventDate = args.eventDate;
    if (args.publishDate !== undefined) updates.createdAt = args.publishDate;
    if (args.authorEmail !== undefined) updates.authorEmail = args.authorEmail;
    if (args.authorName !== undefined) updates.author = args.authorName;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.isFeatured !== undefined) updates.isFeatured = args.isFeatured;
    await ctx.db.patch("insights", args.id, updates);
    return { success: true, message: "Insight updated" };
  },
});

export const deleteInsight = mutation({
  args: { callerEmail: v.string(), id: v.id("insights") },
  handler: async (ctx, args) => {
    await ctx.db.delete("insights", args.id);
    return { success: true, message: "Insight deleted" };
  },
});

// ============================================
// HOPE STUDIO SERVICES (used by SearchPageClient.tsx)
// ============================================

export const getPublicHopeStudioServices = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let services = await ctx.db.query("hopeStudioServices").collect();
    services = services.filter((s: any) => s.isActive !== false);
    if (args.category) {
      services = services.filter((s: any) => s.category === args.category);
    }
    return services.map((s: any) => ({
      _id: s._id,
      serviceName: s.title ?? "",
      description: s.description ?? "",
      category: s.category ?? "",
      availability: s.availability ?? "",
      pricing: s.pricing ?? "",
      imageLinks: s.imageLinks ?? [],
      createdAt: s.createdAt ?? Date.now(),
    }));
  },
});
