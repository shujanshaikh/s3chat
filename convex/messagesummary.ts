import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createMessageSummary = mutation({
    args: {
      threadId: v.id("threads"),
      title: v.string(),
    },
    handler: async (ctx, args) => {
      const user = await ctx.auth.getUserIdentity();
      if(user == null) {
        throw new Error("Not Authorized");
      }
      const messageSummary = await ctx.db.insert("messages_summary", {
        threadId: args.threadId,
        title: args.title,
        createdAt: Date.now(),
      })
      return messageSummary;
    }
  })