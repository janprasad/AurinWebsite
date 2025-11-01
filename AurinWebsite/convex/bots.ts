import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { projectId: v.optional(v.id("projects")) },
  returns: v.array(
    v.object({
      _id: v.id("recallBots"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      projectId: v.id("projects"),
      ownerId: v.string(),
      config: v.optional(
        v.object({
          meetingType: v.optional(v.string()),
          additionalInstructions: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    if (args.projectId) {
      return await ctx.db
        .query("recallBots")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("recallBots")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { botId: v.id("recallBots") },
  returns: v.union(
    v.object({
      _id: v.id("recallBots"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      projectId: v.id("projects"),
      ownerId: v.string(),
      config: v.optional(
        v.object({
          meetingType: v.optional(v.string()),
          additionalInstructions: v.optional(v.string()),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const bot = await ctx.db.get(args.botId);
    if (!bot || bot.ownerId !== identity.subject) {
      return null;
    }
    return bot;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.id("projects"),
    config: v.optional(
      v.object({
        meetingType: v.optional(v.string()),
        additionalInstructions: v.optional(v.string()),
      })
    ),
  },
  returns: v.id("recallBots"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }
    return await ctx.db.insert("recallBots", {
      name: args.name,
      description: args.description,
      projectId: args.projectId,
      ownerId: identity.subject,
      config: args.config,
    });
  },
});

export const update = mutation({
  args: {
    botId: v.id("recallBots"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    config: v.optional(
      v.object({
        meetingType: v.optional(v.string()),
        additionalInstructions: v.optional(v.string()),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const bot = await ctx.db.get(args.botId);
    if (!bot || bot.ownerId !== identity.subject) {
      throw new Error("Bot not found or unauthorized");
    }
    await ctx.db.patch(args.botId, {
      name: args.name ?? bot.name,
      description: args.description ?? bot.description,
      config: args.config ?? bot.config,
    });
    return null;
  },
});

export const remove = mutation({
  args: { botId: v.id("recallBots") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const bot = await ctx.db.get(args.botId);
    if (!bot || bot.ownerId !== identity.subject) {
      throw new Error("Bot not found or unauthorized");
    }
    await ctx.db.delete(args.botId);
    return null;
  },
});


