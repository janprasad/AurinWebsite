import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
    return await ctx.db
      .query("meetingDocumentation")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
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
    return doc;
  },
});

export const create = mutation({
  args: {
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
      summary: args.summary,
      keyPoints: args.keyPoints,
      actionItems: args.actionItems,
      createdAt: Date.now(),
      ownerId: identity.subject,
    });
  },
});

export const search = action({
  args: {
    projectId: v.id("projects"),
    query: v.string(),
  },
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
      relevanceScore: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args): Promise<
    Array<{
      _id: any;
      _creationTime: number;
      meetingId: any;
      projectId: any;
      content: string;
      summary?: string;
      keyPoints?: string[];
      actionItems?: Array<{
        item: string;
        assignee?: string;
        dueDate?: number;
      }>;
      createdAt: number;
      ownerId: string;
      relevanceScore?: number;
    }>
  > => {
    "use node";
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get Moss integration for semantic search
    const integrations = await ctx.runQuery(api.integrations.get, {
      provider: "moss",
    });

    if (!integrations || integrations.length === 0) {
      // Fallback to basic text search if Moss is not configured
      const docs: Array<{
        _id: any;
        _creationTime: number;
        meetingId: any;
        projectId: any;
        content: string;
        summary?: string;
        keyPoints?: string[];
        actionItems?: Array<{
          item: string;
          assignee?: string;
          dueDate?: number;
        }>;
        createdAt: number;
        ownerId: string;
      }> = await ctx.runQuery(api.documentation.list, {
        projectId: args.projectId,
      });
      return docs.map((doc) => ({
        ...doc,
        relevanceScore: doc.content.toLowerCase().includes(args.query.toLowerCase()) ? 1 : 0,
      }));
    }

    // Use Moss API for semantic search
    const mossIntegration = integrations[0];
    try {
      const response = await fetch("https://api.moss.com/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mossIntegration.accessToken}`,
        },
        body: JSON.stringify({
          query: args.query,
          projectId: args.projectId,
        }),
      });

      if (!response.ok) {
        throw new Error("Moss API error");
      }

      const searchResults: {
        results: Array<{ docId: string; score?: number }>;
      } = await response.json();
      const docIds = searchResults.results.map((r) => r.docId);

      // Fetch full documentation for matched IDs
      const allDocs: Array<{
        _id: any;
        _creationTime: number;
        meetingId: any;
        projectId: any;
        content: string;
        summary?: string;
        keyPoints?: string[];
        actionItems?: Array<{
          item: string;
          assignee?: string;
          dueDate?: number;
        }>;
        createdAt: number;
        ownerId: string;
      }> = await ctx.runQuery(api.documentation.list, {
        projectId: args.projectId,
      });

      return allDocs
        .filter((doc) => docIds.includes(doc._id))
        .map((doc) => {
          const result = searchResults.results.find((r) => r.docId === doc._id);
          return {
            ...doc,
            relevanceScore: result?.score,
          };
        })
        .sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
    } catch (error) {
      console.error("Moss search error:", error);
      // Fallback to basic search
      const docs: Array<{
        _id: any;
        _creationTime: number;
        meetingId: any;
        projectId: any;
        content: string;
        summary?: string;
        keyPoints?: string[];
        actionItems?: Array<{
          item: string;
          assignee?: string;
          dueDate?: number;
        }>;
        createdAt: number;
        ownerId: string;
      }> = await ctx.runQuery(api.documentation.list, {
        projectId: args.projectId,
      });
      return docs.map((doc) => ({
        ...doc,
        relevanceScore: doc.content.toLowerCase().includes(args.query.toLowerCase()) ? 1 : 0,
      }));
    }
  },
});

