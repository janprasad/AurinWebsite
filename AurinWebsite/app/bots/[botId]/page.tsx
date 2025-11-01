"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        href={`/projects/${bot.projectId}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Project
      </Link>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex justify-between items-start mb-4">
          {isEditing ? (
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-3xl font-bold w-full px-2 py-1 border rounded-md dark:bg-slate-700 dark:border-slate-600 mb-2"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2 py-1 border rounded-md dark:bg-slate-700 dark:border-slate-600"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
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

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-semibold mb-4">Assigned Meetings</h2>
        {botMeetings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No meetings assigned to this bot yet.
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


