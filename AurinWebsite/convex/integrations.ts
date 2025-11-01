import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("integrations"),
      _creationTime: v.number(),
      userId: v.string(),
      provider: v.union(v.literal("hyperspell"), v.literal("recall"), v.literal("moss")),
      accessToken: v.string(),
      refreshToken: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      metadata: v.optional(
        v.object({
          accountId: v.optional(v.string()),
          accountName: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("integrations")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

export const get = query({
  args: { provider: v.union(v.literal("hyperspell"), v.literal("recall"), v.literal("moss")) },
  returns: v.array(
    v.object({
      _id: v.id("integrations"),
      _creationTime: v.number(),
      userId: v.string(),
      provider: v.union(v.literal("hyperspell"), v.literal("recall"), v.literal("moss")),
      accessToken: v.string(),
      refreshToken: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      metadata: v.optional(
        v.object({
          accountId: v.optional(v.string()),
          accountName: v.optional(v.string()),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db
      .query("integrations")
      .withIndex("by_user_and_provider", (q) =>
        q.eq("userId", identity.subject).eq("provider", args.provider)
      )
      .collect();
  },
});

export const connect = action({
  args: {
    provider: v.union(v.literal("hyperspell"), v.literal("recall"), v.literal("moss")),
    code: v.string(), // OAuth code or access token
  },
  returns: v.id("integrations"),
  handler: async (ctx, args): Promise<any> => {
    "use node";
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Exchange OAuth code for access token (this is a placeholder - actual implementation depends on provider)
    let accessToken = args.code;
    let refreshToken: string | undefined;
    let expiresAt: number | undefined;
    let metadata: { accountId?: string; accountName?: string } | undefined;

    if (args.provider === "hyperspell") {
      // Exchange code for token with Hyperspell API
      try {
        const response = await fetch("https://api.hyperspell.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: args.code,
            client_id: process.env.HYPERSPELL_CLIENT_ID,
            client_secret: process.env.HYPERSPELL_CLIENT_SECRET,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token;
          refreshToken = data.refresh_token;
          expiresAt = data.expires_in ? Date.now() + data.expires_in * 1000 : undefined;
        }
      } catch (error) {
        console.error("Hyperspell OAuth error:", error);
      }
    } else if (args.provider === "moss") {
      // Exchange code for token with Moss API
      try {
        const response = await fetch("https://api.moss.com/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: args.code,
            client_id: process.env.MOSS_CLIENT_ID,
            client_secret: process.env.MOSS_CLIENT_SECRET,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          accessToken = data.access_token;
          refreshToken = data.refresh_token;
          expiresAt = data.expires_in ? Date.now() + data.expires_in * 1000 : undefined;
        }
      } catch (error) {
        console.error("Moss OAuth error:", error);
      }
    }

    // Check if integration already exists
    const existing: Array<{
      _id: any;
      _creationTime: number;
      userId: string;
      provider: "hyperspell" | "recall" | "moss";
      accessToken: string;
      refreshToken?: string;
      expiresAt?: number;
      metadata?: {
        accountId?: string;
        accountName?: string;
      };
    }> = await ctx.runQuery(api.integrations.get, {
      provider: args.provider,
    });

    if (existing && existing.length > 0) {
      // Update existing integration
      await ctx.runMutation(api.integrations.update, {
        integrationId: existing[0]._id,
        accessToken,
        refreshToken,
        expiresAt,
        metadata,
      });
      return existing[0]._id;
    }

    // Create new integration
    return await ctx.runMutation(api.integrations.create, {
      provider: args.provider,
      accessToken,
      refreshToken,
      expiresAt,
      metadata,
    });
  },
});

export const create = mutation({
  args: {
    provider: v.union(v.literal("hyperspell"), v.literal("recall"), v.literal("moss")),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        accountId: v.optional(v.string()),
        accountName: v.optional(v.string()),
      })
    ),
  },
  returns: v.id("integrations"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.insert("integrations", {
      userId: identity.subject,
      provider: args.provider,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      expiresAt: args.expiresAt,
      metadata: args.metadata,
    });
  },
});

export const update = mutation({
  args: {
    integrationId: v.id("integrations"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(
      v.object({
        accountId: v.optional(v.string()),
        accountName: v.optional(v.string()),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.userId !== identity.subject) {
      throw new Error("Integration not found or unauthorized");
    }
    await ctx.db.patch(args.integrationId, {
      accessToken: args.accessToken ?? integration.accessToken,
      refreshToken: args.refreshToken ?? integration.refreshToken,
      expiresAt: args.expiresAt ?? integration.expiresAt,
      metadata: args.metadata ?? integration.metadata,
    });
    return null;
  },
});

export const remove = mutation({
  args: { integrationId: v.id("integrations") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const integration = await ctx.db.get(args.integrationId);
    if (!integration || integration.userId !== identity.subject) {
      throw new Error("Integration not found or unauthorized");
    }
    await ctx.db.delete(args.integrationId);
    return null;
  },
});

