import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUsage = mutation({
  args: {
    clerkId: v.string(),
    messagesCount: v.number(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (!usage) {
      await ctx.db.insert("usage", {
        clerkId: args.clerkId,
        messagesCount: args.messagesCount,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(usage._id, {
        messagesCount: usage.messagesCount + args.messagesCount,
      });
    }
  },
});


export const getUsage = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    return usage;
  },
});
