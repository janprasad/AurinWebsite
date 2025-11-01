"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function BotPage() {
  const params = useParams();
  const router = useRouter();
  const botId = params.botId as string;
  const bot = useQuery(api.bots.get, { botId: botId as any });
  const project = useQuery(
    api.projects.get,
    bot ? { projectId: bot.projectId } : "skip"
  );
  const meetings = useQuery(api.meetings.list) ?? [];
  const botMeetings = meetings.filter((m) => m.botId === botId);
  const deleteBot = useMutation(api.bots.remove);
  const updateBot = useMutation(api.bots.update);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Bot control state
  const [meetingUrl, setMeetingUrl] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [botStatus, setBotStatus] = useState<"idle" | "running" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Bot orchestrator API URL (configure this in your environment)
  const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:8001";

  if (bot === undefined) {
    return <div className="p-8">Loading...</div>;
  }

  if (bot === null) {
    return <div className="p-8">Bot not found</div>;
  }

  if (isEditing && name === "") {
    setName(bot.name);
    setDescription(bot.description || "");
  }

  const handleUpdate = async () => {
    await updateBot({
      botId: bot._id,
      name,
      description: description || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bot?")) return;
    await deleteBot({ botId: bot._id });
    router.push(`/projects/${bot.projectId}`);
  };
  
  const handleStartBot = async () => {
    if (!meetingUrl.trim()) {
      setErrorMessage("Please enter a meeting URL");
      return;
    }
    
    if (!bot) {
      setErrorMessage("Bot not loaded. Please refresh the page.");
      return;
    }
    
    if (!bot._id) {
      setErrorMessage(`Invalid bot ID. Bot: ${JSON.stringify(bot)}`);
      return;
    }
    
    // Log for debugging
    console.log("Starting bot with ID:", bot._id, "Type:", typeof bot._id);
    
    setIsStarting(true);
    setErrorMessage("");
    
    try {
      const response = await fetch(`${BOT_API_URL}/bots/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: bot._id,
          meetingUrl: meetingUrl.trim(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to start bot");
      }
      
      const result = await response.json();
      setBotStatus("running");
      alert(`Bot started successfully! Meeting ID: ${result.meetingId}`);
      
      // Refresh meetings list
      window.location.reload();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to start bot");
      setBotStatus("error");
    } finally {
      setIsStarting(false);
    }
  };
  
  const handleStopBot = async () => {
    if (!confirm("Are you sure you want to stop this bot?")) return;
    
    try {
      const response = await fetch(`${BOT_API_URL}/bots/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: bot._id,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to stop bot");
      }
      
      setBotStatus("idle");
      setMeetingUrl("");
      alert("Bot stopped successfully");
      
      // Refresh meetings list
      window.location.reload();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to stop bot");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        href={`/projects/${bot.projectId}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Project
      </Link>

      <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
        <div className="flex justify-between items-start mb-4">
          {isEditing ? (
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-3xl font-bold w-full px-2 py-1 border rounded-md bg-white border-slate-300 mb-2"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2 py-1 border rounded-md bg-white border-slate-300"
                rows={3}
              />
            </div>
          ) : (
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{bot.name}</h1>
              {bot.description && (
                <p className="text-gray-600 dark:text-gray-400">{bot.description}</p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:brightness-95 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:brightness-95 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Start Bot Section */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Start Bot</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Start Aurin in a meeting by providing the meeting link below.
        </p>
        
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {errorMessage}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Meeting URL (Zoom, Google Meet, etc.)
            </label>
            <input
              type="url"
              value={meetingUrl}
              onChange={(e) => setMeetingUrl(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              className="w-full px-4 py-2 border rounded-md bg-white border-slate-300"
              disabled={botStatus === "running" || isStarting}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleStartBot}
              disabled={botStatus === "running" || isStarting}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? "Starting..." : botStatus === "running" ? "Bot Running" : "Start Bot"}
            </button>
            
            {botStatus === "running" && (
              <button
                onClick={handleStopBot}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Stop Bot
              </button>
            )}
          </div>
          
          {botStatus === "running" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              🤖 Aurin is currently in the meeting
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="text-2xl font-semibold mb-4">Meeting History</h2>
        {botMeetings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No meetings yet. Start the bot to join a meeting!
          </p>
        ) : (
          <div className="space-y-2">
            {botMeetings.map((meeting) => (
              <Link
                key={meeting._id}
                href={`/meetings/${meeting._id}`}
                className="block p-3 bg-slate-50 dark:bg-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                <div className="font-semibold">{meeting.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Status: {meeting.status}
                  {meeting.scheduledTime && (
                    <> • {new Date(meeting.scheduledTime).toLocaleString()}</>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


