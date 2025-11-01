"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function NewMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get("projectId");
  const projects = useQuery(api.projects.list) ?? [];
  const bots = useQuery(api.bots.list) ?? [];
  const createMeeting = useMutation(api.meetings.create);

  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(projectIdParam || "");
  const [botId, setBotId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectBots = projectId
    ? bots.filter((b) => b.projectId === projectId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !projectId || !botId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createMeeting({
        name,
        projectId: projectId as any,
        botId: botId as any,
        scheduledTime: scheduledTime ? new Date(scheduledTime).getTime() : undefined,
      });

      router.push(`/projects/${projectId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10">
          <Link
            href={projectId ? `/projects/${projectId}` : "/"}
            className="inline-flex items-center text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors text-sm mb-4"
          >
            ← Back {projectId ? "to Project" : "to Dashboard"}
          </Link>
          
          <h1 
            className="text-4xl font-semibold text-[color:var(--color-ink)] mb-3"
            style={{fontFamily:'var(--font-display)'}}
          >
            Schedule New Meeting
          </h1>
          <p className="text-[color:var(--color-slate)] text-lg">
            Set up a new meeting with an AI agent
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                Meeting Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Daily Standup, Sprint Planning"
                className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setBotId("");
                }}
                className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                AI Agent
              </label>
              <select
                value={botId}
                onChange={(e) => setBotId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                required
                disabled={!projectId}
              >
                <option value="">
                  {projectId ? "Select an agent" : "Select a project first"}
                </option>
                {projectBots.map((bot) => (
                  <option key={bot._id} value={bot._id}>
                    {bot.name}
                  </option>
                ))}
              </select>
              {projectId && projectBots.length === 0 && (
                <p className="text-sm text-[color:var(--color-mist)] mt-2">
                  No agents available for this project. Create one first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[color:var(--color-ink)] mb-2">
                Scheduled Time
                <span className="text-[color:var(--color-mist)] font-normal ml-2">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white px-8 py-3 font-medium shadow-sm hover:brightness-95 disabled:opacity-60 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Create Meeting
                  </>
                )}
              </button>
              <Link
                href={projectId ? `/projects/${projectId}` : "/"}
                className="inline-flex items-center justify-center rounded-full bg-white text-[var(--color-ink)] ring-1 ring-inset ring-[color:var(--color-tea)] px-8 py-3 font-medium hover:bg-[var(--color-stone)]/60 transition-all"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
