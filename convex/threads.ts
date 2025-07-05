import { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getThreads = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (user == null) {
      throw new Error("Not Authorized");
    }
    return await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject!))
      .order("desc") // Order by last updated, or created at
      .take(200);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    threadId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (user == null) {
      throw new Error("Not Authorized");
    }
    const threads = await ctx.db.insert("threads", {
      userId: user.subject!,
      title: args.title,
      threadId: args.threadId || crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return threads;
  },
});

export const updateThreads = mutation({
  args: {
    threadId: v.string(),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user == null) {
      throw new Error("Not Authorized");
    }
    
    const thread = await ctx.db
      .query("threads")
      .withIndex("by_userId", (q) => q.eq("userId", user.subject!))
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .first();
    
    if (!thread) {
      throw new Error("Thread not found");
    }
    
    return ctx.db.patch(thread._id, {
      title: args.newTitle,
      updatedAt: Date.now(),
    });
  },
});

export const createMessageSummary = mutation({
  args: {
    threadId: v.string(),
    messageId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if(user == null) {
      throw new Error("Not Authorized");
    }
    const messageSummary = await ctx.db.query("messages_summary").withIndex("by_thread", (q) => q.eq("threadId", args.threadId)).first();
    if(messageSummary) {
      return messageSummary;
    }
    return messageSummary;
  }
})

