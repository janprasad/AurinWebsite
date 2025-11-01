"use client";

import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <Authenticated>
        <Dashboard />
      </Authenticated>
      <Unauthenticated>
        <Landing />
      </Unauthenticated>
    </>
  );
}

function Landing() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto w-fit rounded-full px-4 py-1 text-[12px] tracking-wide ring-1 ring-[color:var(--color-tea)] text-[color:var(--color-slate)] bg-white/70 backdrop-blur">
          Your AI PM
        </div>
        <div className="mt-6 grid grid-cols-1 gap-10 items-center">
          <div className="text-center">
            <h1 className="font-semibold text-5xl sm:text-6xl leading-[1.1] text-[color:var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>
              The first AI project manager that leads your meetings
              <span className="block text-[color:var(--color-slate)] font-normal" style={{ fontFamily: 'var(--font-display)' }}>
                join, guide, summarize
              </span>
            </h1>
            <p className="mt-5 text-lg text-[color:var(--color-slate)] max-w-2xl mx-auto">
              Your AI PM joins Google Meet, Zoom, and Teams meetings; leads standups and runs check-ins, then emails real updates to product managers. It fetches all your context—from Slack, Notion, Google Calendar, and more—summarizes every meeting, and creates searchable living documentation for your whole product team.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <SignInButton mode="modal">
                <button className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-6 py-3 text-sm font-medium shadow-sm hover:brightness-95">
                  Get started
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="inline-flex items-center rounded-full bg-white text-[var(--color-ink)] ring-1 ring-inset ring-[color:var(--color-tea)] px-6 py-3 text-sm font-medium hover:bg-[var(--color-stone)]/60">
                  Create account
                </button>
              </SignUpButton>
            </div>
          </div>
          {/* Organic motif */}
          <div className="relative mx-auto w-full max-w-4xl">
            <div className="absolute -inset-6 rounded-[32px] bg-[color:var(--color-stone)]/60 blur-2xl" />
            <div className="relative rounded-[24px] border border-[color:var(--color-tea)] bg-white p-6 shadow-sm">
              <svg viewBox="0 0 600 180" className="w-full h-auto" aria-hidden>
                <defs>
                  <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--color-stone)" />
                    <stop offset="100%" stopColor="var(--color-mist)" />
                  </linearGradient>
                </defs>
                <ellipse cx="120" cy="90" rx="110" ry="60" fill="url(#g1)" />
                <ellipse cx="300" cy="90" rx="90" ry="50" fill="#c7a27b55" />
                <ellipse cx="470" cy="90" rx="110" ry="60" fill="#9fb3c85a" />
                <circle cx="300" cy="90" r="6" fill="var(--color-ink)" />
              </svg>
              <div className="mt-4 text-center text-sm text-[color:var(--color-slate)]">
                Next‑generation project meetings • context-aware AI • effortless documentation
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl mt-20 grid gap-6 sm:grid-cols-2">
        <FeatureCard
          title="AI-run meetings—no human required"
          description="Your project manager bot joins Google Meet, Zoom, or Teams, runs the agenda, and keeps everyone on track."
        />
        <FeatureCard
          title="Real updates, sent automatically"
          description="After each meeting, PMs and stakeholders get tailored update emails, with no manual notes or follow-up busywork."
        />
        <FeatureCard
          title="Contextually connected to your tools"
          description="Fetches relevant details from Slack, Notion, Google Calendar, and more—answers questions in real time."
        />
        <FeatureCard
          title="Semantic, living documentation"
          description="Every meeting is summarized, archived, and becomes searchable knowledge for your team. Ask natural questions and get instant context."
        />
      </div>
    </section>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow transition-shadow">
      <h3 className="text-base font-semibold text-[color:var(--color-ink)]" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
      <p className="mt-2 text-sm text-[color:var(--color-slate)]">{description}</p>
    </div>
  );
}

function Dashboard() {
  const projects = useQuery(api.projects.list) ?? [];
  const createProject = useMutation(api.projects.create);
  const createBot = useMutation(api.bots.create);
  const createMeeting = useMutation(api.meetings.create);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Rich project context
  const [currentSprint, setCurrentSprint] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [phase, setPhase] = useState("planning");
  const [currentMilestone, setCurrentMilestone] = useState("");
  const [technicalContext, setTechnicalContext] = useState("");
  
  const [createAgent, setCreateAgent] = useState(true);
  const [agentName, setAgentName] = useState("");
  const [sharedEmails, setSharedEmails] = useState("");
  const [meetingName, setMeetingName] = useState("Standup");
  const [meetingDate, setMeetingDate] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<"daily" | "weekly">("daily");
  const [submitting, setSubmitting] = useState(false);

  const parseEmails = (input: string): string[] => {
    return input
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || submitting) return;
    setSubmitting(true);
    try {
      const projectId = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
      });

      if (createAgent && projectId) {
        const defaultAgentName = agentName.trim() || `${projectName.trim()} Agent`;
        const emails = parseEmails(sharedEmails);
        const newBotId = await createBot({
          name: defaultAgentName,
          description: undefined,
          projectId: projectId as any,
          config:
            emails.length || recurring || meetingDate
              ? {
                  ...(emails.length ? { sharedEmails: emails } : {}),
                  ...(recurring
                    ? {
                        recurring: {
                          enabled: true,
                          frequency: recurringFrequency,
                          startTime: meetingDate ? new Date(meetingDate).getTime() : undefined,
                        },
                      }
                    : {}),
                }
              : undefined,
        });

        if (meetingDate) {
          await createMeeting({
            name: meetingName.trim() || "Standup",
            projectId: projectId as any,
            botId: newBotId as any,
            scheduledTime: new Date(meetingDate).getTime(),
          });
        }
      }

      setProjectName("");
      setProjectDescription("");
      setAgentName("");
      setSharedEmails("");
      setMeetingName("Standup");
      setMeetingDate("");
      setRecurring(false);
      setShowCreateForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1
            className="text-4xl font-semibold text-[color:var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your Projects
          </h1>
          <p className="text-[color:var(--color-slate)] mt-2">
            Manage your projects and meeting agents
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-6 py-3 text-sm font-medium shadow-sm hover:brightness-95 transition-all"
        >
          {showCreateForm ? (
            <>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </>
          )}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-6 shadow-sm mb-8">
          <h2
            className="text-lg font-semibold mb-4 text-[color:var(--color-ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Create New Project
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
            />
            <textarea
              placeholder="Description (optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all resize-none"
              rows={3}
            />

            <div className="flex items-center gap-2">
              <input
                id="createAgent"
                type="checkbox"
                checked={createAgent}
                onChange={(e) => setCreateAgent(e.target.checked)}
              />
              <label htmlFor="createAgent" className="text-sm text-[color:var(--color-slate)]">
                Create Agent for this project
              </label>
            </div>

            {createAgent && (
              <>
                <input
                  type="text"
                  placeholder="Agent name (default: Project name + Agent)"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
                />
                <textarea
                  placeholder="Share this bot with email addresses (comma or newline separated, optional)"
                  value={sharedEmails}
                  onChange={(e) => setSharedEmails(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all resize-none"
                  rows={3}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[color:var(--color-slate)]">Initial Meeting Name</label>
                    <input
                      type="text"
                      placeholder="Standup"
                      value={meetingName}
                      onChange={(e) => setMeetingName(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[color:var(--color-slate)]">Initial Meeting Date (optional)</label>
                    <input
                      type="datetime-local"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <input
                    id="recurring"
                    type="checkbox"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                  />
                  <label htmlFor="recurring" className="text-sm text-[color:var(--color-slate)]">Make this meeting recurring</label>
                  {recurring && (
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value as "daily" | "weekly")}
                      className="ml-3 px-3 py-2 rounded-lg border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  )}
                </div>
              </>
            )}

            <button
              onClick={handleCreateProject}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white px-6 py-3 font-medium shadow-sm hover:brightness-95 disabled:opacity-60 transition-all"
            >
              {submitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-12 text-center shadow-sm">
          <svg className="w-16 h-16 mx-auto mb-4 text-[color:var(--color-mist)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <p className="text-[color:var(--color-slate)] text-lg">
            No projects yet. Create your first project to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="group rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <h3
                className="text-xl font-semibold text-[color:var(--color-ink)] group-hover:text-[color:var(--color-primary)] transition-colors mb-2"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {project.name}
              </h3>
              {project.description && (
                <p className="text-[color:var(--color-slate)] text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-[color:var(--color-mist)] pt-3 border-t border-[color:var(--color-tea)]">
                <span>
                  {new Date(project._creationTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <svg className="w-4 h-4 group-hover:text-[color:var(--color-primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
