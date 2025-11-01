"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;
  const meeting = useQuery(api.meetings.get, { meetingId: meetingId as any });
  const bot = useQuery(
    api.bots.get,
    meeting ? { botId: meeting.botId } : "skip"
  );
  const project = useQuery(
    api.projects.get,
    meeting ? { projectId: meeting.projectId } : "skip"
  );
  const docs = useQuery(api.documentation.list, {
    projectId: meeting?.projectId ?? "skip",
  }) ?? [];
  const meetingDoc = docs.find((d) => d.meetingId === meetingId);
  const updateMeeting = useMutation(api.meetings.update);
  const deleteMeeting = useMutation(api.meetings.remove);

  const [status, setStatus] = useState(meeting?.status || "scheduled");

  if (meeting === undefined) {
    return <div className="p-8">Loading...</div>;
  }

  if (meeting === null) {
    return <div className="p-8">Meeting not found</div>;
  }

  const handleStatusChange = async (newStatus: typeof meeting.status) => {
    await updateMeeting({ meetingId: meeting._id, status: newStatus });
    setStatus(newStatus);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    await deleteMeeting({ meetingId: meeting._id });
    router.push(`/projects/${meeting.projectId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link
        href={`/projects/${meeting.projectId}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Project
      </Link>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{meeting.name}</h1>
            <div className="text-gray-600 dark:text-gray-400 space-y-1">
              {project && (
                <div>
                  Project: <Link href={`/projects/${project._id}`} className="text-blue-600 hover:underline">{project.name}</Link>
                </div>
              )}
              {bot && (
                <div>
                  Bot: <Link href={`/bots/${bot._id}`} className="text-blue-600 hover:underline">{bot.name}</Link>
                </div>
              )}
              {meeting.scheduledTime && (
                <div>
                  Scheduled: {new Date(meeting.scheduledTime).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>

        <div className="flex gap-2">
          <label className="text-sm font-semibold">Status:</label>
          <select
            value={status}
            onChange={(e) =>
              handleStatusChange(e.target.value as typeof meeting.status)
            }
            className="px-3 py-1 border rounded-md dark:bg-slate-700 dark:border-slate-600"
          >
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {meetingDoc && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Documentation</h2>
          {meetingDoc.summary && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300">{meetingDoc.summary}</p>
            </div>
          )}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Content</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {meetingDoc.content}
            </p>
          </div>
          {meetingDoc.keyPoints && meetingDoc.keyPoints.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Key Points</h3>
              <ul className="list-disc list-inside space-y-1">
                {meetingDoc.keyPoints.map((point, i) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {meetingDoc.actionItems && meetingDoc.actionItems.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Action Items</h3>
              <ul className="space-y-2">
                {meetingDoc.actionItems.map((item, i) => (
                  <li
                    key={i}
                    className="p-2 bg-slate-50 dark:bg-slate-700 rounded-md"
                  >
                    <div className="font-medium">{item.item}</div>
                    {item.assignee && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Assignee: {item.assignee}
                      </div>
                    )}
                    {item.dueDate && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!meetingDoc && meeting.status === "completed" && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200">
            This meeting is marked as completed but has no documentation yet.
          </p>
        </div>
      )}
    </div>
  );
}


