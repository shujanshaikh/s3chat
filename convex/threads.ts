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
      .withIndex("by_userId", (q) => q.eq("userId", user.subject! as Id<"users">))
      .order("desc") // Order by last updated, or created at
      .take(200);
  },
});

export const create = mutation({
  args: {
    title: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (user == null) {
      throw new Error("Not Authorized");
    }
    const threads = await ctx.db.insert("threads", {
      userId: user.subject! as Id<"users">,
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
    const user = await ctx.auth.getUserIdentity();
    if (user == null) {
      throw new Error("Not Authorized");
    }
    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== user.subject!) {
      throw new Error("No Thread Found");
    }
    return ctx.db.patch(args.threadId, {
      title: args.newTitle,
      updatedAt: Date.now(),
    });
  },
});


export const createMessageSummary = mutation({
  args: {
    threadId: v.id("threads"),
    messageId: v.id("messages"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if(user == null) {
      throw new Error("Not Authorized");
    }
    const messageSummary = await ctx.db.insert("messages_summary", {
      threadId: args.threadId,
      messageId: args.messageId,
      title: args.title,
      createdAt: Date.now(),
    })
    return messageSummary;
  }
})