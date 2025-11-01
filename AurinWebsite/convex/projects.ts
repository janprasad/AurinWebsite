import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      ownerId: v.string(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", identity.subject))
      .order("desc")
      .collect();
    return projects;
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      ownerId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== identity.subject) {
      return null;
    }
    return project;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    context: v.optional(
      v.object({
        currentSprint: v.optional(v.string()),
        sprintGoal: v.optional(v.string()),
        phase: v.optional(v.string()),
        roadmap: v.optional(
          v.object({
            currentMilestone: v.optional(v.string()),
            completedMilestones: v.optional(v.array(v.string())),
            upcomingMilestones: v.optional(v.array(v.string())),
            priorities: v.optional(v.array(v.string())),
          })
        ),
        team: v.optional(
          v.object({
            members: v.optional(
              v.array(
                v.object({
                  name: v.string(),
                  role: v.optional(v.string()),
                  email: v.optional(v.string()),
                })
              )
            ),
            pmName: v.optional(v.string()),
            pmEmail: v.optional(v.string()),
          })
        ),
        recentDecisions: v.optional(v.array(v.string())),
        knownRisks: v.optional(v.array(v.string())),
        technicalContext: v.optional(v.string()),
      })
    ),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      context: args.context,
      ownerId: identity.subject,
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }
    await ctx.db.patch(args.projectId, {
      name: args.name ?? project.name,
      description: args.description ?? project.description,
    });
    return null;
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const project = await ctx.db.get(args.projectId);
    if (!project || project.ownerId !== identity.subject) {
      throw new Error("Project not found or unauthorized");
    }
    await ctx.db.delete(args.projectId);
    return null;
  },
});

/**
 * Internal query for fetching projects from HTTP actions (agent API)
 * Bypasses auth check since it's called from authenticated HTTP actions
 */
export const getProjectForAgent = internalQuery({
  args: { projectId: v.id("projects") },
  returns: v.union(
    v.object({
      _id: v.id("projects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
      ownerId: v.string(),
      context: v.optional(
        v.object({
          currentSprint: v.optional(v.string()),
          sprintGoal: v.optional(v.string()),
          phase: v.optional(v.string()),
          roadmap: v.optional(
            v.object({
              currentMilestone: v.optional(v.string()),
              completedMilestones: v.optional(v.array(v.string())),
              upcomingMilestones: v.optional(v.array(v.string())),
              priorities: v.optional(v.array(v.string())),
            })
          ),
          team: v.optional(
            v.object({
              members: v.optional(
                v.array(
                  v.object({
                    name: v.string(),
                    role: v.optional(v.string()),
                    email: v.optional(v.string()),
                  })
                )
              ),
              pmName: v.optional(v.string()),
              pmEmail: v.optional(v.string()),
            })
          ),
          recentDecisions: v.optional(v.array(v.string())),
          knownRisks: v.optional(v.array(v.string())),
          technicalContext: v.optional(v.string()),
        })
      ),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId);
  },
});

