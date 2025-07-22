import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
  users : defineTable({
    clerkId : v.string(),
    name : v.string(),
    email : v.string(),
    plan : v.string(),
    createdAt : v.number(),
  }).index("by_clerkId", ["clerkId"]),


   threads : defineTable({
    clerkId : v.optional(v.string()),
    userId : v.optional(v.string()),
    title : v.string(),
    threadId : v.string(),
    createdAt : v.number(),
    updatedAt : v.number(),
   }).index("by_clerkId", ["clerkId"]).index("by_threadId", ["threadId"]),


   messages : defineTable({
    assistantId : v.optional(v.string()),
    threadId : v.string(),
    role : v.union(v.literal("user"), v.literal("assistant") , v.literal("system")),
    model : v.string(),
    content : v.string(),
    parts : v.optional(v.any()),
    attachments : v.optional(v.any()),
    createdAt : v.number(),
   }).index("by_thread", ["threadId"])
   .index("by_thread_created_at", ["threadId", "createdAt"]),


   messages_summary : defineTable({
    threadId : v.string(),
    messageId : v.optional(v.id("messages")),
    title : v.string(),
    createdAt : v.number(),
  }).index("by_thread", ["threadId"]),


  usage : defineTable({
    clerkId : v.string(),
    messagesCount : v.number(),
    createdAt : v.number(),
  }).index("by_clerkId", ["clerkId"]),


  attachments : defineTable({
    messageId : v.string(),
    name : v.string(),
    url : v.string(),
    contentType : v.string(),
    createdAt : v.number(),
  }).index("by_messageId", ["messageId"]),
});