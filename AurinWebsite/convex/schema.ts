import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(), // Clerk user ID
  })
    .index("by_owner", ["ownerId"])
    .index("by_owner_and_name", ["ownerId", "name"]),

  recallBots: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    ownerId: v.string(), // Clerk user ID
    config: v.optional(
      v.object({
        meetingType: v.optional(v.string()),
        additionalInstructions: v.optional(v.string()),
      })
    ),
  })
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerId"]),

  meetings: defineTable({
    name: v.string(),
    projectId: v.id("projects"),
    botId: v.id("recallBots"),
    scheduledTime: v.optional(v.number()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    ownerId: v.string(), // Clerk user ID
  })
    .index("by_project", ["projectId"])
    .index("by_bot", ["botId"])
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

  meetingDocumentation: defineTable({
    meetingId: v.id("meetings"),
    projectId: v.id("projects"),
    content: v.string(), // Main documentation content
    summary: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    actionItems: v.optional(
      v.array(
        v.object({
          item: v.string(),
          assignee: v.optional(v.string()),
          dueDate: v.optional(v.number()),
        })
      )
    ),
    createdAt: v.number(),
    ownerId: v.string(), // Clerk user ID
  })
    .index("by_meeting", ["meetingId"])
    .index("by_project", ["projectId"])
    .index("by_owner", ["ownerId"]),

  integrations: defineTable({
    userId: v.string(), // Clerk user ID
    provider: v.union(v.literal("hyperspell"), v.literal("recall"), v.literal("moss")),
    accessToken: v.string(), // Encrypted/stored token
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        accountId: v.optional(v.string()),
        accountName: v.optional(v.string()),
      })
    ),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_provider", ["userId", "provider"]),
});
