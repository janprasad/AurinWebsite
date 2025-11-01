import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { projectId: v.id("projects") },
  returns: v.array(
    v.object({
      _id: v.id("meetingDocumentation"),
      _creationTime: v.number(),
      meetingId: v.id("meetings"),
      projectId: v.id("projects"),
      content: v.string(),
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
      ownerId: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }
    
    // Fetch all docs and exclude the embedding field (too large for frontend)
    const docs = await ctx.db
      .query("meetingDocumentation")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
    
    // Map to exclude embedding field
    return docs.map(({ embedding, ...doc }) => doc);
  },
});

export const get = query({
  args: { docId: v.id("meetingDocumentation") },
  returns: v.union(
    v.object({
      _id: v.id("meetingDocumentation"),
      _creationTime: v.number(),
      meetingId: v.id("meetings"),
      projectId: v.id("projects"),
      content: v.string(),
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
      ownerId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const doc = await ctx.db.get(args.docId);
    if (!doc || doc.ownerId !== identity.subject) {
      return null;
    }
    
    // Exclude the embedding field (too large for frontend)
    const { embedding, ...docWithoutEmbedding } = doc;
    return docWithoutEmbedding;
  },
});

export const create = mutation({
  args: {
    meetingId: v.id("meetings"),
    projectId: v.id("projects"),
    content: v.string(),
    embedding: v.array(v.float64()),
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
  },
  returns: v.id("meetingDocumentation"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const meeting = await ctx.db.get(args.meetingId);
    if (!meeting || meeting.ownerId !== identity.subject) {
      throw new Error("Meeting not found or unauthorized");
    }
    return await ctx.db.insert("meetingDocumentation", {
      meetingId: args.meetingId,
      projectId: args.projectId,
      content: args.content,
      embedding: args.embedding,
      summary: args.summary,
      keyPoints: args.keyPoints,
      actionItems: args.actionItems,
      createdAt: Date.now(),
      ownerId: identity.subject,
    });
  },
});

/**
 * Internal mutation for creating documentation from HTTP actions (agent API)
 * Bypasses auth check since it's called from authenticated HTTP actions
 */
export const createForAgent = internalMutation({
  args: {
      meetingId: v.id("meetings"),
      projectId: v.id("projects"),
      content: v.string(),
    embedding: v.array(v.float64()),
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
      ownerId: v.string(),
  },
  returns: v.id("meetingDocumentation"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetingDocumentation", {
      meetingId: args.meetingId,
        projectId: args.projectId,
      content: args.content,
      embedding: args.embedding,
      summary: args.summary,
      keyPoints: args.keyPoints,
      actionItems: args.actionItems,
      createdAt: Date.now(),
      ownerId: args.ownerId,
    });
  },
});

