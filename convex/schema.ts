import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
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
})


