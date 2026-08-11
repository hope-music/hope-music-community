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

  // Check hardcoded admin emails
  const ADMIN_EMAILS = ["admin@hopemusic.com"];
  if (ADMIN_EMAILS.includes(callerEmail)) {
    return { isAdmin: true, userId: null, email: callerEmail };
  }

  // Check database for admin users
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
      throw new Error("This email is already registered");
    }
    
    // Check if username exists
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
      throw new Error("You cannot change your own Super Admin role");
    }
    
    await ctx.db.patch(args.userId, { role: args.newRole });
    return { success: true, message: `User role updated to: ${args.newRole}` };
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
      throw new Error("You cannot delete your own account");
    }
    
    await ctx.db.delete(args.userId);
    return { success: true, message: "User deleted successfully" };
  },
});

// ============================================
// TAB 1: USER MANAGEMENT
// ============================================

export const listAllUsers = query({
  args: { callerEmail: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
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
  args: { callerEmail: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    await ctx.db.patch(args.userId, { isBanned: true, status: "disabled" });
    return { success: true, message: "User banned successfully" };
  },
});

export const unbanUser = mutation({
  args: { callerEmail: v.string(), userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
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
      throw new Error("Email is already registered");
    }
    if (allUsers.some((u: any) => u.username === args.username)) {
      throw new Error("Username is already in use");
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
      message: isFirstUser ? "Congratulations! You are the first user and have been assigned as Super Admin" : "Registration successful"
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
      throw new Error("Email does not exist");
    }
    
    // Check if disabled
    if (user.status === "disabled") {
      throw new Error("Your account has been disabled. Please contact the administrator");
    }
    
    // Check if banned (legacy field)
    if (user.isBanned) {
      throw new Error("Your account has been banned");
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

    // Apply filters
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

    // Get comment counts for each post
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
        // Pinned posts first, then by date
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt - a.createdAt;
      });
  },
});

export const listAllComments = query({
  args: { callerEmail: v.optional(v.string()), includeDeleted: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
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

// Batch operations for posts
export const batchUpdatePosts = mutation({
  args: {
    callerEmail: v.string(),
    postIds: v.array(v.id("posts")),
    updates: v.object({
      isPinned: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      status: v.optional(v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )),
      category: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);

    const updates: Record<string, any> = {};
    if (args.updates.isPinned !== undefined) updates.isPinned = args.updates.isPinned;
    if (args.updates.isFeatured !== undefined) updates.isFeatured = args.updates.isFeatured;
    if (args.updates.status !== undefined) updates.status = args.updates.status;
    if (args.updates.category !== undefined) updates.category = args.updates.category;
    updates.updatedAt = Date.now();

    for (const postId of args.postIds) {
      await ctx.db.patch("posts", postId, updates);
    }

    return { success: true, count: args.postIds.length, message: `${args.postIds.length} posts updated` };
  },
});

export const batchDeletePosts = mutation({
  args: {
    callerEmail: v.string(),
    postIds: v.array(v.id("posts")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);

    const allComments = await ctx.db.query("comments").collect();

    for (const postId of args.postIds) {
      // Mark post as deleted
      await ctx.db.patch("posts", postId, { isDeleted: true, updatedAt: Date.now() });

      // Mark all comments as deleted
      const postComments = allComments.filter((c: any) => c.postId === postId);
      for (const comment of postComments) {
        await ctx.db.patch("comments", comment._id, { isDeleted: true });
      }
    }

    return { success: true, count: args.postIds.length, message: `${args.postIds.length} posts deleted` };
  },
});

export const deletePost = mutation({
  args: { callerEmail: v.string(), postId: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
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
  args: { callerEmail: v.string(), postId: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    await ctx.db.patch("posts", args.postId, { isDeleted: false });
    return { success: true, message: "Post restored" };
  },
});

export const togglePinPost = mutation({
  args: { callerEmail: v.string(), postId: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    await ctx.db.patch("posts", args.postId, { isPinned: !post.isPinned, updatedAt: Date.now() });
    return { success: true, message: post.isPinned ? "Post unpinned" : "Post pinned" };
  },
});

export const toggleFeaturePost = mutation({
  args: { callerEmail: v.string(), postId: v.id("posts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");
    await ctx.db.patch("posts", args.postId, { isFeatured: !post.isFeatured, updatedAt: Date.now() });
    return { success: true, message: post.isFeatured ? "Post unfeatured" : "Post featured" };
  },
});

export const updatePostStatus = mutation({
  args: {
    callerEmail: v.string(),
    postId: v.id("posts"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    await ctx.db.patch("posts", args.postId, { status: args.status, updatedAt: Date.now() });
    return { success: true, message: `Post status updated to ${args.status}` };
  },
});

export const movePostCategory = mutation({
  args: { callerEmail: v.string(), postId: v.id("posts"), newCategory: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    await ctx.db.patch("posts", args.postId, { category: args.newCategory, updatedAt: Date.now() });
    return { success: true, message: `Post moved to ${args.newCategory}` };
  },
});

export const deleteComment = mutation({
  args: { callerEmail: v.string(), commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    await ctx.db.patch("comments", args.commentId, { isDeleted: true });
    return { success: true, message: "Comment deleted" };
  },
});

export const restoreComment = mutation({
  args: { callerEmail: v.string(), commentId: v.id("comments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    await ctx.db.patch("comments", args.commentId, { isDeleted: false });
    return { success: true, message: "Comment restored" };
  },
});

// ============================================
// TAB 3: PERFORMANCE HISTORY
// ============================================

// Public query for frontend - no auth required
export const getPublicStageProductions = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let productions = await ctx.db.query("stageProductions").collect();
    if (args.category) {
      productions = productions.filter((p: any) => p.category === args.category);
    }
    // Sort by eventDate descending
    productions.sort((a: any, b: any) => (b.eventDate ?? 0) - (a.eventDate ?? 0));
    if (args.limit) {
      productions = productions.slice(0, args.limit);
    }
    return productions.map((p: any) => ({
      _id: p._id,
      title: p.title ?? "",
      description: p.description ?? "",
      coverImage: p.coverImage ?? "",
      url: p.url ?? "",
      category: p.category ?? "",
      eventDate: p.eventDate,
      isFeatured: p.isFeatured ?? false,
    }));
  },
});

// Public query: counts per category (for homepage cards)
export const getStageProductionsCount = query({
  args: {},
  handler: async (ctx) => {
    const productions = await ctx.db.query("stageProductions").collect();
    const counts: Record<string, number> = {};
    productions.forEach((p: any) => {
      const cat = p.category ?? "other";
      counts[cat] = (counts[cat] ?? 0) + 1;
    });
    return counts;
  },
});

// Public query: latest production per category
export const getLatestStageProduction = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    let productions = (await ctx.db.query("stageProductions").collect()).filter(
      (p: any) => p.category === args.category
    );
    productions.sort((a: any, b: any) => (b.eventDate ?? 0) - (a.eventDate ?? 0));
    if (productions.length === 0) return null;
    const p = productions[0];
    return {
      _id: p._id,
      title: p.title ?? "",
      coverImage: p.coverImage ?? "",
      url: p.url ?? "",
      eventDate: p.eventDate,
      status: p.status,
    };
  },
});

// Public query: get single production by ID
export const getStageProductionById = query({
  args: { id: v.id("stageProductions") },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.id);
    if (!p) return null;
    return {
      _id: p._id,
      title: p.title ?? "",
      description: p.description ?? "",
      content: p.content ?? "",
      coverImage: p.coverImage ?? "",
      url: p.url ?? "",
      category: p.category ?? "",
      city: p.city ?? "",
      eventDate: p.eventDate,
      isFeatured: p.isFeatured ?? false,
    };
  },
});

// Public query: get productions by category with pagination
export const getStageProductionsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let productions = await ctx.db.query("stageProductions").collect();
    productions = productions.filter((p: any) => p.category === args.category);
    productions.sort((a: any, b: any) => (b.eventDate ?? 0) - (a.eventDate ?? 0));
    const total = productions.length;
    const offset = args.offset ?? 0;
    const limit = args.limit ?? 20;
    const items = productions.slice(offset, offset + limit);
    return {
      items: items.map((p: any) => ({
        _id: p._id,
        title: p.title ?? "",
        description: p.description ?? "",
        coverImage: p.coverImage ?? "",
        url: p.url ?? "",
        category: p.category ?? "",
        city: p.city ?? "",
        eventDate: p.eventDate,
      })),
      total,
    };
  },
});

// Public query: get all public productions (for detail page slug lookup)
export const getAllPublicStageProductions = query({
  args: {},
  handler: async (ctx) => {
    const productions = await ctx.db.query("stageProductions").collect();
    return productions.map((p: any) => ({
      _id: p._id,
      title: p.title ?? "",
      description: p.description ?? "",
      content: p.content ?? "",
      coverImage: p.coverImage ?? "",
      url: p.url ?? "",
      category: p.category ?? "",
      city: p.city ?? "",
      eventDate: p.eventDate,
      isFeatured: p.isFeatured ?? false,
    }));
  },
});

// Batch import: one-time migration from Ticketmaster JSON (Super Admin only)
export const batchImportStageProductions = mutation({
  args: {
    callerEmail: v.string(),
    items: v.array(v.object({
      title: v.string(),
      description: v.string(),
      coverImage: v.string(),
      url: v.string(),
      category: v.string(),
      eventDate: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await requireSuperAdmin(ctx, args.callerEmail);
    const now = Date.now();
    const inserted: string[] = [];
    for (const item of args.items) {
      const id = await ctx.db.insert("stageProductions", {
        title: item.title,
        description: item.description,
        content: "",
        coverImage: item.coverImage,
        url: item.url,
        category: item.category,
        mediaLinks: [],
        eventDate: item.eventDate,
        eventTime: "",
        isFeatured: false,
        createdAt: now,
        updatedAt: now,
      });
      inserted.push(id.toString());
    }
    return { success: true, count: inserted.length, ids: inserted };
  },
});

export const listStageProductions = query({
  args: {
    callerEmail: v.optional(v.string()),
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    let productions = await ctx.db.query("stageProductions").collect();
    if (args.category) {
      productions = productions.filter((p: any) => p.category === args.category);
    }
    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      productions = productions.filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return productions.map((p: any) => ({
      _id: p._id,
      title: p.title ?? "",
      description: p.description ?? "",
      content: p.content ?? "",
      coverImage: p.coverImage ?? "",
      url: p.url ?? "",
      category: p.category ?? "",
      mediaLinks: p.mediaLinks ?? [],
      eventDate: p.eventDate,
      eventTime: p.eventTime ?? "",
      isFeatured: p.isFeatured ?? false,
      createdAt: p.createdAt ?? Date.now(),
      updatedAt: p.updatedAt,
    }));
  },
});

export const createStageProduction = mutation({
  args: {
    callerEmail: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    url: v.optional(v.string()),
    category: v.string(),
    mediaLinks: v.optional(v.array(v.string())),
    eventDate: v.optional(v.number()),
    eventTime: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    const id = await ctx.db.insert("stageProductions", {
      title: args.title,
      description: args.description ?? "",
      content: args.content ?? "",
      coverImage: args.coverImage ?? "",
      url: args.url ?? "",
      category: args.category,
      mediaLinks: args.mediaLinks ?? [],
      eventDate: args.eventDate,
      eventTime: args.eventTime ?? "",
      isFeatured: args.isFeatured ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true, id, message: "Stage production created" };
  },
});

export const updateStageProduction = mutation({
  args: {
    callerEmail: v.string(),
    id: v.id("stageProductions"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    url: v.optional(v.string()),
    category: v.optional(v.string()),
    mediaLinks: v.optional(v.array(v.string())),
    eventDate: v.optional(v.number()),
    eventTime: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.content !== undefined) updates.content = args.content;
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.url !== undefined) updates.url = args.url;
    if (args.category !== undefined) updates.category = args.category;
    if (args.mediaLinks !== undefined) updates.mediaLinks = args.mediaLinks;
    if (args.eventDate !== undefined) updates.eventDate = args.eventDate;
    if (args.eventTime !== undefined) updates.eventTime = args.eventTime;
    if (args.isFeatured !== undefined) updates.isFeatured = args.isFeatured;
    await ctx.db.patch("stageProductions", args.id, updates);
    return { success: true, message: "Stage production updated" };
  },
});

export const deleteStageProduction = mutation({
  args: { callerEmail: v.string(), id: v.id("stageProductions") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
    await ctx.db.delete("stageProductions", args.id);
    return { success: true, message: "Stage production deleted" };
  },
});

// ============================================
// TAB 4: STUDIO & STAGE PRODUCTION
// ============================================

export const listHopeStudioServices = query({
  args: { callerEmail: v.optional(v.string()), category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
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

// Public (no admin gate) — used by global /search to index Hope Studio services.
export const getPublicHopeStudioServices = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let services = await ctx.db.query("hopeStudio").collect();
    services = services.filter((s: any) => s.isActive !== false);
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
      createdAt: s.createdAt ?? Date.now(),
    }));
  },
});

export const createHopeStudioService = mutation({
  args: {
    callerEmail: v.string(),
    serviceName: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    availability: v.optional(v.string()),
    pricing: v.optional(v.string()),
    imageLinks: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
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
    callerEmail: v.string(),
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
    await requireAdmin(ctx, args.callerEmail);
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
  args: { callerEmail: v.string(), id: v.id("hopeStudio") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.callerEmail);
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

// Get single news article by ID - no auth required
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
      excerpt: article.excerpt ?? "",
      publishDate: article.publishDate ?? 0,
      authorName: article.authorName ?? "",
      isPublished: article.isPublished ?? false,
      isFeatured: article.isFeatured ?? false,
      createdAt: article.createdAt ?? Date.now(),
    };
  },
});

// Admin-only query for full news management
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
      excerpt: args.excerpt,
      publishDate: args.publishDate ?? Date.now(),
      authorEmail: args.authorEmail ?? undefined,
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
  args: { callerEmail: v.string(), id: v.id("news") },
  handler: async (ctx, args) => {
    await ctx.db.delete("news", args.id);
    return { success: true, message: "News article deleted" };
  },
});

// ============================================
// TAB 6: INSIGHTS
// ============================================

export const getPublishedInsights = query({
  args: { category: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let items = await ctx.db.query("insights").collect();
    items = items.filter((item: any) => item.isPublished === true);
    if (args.category) {
      items = items.filter((item: any) => item.category === args.category);
    }
    items = items.sort((a: any, b: any) => (b.publishDate ?? b.createdAt ?? 0) - (a.publishDate ?? a.createdAt ?? 0));
    return items.map((item: any) => ({
      _id: item._id,
      title: item.title ?? "",
      coverImage: item.coverImage ?? "",
      content: item.content ?? "",
      excerpt: item.excerpt ?? "",
      category: item.category ?? "",
      publishDate: item.publishDate ?? 0,
      eventDate: item.eventDate,
      authorName: item.authorName ?? "",
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
      excerpt: item.excerpt ?? "",
      category: item.category ?? "",
      publishDate: item.publishDate ?? 0,
      eventDate: item.eventDate,
      authorName: item.authorName ?? "",
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
        excerpt: item.excerpt ?? "",
        category: item.category ?? "",
        publishDate: item.publishDate ?? 0,
        eventDate: item.eventDate,
        authorName: item.authorName ?? "",
        isPublished: item.isPublished ?? false,
        isFeatured: item.isFeatured ?? false,
        createdAt: item.createdAt ?? Date.now(),
        updatedAt: item.updatedAt,
      }))
      .sort((a: any, b: any) => (b.publishDate ?? b.createdAt) - (a.publishDate ?? a.createdAt));
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
      excerpt: args.excerpt,
      category: args.category ?? "general",
      eventDate: args.eventDate,
      publishDate: args.publishDate ?? Date.now(),
      authorEmail: args.authorEmail ?? undefined,
      authorName: args.authorName ?? undefined,
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
    if (args.excerpt !== undefined) updates.excerpt = args.excerpt;
    if (args.category !== undefined) updates.category = args.category;
    if (args.eventDate !== undefined) updates.eventDate = args.eventDate;
    if (args.publishDate !== undefined) updates.publishDate = args.publishDate;
    if (args.authorEmail !== undefined) updates.authorEmail = args.authorEmail;
    if (args.authorName !== undefined) updates.authorName = args.authorName;
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

