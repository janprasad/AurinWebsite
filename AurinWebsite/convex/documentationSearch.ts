/**
 * Documentation search action - receives pre-generated embedding from client
 * This avoids bundling OpenAI in Convex - embeddings are generated client-side
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const search = action({
  args: {
    projectId: v.id("projects"),
    queryEmbedding: v.array(v.float64()), // Embedding generated client-side
    limit: v.optional(v.number()),
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
      relevanceScore: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Verify project access
    const project = await ctx.runQuery(api.projects.get, {
      projectId: args.projectId,
    });
    if (!project) {
      throw new Error("Project not found or unauthorized");
    }

    // Perform vector search using the provided embedding
    const results = await ctx.vectorSearch(
      "meetingDocumentation",
      "by_embedding",
      {
        vector: args.queryEmbedding,
        limit: args.limit ?? 10,
        filter: (q) => q.eq("projectId", args.projectId),
      }
    );

    // Fetch full documents
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
      relevanceScore: number;
    } | null> = await Promise.all(
      results.map(async (result) => {
        const doc = await ctx.runQuery(api.documentation.get, {
          docId: result._id,
        });
        if (!doc) return null;
        return {
          ...doc,
          relevanceScore: result._score,
        };
      })
    );

    return docs.filter((doc): doc is NonNullable<typeof doc> => doc !== null);
  },
});

