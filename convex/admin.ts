import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ============================================
// AUTH: Get Current User (for frontend use)
// ============================================
export const getCurrentUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find((u: any) => u.email === args.email);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role ?? "member",
      status: user.status ?? "active",
    };
  },
});

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
// HELPER: Require Super Admin
// ============================================
const ADMIN_EMAILS = ["admin@hopemusic.com"];

async function requireSuperAdmin(ctx: any, email: string | null): Promise<any> {
  if (!email) {
    throw new Error("请先登录");
  }
  
  // Allow special admin emails to bypass database check (they're protected by password login)
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
    throw new Error("用户不存在");
  }
  if (user.role !== "super_admin") {
    throw new Error("权限不足，需要 Super Admin 权限");
  }
  if (user.status === "disabled") {
    throw new Error("您的账号已被禁用");
  }
  return user;
}

// ============================================
// HELPER: Skip Admin Authentication (for backward compatibility)
// ============================================
async function requireAdmin(ctx: any): Promise<{ isAdmin: boolean; userId: string | null; email: string | null }> {
  return { isAdmin: true, userId: null, email: null };
}

// ============================================
// RBAC: Employee Management (Super Admin Only)
// ============================================

// List all employees - Super Admin only
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

// Create new employee - Super Admin only
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
    
    // Check if email exists
    if (allUsers.some((u: any) => u.email === args.email)) {
      throw new Error("该邮箱已被注册");
    }
    
    // Check if username exists
    if (allUsers.some((u: any) => u.username === args.username)) {
      throw new Error("该用户名已被使用");
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

// Toggle user status (active <-> disabled) - Super Admin only
export const toggleUserStatus = mutation({
  args: {
    callerEmail: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);
    
    // Prevent self-disable
    const allUsers = await ctx.db.query("users").collect();
    const caller = allUsers.find((u: any) => u.email === args.callerEmail);
    if (caller && caller._id === args.userId) {
      throw new Error("不能禁用自己的账号");
    }
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("用户不存在");
    }
    
    const newStatus = user.status === "disabled" ? "active" : "disabled";
    await ctx.db.patch(args.userId, { status: newStatus });
    
    return { 
      success: true, 
      message: `用户状态已更新为：${newStatus === "active" ? "启用" : "禁用"}` 
    };
  },
});

// Update user role - Super Admin only
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
    
    // Prevent self-demote
    const allUsers = await ctx.db.query("users").collect();
    const caller = allUsers.find((u: any) => u.email === args.callerEmail);
    if (caller && caller._id === args.userId && args.newRole !== "super_admin") {
      throw new Error("不能修改自己的超级管理员角色");
    }
    
    await ctx.db.patch(args.userId, { role: args.newRole });
    return { success: true, message: `用户角色已更新为：${args.newRole}` };
  },
});

// Delete user - Super Admin only
export const deleteUser = mutation({
  args: {
    callerEmail: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);
    
    // Prevent self-delete
    const allUsers = await ctx.db.query("users").collect();
    const caller = allUsers.find((u: any) => u.email === args.callerEmail);
    if (caller && caller._id === args.userId) {
      throw new Error("不能删除自己的账号");
    }
    
    await ctx.db.delete(args.userId);
    return { success: true, message: "用户已删除" };
  },
});

// ============================================
// TAB 1: USER MANAGEMENT (Legacy - kept for backward compatibility)
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
      role: u.role ?? "member",
      status: u.status ?? "active",
      isBanned: u.isBanned ?? false,
      createdAt: u.createdAt ?? Date.now(),
    }));
  },
});

export const banUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isBanned: true, status: "disabled" });
    return { success: true, message: "User banned successfully" };
  },
});

export const unbanUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.userId, { isBanned: false, status: "active" });
    return { success: true, message: "User unbanned successfully" };
  },
});

// ============================================
// AUTH: Register with Auto Super Admin Logic
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
      throw new Error("邮箱已被注册");
    }
    if (allUsers.some((u: any) => u.username === args.username)) {
      throw new Error("用户名已被使用");
    }
    
    // First user becomes super_admin automatically
    const isFirstUser = allUsers.length === 0;
    const role = isFirstUser ? "super_admin" : "member";
    
    const userId = await ctx.db.insert("users", {
      email: args.email,
      username: args.username,
      avatar: args.avatar,
      role: role,
      status: "active",
      createdAt: Date.now(),
      isBanned: false,
    });
    
    return { 
      userId, 
      email: args.email, 
      username: args.username, 
      avatar: args.avatar,
      role: role,
      message: isFirstUser ? "恭喜！您成为系统第一个用户，已被设为超级管理员" : "注册成功"
    };
  },
});

// ============================================
// AUTH: Login with Status Check
// ============================================
export const login = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query("users").collect();
    const user = allUsers.find((u: any) => u.email === args.email);
    
    if (!user) {
      throw new Error("邮箱不存在");
    }
    
    // Check if disabled
    if (user.status === "disabled") {
      throw new Error("您的账号已被禁用，请联系管理员");
    }
    
    // Check if banned (legacy field)
    if (user.isBanned) {
      throw new Error("您的账号已被封禁");
    }
    
    return {
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role ?? "member",
      status: user.status ?? "active",
    };
  },
});

// ============================================
// TAB 2: COMMUNITY FEED (Posts & Comments)
// ============================================

export const listAllPosts = query({
  args: { includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx) => {
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
  handler: async (ctx) => {
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
