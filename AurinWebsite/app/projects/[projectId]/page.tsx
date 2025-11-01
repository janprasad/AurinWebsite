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
      // Skip docs query if project is not available (deleted/unauthorized)
      project ? { projectId: projectId as any } : "skip"
    ) ?? [];
  const deleteProject = useMutation(api.projects.remove);

  const [showCreateBot, setShowCreateBot] = useState(false);
  const [botName, setBotName] = useState("");
  const [botDescription, setBotDescription] = useState("");

  const createBot = useMutation(api.bots.create);

  const handleCreateBot = async () => {
    if (!botName.trim() || !project) return;
    await createBot({
      name: botName,
      description: botDescription || undefined,
      projectId: project._id,
    });
    setBotName("");
    setBotDescription("");
    setShowCreateBot(false);
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await deleteProject({ projectId: projectId as any });
    router.push("/");
  };

  if (project === undefined) {
    return <div className="p-8">Loading...</div>;
  }

  if (project === null) {
    return <div className="p-8">Project not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
            )}
          </div>
          <button
            onClick={handleDeleteProject}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bots Section */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Recall Bots</h2>
            <button
              onClick={() => setShowCreateBot(!showCreateBot)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              {showCreateBot ? "Cancel" : "+ New Bot"}
            </button>
          </div>

          {showCreateBot && (
            <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
              <input
                type="text"
                placeholder="Bot name"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-white border-slate-300 mb-2"
              />
              <textarea
                placeholder="Description (optional)"
                value={botDescription}
                onChange={(e) => setBotDescription(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-white border-slate-300 mb-2"
                rows={2}
              />
              <button
                onClick={handleCreateBot}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors w-full"
              >
                Create Bot
              </button>
            </div>
          )}

          {bots.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No bots yet. Create one to get started!
            </p>
          ) : (
            <div className="space-y-2">
              {bots.map((bot) => (
                <Link
                  key={bot._id}
                  href={`/bots/${bot._id}`}
                  className="block p-3 bg-slate-50 dark:bg-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className="font-semibold">{bot.name}</div>
                  {bot.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {bot.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Meetings Section */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Meetings</h2>
            <Link
              href={`/meetings/new?projectId=${projectId}`}
              className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:brightness-95 transition-colors text-sm"
            >
              + New Meeting
            </Link>
          </div>

          {meetings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No meetings scheduled yet.
            </p>
          ) : (
            <div className="space-y-2">
              {meetings.map((meeting) => (
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

      {/* Documentation Section */}
      <div className="mt-8 bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Meeting Documentation</h2>
          <Link
            href={`/projects/${projectId}/docs`}
            className="text-blue-600 hover:underline"
          >
            View All & Search →
          </Link>
        </div>

        {docs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No documentation yet. Meeting docs will appear here after meetings are completed.
          </p>
        ) : (
          <div className="space-y-4">
            {docs.slice(0, 5).map((doc) => (
              <div
                key={doc._id}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-md"
              >
                <div className="font-semibold mb-2">
                  Documentation from {new Date(doc.createdAt).toLocaleDateString()}
                </div>
                {doc.summary && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {doc.summary}
                  </p>
                )}
                <p className="text-sm line-clamp-2">{doc.content}</p>
              </div>
            ))}
            {docs.length > 5 && (
              <Link
                href={`/projects/${projectId}/docs`}
                className="block text-center text-blue-600 hover:underline"
              >
                View all {docs.length} documents →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


