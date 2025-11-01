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

      // Fetch owner's Hyperspell integration (if any)
      let hyperspellToken = null;
      try {
        const integrations = await ctx.runQuery(api.integrations.getForUser, {
          userId: project.ownerId,
          provider: "hyperspell",
        });
        
        if (integrations && integrations.length > 0) {
          const integration = integrations[0];
          // Check if token is expired
          if (!integration.expiresAt || integration.expiresAt > Date.now()) {
            hyperspellToken = integration.accessToken;
          }
        }
      } catch (error) {
        console.warn(`Could not fetch Hyperspell integration for user ${project.ownerId}:`, error);
      }

      // Fetch recent meeting summaries (last 3 meetings)
      let recentMeetings: any[] = [];
      try {
        const allMeetings = await ctx.runQuery(api.meetings.list, {
          projectId: bot.projectId,
        });
        
        // Get completed meetings only, sorted by most recent
        const completedMeetings = allMeetings
          .filter(m => m.status === "completed")
          .sort((a, b) => (b.scheduledTime || b._creationTime) - (a.scheduledTime || a._creationTime))
          .slice(0, 3);
        
        // Fetch documentation for each meeting
        for (const meeting of completedMeetings) {
          const docs = await ctx.runQuery(api.documentation.list, {
            projectId: bot.projectId,
          });
          const meetingDoc = docs.find(d => d.meetingId === meeting._id);
          
          if (meetingDoc) {
            recentMeetings.push({
              id: meeting._id,
              name: meeting.name,
              date: meeting.scheduledTime || meeting._creationTime,
              summary: meetingDoc.summary,
              keyPoints: meetingDoc.keyPoints,
            });
          }
        }
      } catch (error) {
        console.warn("Could not fetch recent meetings:", error);
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
            context: project.context || {},
          },
          hyperspellToken,
          recentMeetings,
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
      // Verify meeting exists (using internal query to bypass auth)
      const meeting = await ctx.runQuery(internal.meetings.getMeetingForAgent, {
        meetingId: meetingId as Id<"meetings">,
      });

      if (!meeting) {
        return new Response(JSON.stringify({ error: "Meeting not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Store documentation (using internal mutation to bypass auth)
      const docId = await ctx.runMutation(internal.documentation.createForAgent, {
        meetingId: meetingId as Id<"meetings">,
        projectId: projectId as Id<"projects">,
        content,
        embedding,
        summary,
        keyPoints,
        actionItems,
        ownerId: meeting.ownerId,
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

