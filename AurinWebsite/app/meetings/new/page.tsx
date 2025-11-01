"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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

  const projectBots = projectId
    ? bots.filter((b) => b.projectId === projectId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !projectId || !botId) return;

    await createMeeting({
      name,
      projectId: projectId as any,
      botId: botId as any,
      scheduledTime: scheduledTime ? new Date(scheduledTime).getTime() : undefined,
    });

    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">Schedule New Meeting</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Meeting Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Project</label>
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setBotId(""); // Reset bot selection when project changes
            }}
            className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
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
          <label className="block text-sm font-semibold mb-2">Recall Bot</label>
          <select
            value={botId}
            onChange={(e) => setBotId(e.target.value)}
            className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
            required
            disabled={!projectId}
          >
            <option value="">
              {projectId ? "Select a bot" : "Select a project first"}
            </option>
            {projectBots.map((bot) => (
              <option key={bot._id} value={bot._id}>
                {bot.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Scheduled Time (optional)
          </label>
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Meeting
          </button>
          <Link
            href={projectId ? `/projects/${projectId}` : "/"}
            className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500 transition-colors inline-block"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}


