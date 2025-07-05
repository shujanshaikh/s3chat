import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const createAttachment = mutation({
  args: {
    messageId: v.string(),
    fileUrl: v.string(),
    fileName: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const { messageId, fileUrl, fileName, contentType } = args;

    // Check if the message exists in the database by messageId
    const message = await ctx.db.get(messageId as any);
    if (!message) {
      throw new Error("Message not found in the database");
    }
  
    // Insert the attachment into the database
    const attachment = await ctx.db.insert("attachments", {
      messageId: messageId,
      name: fileName,
      url: fileUrl,
      contentType,
      createdAt: Date.now(),
    });

    console.log("attachment", attachment);
    return attachment;
  },
});

export const getAttachmentsByMessageId = query({
  args: { messageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attachments")
      .filter((q) => q.eq(q.field("messageId"), args.messageId))
      .collect();
  },
});