import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
  users : defineTable({
    clerkId : v.string(),
    name : v.string(),
    email : v.string(),
    plan : v.union(v.literal("free"), v.literal("pro")),
    createdAt : v.number(),
  }).index("by_clerkId", ["clerkId"]),


   threads : defineTable({
    userId : v.string(),
    title : v.string(),
    createdAt : v.number(),
    updatedAt : v.number(),
   }).index("by_userId", ["userId"]),


   messages : defineTable({
    threadId : v.id("threads"),
    role : v.union(v.literal("user"), v.literal("assistant") , v.literal("system")),
    model : v.string(),
    content : v.string(),
    createdAt : v.number(),
   }).index("by_thread", ["threadId"])
   .index("by_thread_created_at", ["threadId", "createdAt"]),


   messages_summary : defineTable({
    threadId : v.id("threads"),
    messageId : v.optional(v.id("messages")),
    title : v.string(),
    createdAt : v.number(),
  }).index("by_thread", ["threadId"]),


  usage : defineTable({
    userId : v.id("users"),
    model : v.string(),
    totalTokens : v.number(),
    createdAt : v.number(),
  }).index("by_userId", ["userId"]),

});