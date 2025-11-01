import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { projectId: v.optional(v.id("projects")) },
  returns: v.array(
    v.object({
      _id: v.id("meetings"),
      _creationTime: v.number(),
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
      ownerId: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    if (args.projectId) {
      return await ctx.db
        .query("meetings")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("meetings")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { meetingId: v.id("meetings") },
  returns: v.union(
    v.object({
      _id: v.id("meetings"),
      _creationTime: v.number(),
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
      ownerId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting || meeting.ownerId !== identity.subject) {
      return null;
    }
    return meeting;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    botId: v.id("recallBots"),
    scheduledTime: v.optional(v.number()),
  },
  returns: v.id("meetings"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }
    const bot = await ctx.db.get(args.botId);
    if (!bot || bot.ownerId !== identity.subject) {
      throw new Error("Bot not found or unauthorized");
    }
    return await ctx.db.insert("meetings", {
      name: args.name,
      projectId: args.projectId,
      botId: args.botId,
      scheduledTime: args.scheduledTime,
      status: "scheduled",
      ownerId: identity.subject,
    });
  },
});

/**
 * Internal mutation for creating meetings from HTTP actions (agent API)
 * Bypasses auth check since it's called from authenticated HTTP actions
 */
export const createForAgent = internalMutation({
  args: {
    name: v.string(),
    projectId: v.id("projects"),
    botId: v.id("recallBots"),
    ownerId: v.string(),
    scheduledTime: v.optional(v.number()),
  },
  returns: v.id("meetings"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetings", {
      name: args.name,
      projectId: args.projectId,
      botId: args.botId,
      scheduledTime: args.scheduledTime,
      status: "scheduled",
      ownerId: args.ownerId,
    });
  },
});

/**
 * Internal query for fetching meetings from HTTP actions (agent API)
 * Bypasses auth check since it's called from authenticated HTTP actions
 */
export const getMeetingForAgent = internalQuery({
  args: { meetingId: v.id("meetings") },
  returns: v.union(
    v.object({
      _id: v.id("meetings"),
      _creationTime: v.number(),
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
      ownerId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.meetingId);
  },
});

export const update = mutation({
  args: {
    meetingId: v.id("meetings"),
    name: v.optional(v.string()),
    botId: v.optional(v.id("recallBots")),
    scheduledTime: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("scheduled"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting || meeting.ownerId !== identity.subject) {
      throw new Error("Meeting not found or unauthorized");
    }
    if (args.botId) {
      const bot = await ctx.db.get(args.botId);
      if (!bot || bot.ownerId !== identity.subject) {
        throw new Error("Bot not found or unauthorized");
      }
    }
    await ctx.db.patch(args.meetingId, {
      name: args.name ?? meeting.name,
      botId: args.botId ?? meeting.botId,
      scheduledTime: args.scheduledTime ?? meeting.scheduledTime,
      status: args.status ?? meeting.status,
    });
    return null;
  },
});

export const remove = mutation({
  args: { meetingId: v.id("meetings") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting || meeting.ownerId !== identity.subject) {
      throw new Error("Meeting not found or unauthorized");
    }
    await ctx.db.delete(args.meetingId);
    return null;
  },
});


