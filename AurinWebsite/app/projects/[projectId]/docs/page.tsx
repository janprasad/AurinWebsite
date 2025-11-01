"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DocumentationPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const docs = useQuery(api.documentation.list, { projectId: projectId as any }) ?? [];
  const searchDocs = useAction(api.documentationSearch.search);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: searchQuery }),
      });
      
      if (!response.ok) throw new Error("Failed to generate embedding");
      const { embedding } = await response.json();
      
      const results = await searchDocs({
        projectId: projectId as any,
        queryEmbedding: embedding,
        limit: 10,
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const displayDocs = searchQuery.trim() ? searchResults : docs;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
      <Link
        href={`/projects/${projectId}`}
            className="inline-flex items-center text-[color:var(--color-slate)] hover:text-[color:var(--color-ink)] transition-colors text-sm mb-4"
      >
        ← Back to Project
      </Link>
          <h1 
            className="text-4xl font-semibold text-[color:var(--color-ink)] mb-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Meeting Documentation
          </h1>
          <p className="text-[color:var(--color-slate)] text-lg">
            Browse and search through all meeting notes and documentation
          </p>
        </div>

      {/* Search Section */}
        <div className="mb-10">
          <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-6 shadow-sm">
            <div className="flex gap-3">
          <input
            type="text"
                placeholder="Search documentation semantically..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-3 rounded-full border border-[color:var(--color-tea)] bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] transition-all"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
                className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-6 py-3 text-sm font-medium shadow-sm hover:brightness-95 disabled:opacity-60 transition-all"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
                  className="inline-flex items-center rounded-full bg-white text-[var(--color-ink)] ring-1 ring-inset ring-[color:var(--color-tea)] px-5 py-3 text-sm font-medium hover:bg-[var(--color-stone)]/60 transition-all"
            >
              Clear
            </button>
          )}
        </div>
        {searchQuery && searchResults.length > 0 && (
              <p className="text-sm text-[color:var(--color-slate)] mt-3">
                Found {searchResults.length} relevant document{searchResults.length !== 1 ? "s" : ""}
          </p>
        )}
          </div>
      </div>

        {/* Documentation Grid */}
      {displayDocs.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <svg className="w-16 h-16 mx-auto mb-4 text-[color:var(--color-mist)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[color:var(--color-slate)] text-lg">
            {searchQuery
              ? "No results found. Try a different search query."
              : "No documentation yet. Meeting docs will appear here after meetings are completed."}
          </p>
            </div>
        </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayDocs.map((doc) => (
              <button
                key={doc._id}
                onClick={() => setSelectedDoc(doc)}
                className="text-left rounded-2xl border border-[color:var(--color-tea)] bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-xs text-[color:var(--color-mist)] font-medium mb-1">
                      {new Date(doc.createdAt).toLocaleDateString('en-US', { 
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <h3 
                      className="text-lg font-semibold text-[color:var(--color-ink)] group-hover:text-[color:var(--color-primary)] transition-colors"
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      Meeting Notes
                    </h3>
                  </div>
                  <svg className="w-5 h-5 text-[color:var(--color-mist)] group-hover:text-[color:var(--color-primary)] transition-colors flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {doc.summary && (
                  <p className="text-sm text-[color:var(--color-slate)] mb-3 line-clamp-2">
                    {doc.summary}
                  </p>
                )}

                {doc.keyPoints && doc.keyPoints.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[color:var(--color-tea)]">
                    <div className="text-xs font-medium text-[color:var(--color-slate)] mb-1">
                      {doc.keyPoints.length} Key Point{doc.keyPoints.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                )}

                {searchQuery && doc.relevanceScore !== undefined && (
                  <div className="mt-3 pt-3 border-t border-[color:var(--color-tea)]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[var(--color-stone)] rounded-full h-1.5">
                        <div 
                          className="bg-[var(--color-primary)] h-1.5 rounded-full transition-all"
                          style={{ width: `${doc.relevanceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[color:var(--color-slate)] font-medium">
                        {Math.round(doc.relevanceScore * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Document Modal */}
        {selectedDoc && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-[color:var(--color-tea)] px-8 py-6 flex justify-between items-start z-10">
                <div>
                  <div className="text-sm text-[color:var(--color-slate)] mb-1">
                    {new Date(selectedDoc.createdAt).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <h2 
                    className="text-3xl font-semibold text-[color:var(--color-ink)]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Meeting Documentation
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="rounded-full p-2 hover:bg-[var(--color-stone)]/60 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6 text-[color:var(--color-slate)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto px-8 py-6 prose prose-slate max-w-none" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                {selectedDoc.summary && (() => {
                  // Clean up summary: remove markdown wrappers and headings
                  let cleanSummary = selectedDoc.summary
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
                    <div className="not-prose mb-6 p-4 rounded-xl bg-[var(--color-stone)]/30 border border-[color:var(--color-tea)]">
                      <h3 className="text-sm font-semibold text-[color:var(--color-ink)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                        Summary
                      </h3>
                      <p className="text-[color:var(--color-slate)] text-sm">
                        {cleanSummary}
                </p>
              </div>
                  ) : null;
                })()}

                {selectedDoc.keyPoints && selectedDoc.keyPoints.length > 0 && (
                  <div className="not-prose mb-6">
                    <h3 className="text-base font-semibold text-[color:var(--color-ink)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      Key Points
                    </h3>
                    <ul className="space-y-2">
                      {selectedDoc.keyPoints.map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] mt-2" />
                          <span className="text-[color:var(--color-slate)] text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

                {selectedDoc.actionItems && selectedDoc.actionItems.length > 0 && (
                  <div className="not-prose mb-6">
                    <h3 className="text-base font-semibold text-[color:var(--color-ink)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      Action Items
                    </h3>
                    <div className="space-y-2">
                      {selectedDoc.actionItems.map((item: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-[var(--color-stone)]/30 border border-[color:var(--color-tea)]">
                          <div className="font-medium text-[color:var(--color-ink)] text-sm mb-1">{item.item}</div>
                          <div className="flex gap-4 text-xs text-[color:var(--color-slate)]">
                            {item.assignee && <span>👤 {item.assignee}</span>}
                            {item.dueDate && <span>📅 {new Date(item.dueDate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                          </div>
                        )}

                <div className="not-prose mb-4">
                  <h3 className="text-base font-semibold text-[color:var(--color-ink)] mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                    Full Documentation
                  </h3>
                </div>

                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedDoc.content.replace(/^```markdown\n?/, '').replace(/\n?```$/, '')}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
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
