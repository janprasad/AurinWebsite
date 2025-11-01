"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[color:var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[color:var(--color-slate)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (meeting === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[color:var(--color-ink)] mb-2">Meeting not found</h2>
          <Link href="/" className="text-[color:var(--color-primary)] hover:underline">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: typeof meeting.status) => {
    await updateMeeting({ meetingId: meeting._id, status: newStatus });
    setStatus(newStatus);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) return;
    await deleteMeeting({ meetingId: meeting._id });
    router.push(`/projects/${meeting.projectId}`);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href={`/projects/${meeting.projectId}`}
            className="inline-flex items-center text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors text-sm mb-4"
          >
            ← Back to Project
          </Link>
          
          <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 
                  className="text-4xl font-semibold text-[color:var(--color-ink)] mb-4"
                  style={{fontFamily:'var(--font-display)'}}
                >
                  {meeting.name}
                </h1>
                <div className="space-y-2 text-[color:var(--color-slate)]">
                  {project && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <Link href={`/projects/${project._id}`} className="text-[color:var(--color-primary)] hover:underline">
                        {project.name}
                      </Link>
                    </div>
                  )}
                  {bot && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <Link href={`/bots/${bot._id}`} className="text-[color:var(--color-primary)] hover:underline">
                        {bot.name}
                      </Link>
                    </div>
                  )}
                  {meeting.scheduledTime && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(meeting.scheduledTime).toLocaleString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleDelete}
                className="inline-flex items-center rounded-full bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 px-5 py-2.5 text-sm font-medium hover:bg-red-100 transition-all flex-shrink-0"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>

            <div className="flex items-center gap-3 pt-6 border-t border-[color:var(--color-tea)]">
              <label className="text-sm font-medium text-[color:var(--color-ink)]">Status:</label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as typeof meeting.status)}
                className="px-4 py-2 rounded-full border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all text-sm font-medium"
              >
                <option value="scheduled">📅 Scheduled</option>
                <option value="in_progress">🔵 In Progress</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documentation */}
        {meetingDoc ? (
          <div>
            <h2 
              className="text-2xl font-semibold text-[color:var(--color-ink)] mb-6"
              style={{fontFamily:'var(--font-display)'}}
            >
              Meeting Documentation
            </h2>
            
            <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 shadow-sm">
              {meetingDoc.summary && (() => {
                // Clean up summary: remove markdown wrappers and headings
                let cleanSummary = meetingDoc.summary
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
                  <div className="mb-8 p-5 rounded-xl bg-[var(--color-stone)]/30 border border-[color:var(--color-tea)]">
                    <h3 className="text-base font-semibold text-[color:var(--color-ink)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      Summary
                    </h3>
                    <p className="text-[color:var(--color-slate)] leading-relaxed">
                      {cleanSummary}
                    </p>
                  </div>
                ) : null;
              })()}

              {meetingDoc.keyPoints && meetingDoc.keyPoints.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-[color:var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {meetingDoc.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2" />
                        <span className="text-[color:var(--color-slate)]">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {meetingDoc.actionItems && meetingDoc.actionItems.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-[color:var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                    Action Items
                  </h3>
                  <div className="space-y-3">
                    {meetingDoc.actionItems.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[var(--color-stone)]/30 border border-[color:var(--color-tea)]">
                        <div className="font-medium text-[color:var(--color-ink)] mb-2">{item.item}</div>
                        <div className="flex gap-4 text-sm text-[color:var(--color-slate)]">
                          {item.assignee && <span>👤 {item.assignee}</span>}
                          {item.dueDate && <span>📅 {new Date(item.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-base font-semibold text-[color:var(--color-ink)] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                  Full Documentation
                </h3>
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {meetingDoc.content.replace(/^```markdown\n?/, '').replace(/\n?```$/, '')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ) : meeting.status === "completed" ? (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-8 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-yellow-800 font-medium">
              This meeting is marked as completed but has no documentation yet.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-8 text-center shadow-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-[color:var(--color-mist)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[color:var(--color-slate)]">
              Documentation will be generated after the meeting is completed.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .markdown-content {
          color: var(--color-slate) !important;
          line-height: 1.75 !important;
        }
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          color: var(--color-ink) !important;
          font-family: var(--font-display) !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
        }
        .markdown-content h1 { 
          font-size: 1.875rem !important;
          margin-top: 3rem !important;
          margin-bottom: 1.5rem !important;
        }
        .markdown-content h2 { 
          font-size: 1.5rem !important;
          margin-top: 2.5rem !important;
          margin-bottom: 1.25rem !important;
        }
        .markdown-content h3 { 
          font-size: 1.25rem !important;
          margin-top: 2rem !important;
          margin-bottom: 1rem !important;
        }
        .markdown-content h4 { 
          font-size: 1.125rem !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.75rem !important;
        }
        .markdown-content h1:first-child,
        .markdown-content h2:first-child,
        .markdown-content h3:first-child,
        .markdown-content h4:first-child { 
          margin-top: 0 !important;
        }
        .markdown-content p { 
          margin-bottom: 1.5rem !important;
          line-height: 1.75 !important;
        }
        .markdown-content ul, 
        .markdown-content ol { 
          margin-bottom: 1.5rem !important;
          margin-left: 1.5rem !important;
          padding-left: 0.5rem !important;
        }
        .markdown-content ul {
          list-style-type: disc !important;
          list-style-position: outside !important;
        }
        .markdown-content ol {
          list-style-type: decimal !important;
          list-style-position: outside !important;
        }
        .markdown-content li { 
          line-height: 1.75 !important;
          margin-bottom: 0.75rem !important;
          padding-left: 0.5rem !important;
        }
        .markdown-content li::marker {
          color: var(--color-primary) !important;
        }
        .markdown-content ul ul,
        .markdown-content ol ol,
        .markdown-content ul ol,
        .markdown-content ol ul {
          margin-top: 0.75rem !important;
          margin-bottom: 0.5rem !important;
        }
        .markdown-content code {
          background-color: rgba(var(--color-stone-rgb, 231 229 228), 0.4) !important;
          padding: 0.25rem 0.5rem !important;
          border-radius: 0.25rem !important;
          font-size: 0.875rem !important;
        }
        .markdown-content pre {
          background-color: rgba(var(--color-stone-rgb, 231 229 228), 0.4) !important;
          padding: 1rem !important;
          border-radius: 0.75rem !important;
          overflow-x: auto !important;
          margin-bottom: 1.5rem !important;
        }
        .markdown-content pre code {
          background-color: transparent !important;
          padding: 0 !important;
        }
        .markdown-content blockquote {
          border-left: 4px solid var(--color-primary) !important;
          padding-left: 1rem !important;
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
          margin-top: 1.5rem !important;
          margin-bottom: 1.5rem !important;
          font-style: italic !important;
        }
        .markdown-content strong { 
          font-weight: 600 !important;
          color: var(--color-ink) !important;
        }
        .markdown-content em {
          font-style: italic !important;
        }
        .markdown-content a {
          color: var(--color-primary) !important;
          text-decoration: underline !important;
        }
        .markdown-content a:hover {
          opacity: 0.8 !important;
        }
        .markdown-content table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin-top: 1.5rem !important;
          margin-bottom: 1.5rem !important;
        }
        .markdown-content th, 
        .markdown-content td {
          border: 1px solid var(--color-tea) !important;
          padding: 0.75rem 1rem !important;
          text-align: left !important;
        }
        .markdown-content th {
          background-color: rgba(var(--color-stone-rgb, 231 229 228), 0.3) !important;
          font-weight: 600 !important;
        }
        .markdown-content hr {
          margin-top: 3rem !important;
          margin-bottom: 3rem !important;
          border-color: var(--color-tea) !important;
        }
      `}</style>
    </div>
  );
}
