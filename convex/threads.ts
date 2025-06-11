import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getThreads = query({
  args: { userId: v.string() }, // Assuming you have a user ID
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc") // Order by last updated, or created at
      .take(200);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const threads = await ctx.db.insert("threads", {
      userId: args.userId,
      title: args.title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return threads;
  },
});

export const updateThreads = mutation({
  args: {
    threadId: v.id("threads"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.threadId, { title: args.newTitle });
  },
});
