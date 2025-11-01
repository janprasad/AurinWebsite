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
  
  const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || "http://localhost:8001";

  if (bot === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[color:var(--color-slate)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (bot === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[color:var(--color-ink)] mb-2">Bot not found</h2>
          <Link href="/" className="text-[color:var(--color-primary)] hover:underline">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
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
    if (!confirm("Are you sure you want to delete this bot? This action cannot be undone.")) return;
    await deleteBot({ botId: bot._id });
    router.push(`/projects/${bot.projectId}`);
  };
  
  const handleStartBot = async () => {
    if (!meetingUrl.trim()) {
      setErrorMessage("Please enter a meeting URL");
      return;
    }
    
    if (!bot._id) {
      setErrorMessage(`Invalid bot ID`);
      return;
    }
    
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
      setMeetingUrl("");
      alert(`Bot started successfully! Meeting ID: ${result.meetingId}`);
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
      alert("Bot stopped successfully");
      window.location.reload();
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to stop bot");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
      <Link
        href={`/projects/${bot.projectId}`}
            className="inline-flex items-center text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors text-sm mb-4"
      >
        ← Back to Project
      </Link>

          <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 shadow-sm">
          {isEditing ? (
              <div className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                  className="w-full text-4xl font-semibold px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
                  style={{fontFamily:'var(--font-display)'}}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all resize-none"
                rows={3}
              />
                <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                    className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:brightness-95 transition-all"
                >
                    Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                    className="inline-flex items-center rounded-full bg-white text-[var(--color-ink)] ring-1 ring-inset ring-[color:var(--color-tea)] px-6 py-2.5 text-sm font-medium hover:bg-[var(--color-stone)]/60 transition-all"
                >
                  Cancel
                </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 
                    className="text-4xl font-semibold text-[color:var(--color-ink)] mb-3"
                    style={{fontFamily:'var(--font-display)'}}
                  >
                    {bot.name}
                  </h1>
                  {bot.description && (
                    <p className="text-[color:var(--color-slate)] text-lg">
                      {bot.description}
                    </p>
                  )}
                  {project && (
                    <p className="text-[color:var(--color-mist)] text-sm mt-3">
                      Project: {project.name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                    className="inline-flex items-center rounded-full bg-white text-[var(--color-ink)] ring-1 ring-inset ring-[color:var(--color-tea)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--color-stone)]/60 transition-all"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                    className="inline-flex items-center rounded-full bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 px-5 py-2.5 text-sm font-medium hover:bg-red-100 transition-all"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  Delete
                </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Start Bot Section */}
        <div className="mb-10">
          <h2 
            className="text-2xl font-semibold text-[color:var(--color-ink)] mb-6"
            style={{fontFamily:'var(--font-display)'}}
          >
            Meeting Control
          </h2>
          
          <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-6 shadow-sm">
            <p className="text-[color:var(--color-slate)] mb-6">
              Start Aurin in a meeting by providing the meeting link below.
            </p>
            
            {errorMessage && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            )}
            
            {botStatus === "running" && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">Aurin is currently in the meeting</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                  Meeting URL (Zoom, Google Meet, etc.)
                </label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
                  disabled={botStatus === "running" || isStarting}
                />
      </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStartBot}
                  disabled={botStatus === "running" || isStarting}
                  className="inline-flex items-center rounded-full bg-green-600 text-white px-6 py-3 font-medium shadow-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isStarting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Starting...
                    </>
                  ) : botStatus === "running" ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Bot Running
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Start Bot
                    </>
                  )}
                </button>
                
                {botStatus === "running" && (
                  <button
                    onClick={handleStopBot}
                    className="inline-flex items-center rounded-full bg-red-600 text-white px-6 py-3 font-medium shadow-sm hover:bg-red-700 transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop Bot
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Meeting History */}
        <div>
          <h2 
            className="text-2xl font-semibold text-[color:var(--color-ink)] mb-6"
            style={{fontFamily:'var(--font-display)'}}
          >
            Meeting History
          </h2>
          
        {botMeetings.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 text-center shadow-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-mist)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[color:var(--color-slate)]">
                No meetings yet. Start the bot to join a meeting!
          </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {botMeetings.map((meeting) => (
              <Link
                key={meeting._id}
                href={`/meetings/${meeting._id}`}
                  className="group rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
              >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[color:var(--color-ink)] group-hover:text-[color:var(--color-primary)] transition-colors">
                      {meeting.name}
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      meeting.status === 'completed' ? 'bg-green-50 text-green-700' :
                      meeting.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                      meeting.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                      'bg-[var(--color-stone)] text-[color:var(--color-slate)]'
                    }`}>
                      {meeting.status}
                    </span>
                  </div>
                  {meeting.scheduledTime && (
                    <p className="text-sm text-[color:var(--color-slate)]">
                      {new Date(meeting.scheduledTime).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
              </Link>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
