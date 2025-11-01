/**
 * HTTP API routes for external services (Python agent) to interact with Convex
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

/**
 * Get bot configuration
 * POST /getBotConfig
 */
http.route({
  path: "/getBotConfig",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { botId } = await request.json();

    if (!botId) {
      return new Response(JSON.stringify({ error: "botId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate bot ID format
    if (typeof botId !== "string") {
      console.error(`Invalid bot ID type: ${typeof botId}. Expected string.`);
      return new Response(
        JSON.stringify({
          error: `Invalid bot ID type: ${typeof botId}. Expected string.`,
          receivedId: botId,
          idType: typeof botId,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Log if ID doesn't look like a typical Convex ID
    if (!botId.startsWith("j") && !botId.startsWith("k")) {
      console.warn(
        `Bot ID doesn't start with 'j' or 'k': ${botId}. This might not be a valid Convex ID.`
      );
    }

    try {
      console.log(
        `Fetching bot with ID: ${botId} (length: ${botId.length}, starts with: ${botId[0]})`
      );

      // Fetch bot configuration
      const bot = await ctx.runQuery(internal.bots.getBotForAgent, {
        botId: botId as Id<"recallBots">,
      });

      if (!bot) {
        console.error(`Bot not found with ID: ${botId}`);
        return new Response(
          JSON.stringify({
            error: `Bot not found with ID: ${botId}. Make sure the bot exists in Convex.`,
            receivedId: botId,
            idFormat: botId.startsWith("j") || botId.startsWith("k") ? "valid" : "invalid",
            idLength: botId.length,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Found bot: ${bot.name} (ID: ${bot._id})`);

      // Fetch project configuration
      const project = await ctx.runQuery(internal.projects.getProjectForAgent, {
        projectId: bot.projectId,
      });

      if (!project) {
        return new Response(JSON.stringify({ error: "Project not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          bot: {
            id: bot._id,
            name: bot.name,
            description: bot.description,
            config: bot.config,
          },
          project: {
            id: project._id,
            name: project.name,
            description: project.description,
            ownerId: project.ownerId,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      console.error(`Error in getBotConfig:`, error);
      console.error(`Error message: ${error.message}`);
      return new Response(
        JSON.stringify({
          error: error.message || "Internal server error",
          receivedId: botId,
          errorType: error.constructor?.name || "Unknown",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

/**
 * Create a new meeting
 * POST /createMeeting
 */
http.route({
  path: "/createMeeting",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { name, projectId, botId, scheduledTime } = await request.json();

    if (!name || !projectId || !botId) {
      return new Response(
        JSON.stringify({ error: "name, projectId, and botId required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Fetch bot to get ownerId
      const bot = await ctx.runQuery(internal.bots.getBotForAgent, {
        botId: botId as Id<"recallBots">,
      });

      if (!bot) {
        return new Response(JSON.stringify({ error: "Bot not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Create meeting
      const meetingId = await ctx.runMutation(internal.meetings.createForAgent, {
        name,
        projectId: projectId as Id<"projects">,
        botId: botId as Id<"recallBots">,
        ownerId: bot.ownerId,
        scheduledTime: scheduledTime ? scheduledTime : undefined,
      });

      return new Response(
        JSON.stringify({
          success: true,
          meetingId,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * Update meeting status
 * POST /updateMeetingStatus
 */
http.route({
  path: "/updateMeetingStatus",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { meetingId, status } = await request.json();

    if (!meetingId || !status) {
      return new Response(
        JSON.stringify({ error: "meetingId and status required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      await ctx.runMutation(api.meetings.update, {
        meetingId: meetingId as Id<"meetings">,
        status: status as "scheduled" | "in_progress" | "completed" | "cancelled",
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * Store meeting documentation
 * POST /storeMeetingDoc
 */
http.route({
  path: "/storeMeetingDoc",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const {
      meetingId,
      projectId,
      content,
      embedding,
      summary,
      keyPoints,
      actionItems,
    } = await request.json();

    if (!meetingId || !projectId || !content || !embedding) {
      return new Response(
        JSON.stringify({
          error: "meetingId, projectId, content, and embedding required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      // Verify meeting exists
      const meeting = await ctx.runQuery(api.meetings.get, {
        meetingId: meetingId as Id<"meetings">,
      });

      if (!meeting) {
        return new Response(JSON.stringify({ error: "Meeting not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Store documentation
      const docId = await ctx.runMutation(api.documentation.create, {
        meetingId: meetingId as Id<"meetings">,
        projectId: projectId as Id<"projects">,
        content,
        embedding,
        summary,
        keyPoints,
        actionItems,
      });

      return new Response(
        JSON.stringify({
          success: true,
          docId,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * Search meeting documentation
 * POST /searchDocs
 */
http.route({
  path: "/searchDocs",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const { projectId, queryEmbedding, limit } = await request.json();

    if (!projectId || !queryEmbedding) {
      return new Response(
        JSON.stringify({ error: "projectId and queryEmbedding required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      const results = await ctx.runAction(api.documentationSearch.search, {
        projectId: projectId as Id<"projects">,
        queryEmbedding: queryEmbedding as number[],
        limit: limit || 5,
      });

      return new Response(JSON.stringify({ results }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

// Export the router as default
export default http;

