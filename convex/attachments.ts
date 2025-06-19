import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createAttachment = mutation({
  args: {
    messageId: v.id("messages"), // Expecting a valid message ID
    fileUrl: v.string(),          // URL of the uploaded file
    fileName: v.string(),         // Name of the file
    contentType: v.string(),      // Content type of the file
  },
  handler: async (ctx, args) => {
    const { messageId, fileUrl, fileName, contentType } = args;

    // Check if the message exists
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error("Message not found");
    }
  
    // Insert the attachment into the database
    const attachment = await ctx.db.insert("attachments", {
      messageId: message._id, // Store the message ID
      name: fileName,       // Store the file name
      url: fileUrl,        // Store the file URL
      contentType,         // Store the content type
      createdAt: Date.now(), // Store the current timestamp
    });

    console.log("attachment", attachment);
    return attachment; // Return the created attachment
  },
});