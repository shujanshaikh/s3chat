import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createMessage = mutation({
  args: {
    threadId: v.id("threads"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user == null) {
      throw new Error("Not Authorized");
    }
    const thread = await ctx.db.get(args.threadId)
    if(!thread || thread.userId !== user.subject!) {
      throw new Error("No Thread Found")
    }

    const message = await ctx.db.insert("messages", {
      role: args.role,
      threadId: args.threadId,
      model: args.model,
      content: args.content,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.threadId, { updatedAt: Date.now() });
    return message;
  },
});

export const getMessages = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if(user == null) {
      throw new Error("Not Authorized")
    }

    const thread = await ctx.db.get(args.threadId)
    if(!thread || thread.userId !== user.subject!) {
      throw new Error("No Thread Found")
    }

    return await ctx.db
      .query("messages")
      .withIndex("by_thread_created_at", (q) => q.eq("threadId", args.threadId))
      .collect();
  },
});
