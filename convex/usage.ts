import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const createUsage = mutation({
  args: {
    userId: v.id("users"),
    model: v.string(),
    totalTokens: v.number(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    if (!usage) {
      await ctx.db.insert("usage", {
        userId: args.userId,
        model: args.model,
        totalTokens: args.totalTokens,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(usage._id, {
        totalTokens: usage.totalTokens + args.totalTokens,
      });
    }
  },
});

export const getUsage = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId! as Id<"users">))
      .first();
    return usage;
  },
});
