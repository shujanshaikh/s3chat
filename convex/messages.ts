import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createMessage = mutation({
  args: {
    assistantId: v.optional(v.string()),
    threadId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    model: v.string(),
    parts: v.optional(v.any()),
    attachments: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    

    const message = await ctx.db.insert("messages", {
      assistantId: args.assistantId,
      role: args.role,
      threadId: args.threadId,
      model: args.model,
      content: args.content,  
      parts: args.parts,
      attachments: args.attachments,
      createdAt: Date.now(),
    });
   // await ctx.db.patch(args.threadId, { updatedAt: Date.now() });
    return message;
  },
});

export const getMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
   
    return await ctx.db
      .query("messages")
      .withIndex("by_thread_created_at", (q) => q.eq("threadId", args.threadId))
      .collect();
  },
});

export const getMessageById = query({
  args: { messageId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user == null) {
      throw new Error("Not Authorized");
    }

    const message = await ctx.db.query("messages").withIndex("by_thread", (q) => q.eq("threadId", args.messageId)).first();
    if (!message || message.threadId !== user.subject!) {
      throw new Error("No Message Found");
    }
    console.log("message", message._id);
    return message;
  },
});



export const getMessageCountByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (user == null) {
      throw new Error("Not Authorized");
    }
    
    // Calculate 28 days ago timestamp
    const twentyEightDaysAgo = Date.now() - 28 * 24 * 60 * 60 * 1000;
    
    // Get all user messages from the last 28 days
    const userMessages = await ctx.db
      .query("messages")
      .withIndex("by_thread_created_at")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), twentyEightDaysAgo),
          q.eq(q.field("role"), "user")
        )
      )
      .collect();
    
    // Filter messages that belong to user's threads
    const userThreads = await ctx.db
      .query("threads")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.userId))
      .collect();
    
    const userThreadIds = new Set(userThreads.map(thread => thread.threadId));
    
    const filteredMessages = userMessages.filter(message => 
      userThreadIds.has(message.threadId)
    );
    
    return filteredMessages.length;
  },
});