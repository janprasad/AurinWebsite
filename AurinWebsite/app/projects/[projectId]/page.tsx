"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const project = useQuery(api.projects.get, { projectId: projectId as any });
  const bots = useQuery(api.bots.list, { projectId: projectId as any }) ?? [];
  const meetings = useQuery(api.meetings.list, { projectId: projectId as any }) ?? [];
  const docs =
    useQuery(
      api.documentation.list,
      project ? { projectId: projectId as any } : "skip"
    ) ?? [];
  const deleteProject = useMutation(api.projects.remove);

  const [showCreateBot, setShowCreateBot] = useState(false);
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createBot = useMutation(api.bots.create);

  const handleCreateBot = async () => {
    if (!botName.trim() || !project || isCreating) return;
    setIsCreating(true);
    try {
    await createBot({
      name: botName,
      description: botDescription || undefined,
      projectId: project._id,
    });
    setBotName("");
    setBotDescription("");
    setShowCreateBot(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    await deleteProject({ projectId: projectId as any });
    router.push("/");
  };

  if (project === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[color:var(--color-slate)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[color:var(--color-ink)] mb-2">Project not found</h2>
          <Link href="/" className="text-[color:var(--color-primary)] hover:underline">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors text-sm mb-4"
          >
          ← Back to Dashboard
        </Link>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 
                className="text-5xl font-semibold text-[color:var(--color-ink)] mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {project.name}
              </h1>
            {project.description && (
                <p className="text-[color:var(--color-slate)] text-lg max-w-2xl">
                  {project.description}
                </p>
            )}
          </div>
          <button
            onClick={handleDeleteProject}
              className="inline-flex items-center rounded-full bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 px-5 py-2.5 text-sm font-medium hover:bg-red-100 transition-all"
          >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
          </button>
        </div>
      </div>

        {/* Bots Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 
                className="text-2xl font-semibold text-[color:var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Meeting Agents
              </h2>
              <p className="text-[color:var(--color-slate)] text-sm mt-1">
                AI agents that join and guide your meetings
              </p>
            </div>
            <button
              onClick={() => setShowCreateBot(!showCreateBot)}
              className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:brightness-95 transition-all"
            >
              {showCreateBot ? (
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
                  New Agent
                </>
              )}
            </button>
          </div>

          {showCreateBot && (
            <div className="mb-6 rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[color:var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Create New Agent
              </h3>
              <div className="space-y-3">
              <input
                type="text"
                  placeholder="Agent name"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
              />
              <textarea
                placeholder="Description (optional)"
                value={botDescription}
                onChange={(e) => setBotDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all resize-none"
                  rows={3}
              />
              <button
                onClick={handleCreateBot}
                  disabled={!botName.trim() || isCreating}
                  className="w-full inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white px-6 py-3 font-medium shadow-sm hover:brightness-95 disabled:opacity-60 transition-all"
              >
                  {isCreating ? "Creating..." : "Create Agent"}
              </button>
              </div>
            </div>
          )}

          {bots.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 text-center shadow-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-mist)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-[color:var(--color-slate)]">
                No agents yet. Create your first agent to get started!
            </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bots.map((bot) => (
                <Link
                  key={bot._id}
                  href={`/bots/${bot._id}`}
                  className="group rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-[color:var(--color-ink)] group-hover:text-[color:var(--color-primary)] transition-colors">
                      {bot.name}
                    </h3>
                    <svg className="w-5 h-5 text-[color:var(--color-mist)] group-hover:text-[color:var(--color-primary)] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {bot.description && (
                    <p className="text-sm text-[color:var(--color-slate)] line-clamp-2">
                      {bot.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Meetings Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 
                className="text-2xl font-semibold text-[color:var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Meetings
              </h2>
              <p className="text-[color:var(--color-slate)] text-sm mt-1">
                Scheduled and past meetings for this project
              </p>
            </div>
            <Link
              href={`/meetings/new?projectId=${projectId}`}
              className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-5 py-2.5 text-sm font-medium shadow-sm hover:brightness-95 transition-all"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Meeting
            </Link>
          </div>

          {meetings.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 text-center shadow-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-mist)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[color:var(--color-slate)]">
              No meetings scheduled yet.
            </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map((meeting) => (
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

        {/* Documentation Preview */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 
                className="text-2xl font-semibold text-[color:var(--color-ink)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Recent Documentation
              </h2>
              <p className="text-[color:var(--color-slate)] text-sm mt-1">
                Latest meeting notes and summaries
              </p>
              </div>
            {docs.length > 0 && (
              <Link
                href={`/projects/${projectId}/docs`}
                className="inline-flex items-center text-[color:var(--color-primary)] hover:text-[color:var(--color-ink)] transition-colors text-sm font-medium"
              >
                View All
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {docs.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 text-center shadow-sm">
              <svg className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-mist)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[color:var(--color-slate)]">
                No documentation yet. Meeting docs will appear here after meetings are completed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.slice(0, 6).map((doc) => (
                <Link
                  key={doc._id}
                  href={`/projects/${projectId}/docs`}
                  className="group rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-xs text-[color:var(--color-mist)] font-medium mb-1">
                        {new Date(doc.createdAt).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <h3 className="text-sm font-semibold text-[color:var(--color-ink)] group-hover:text-[color:var(--color-primary)] transition-colors">
                        Meeting Notes
                      </h3>
                    </div>
                    <svg className="w-4 h-4 text-[color:var(--color-mist)] group-hover:text-[color:var(--color-primary)] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                        {doc.summary && (() => {
                          // Clean up summary: remove markdown wrappers and headings
                          let cleanSummary = doc.summary
                            .replace(/```markdown\n?/g, '')
                            .replace(/\n?```/g, '')
                            .replace(/```/g, '')
                            .trim();
                          
                          // Get first non-heading line
                          const lines = cleanSummary.split('\n')
                            .map(l => l.trim())
                            .filter(l => l && !l.startsWith('#'));
                          
                          cleanSummary = lines[0] || '';
                          
                          return cleanSummary ? (
                            <p className="text-sm text-[color:var(--color-slate)] line-clamp-2">
                              {cleanSummary}
                            </p>
                          ) : null;
                        })()}
                </Link>
              ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
