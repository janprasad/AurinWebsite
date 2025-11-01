"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function DocumentationPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const docs = useQuery(api.documentation.list, { projectId: projectId as any }) ?? [];
  const searchDocs = useAction(api.documentationSearch.search);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{
      _id: string;
      meetingId: string;
      content: string;
      summary?: string;
      keyPoints?: string[];
      actionItems?: Array<{
        item: string;
        assignee?: string;
        dueDate?: number;
      }>;
      createdAt: number;
      relevanceScore: number;
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      // Generate embedding client-side
      const response = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: searchQuery }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate embedding");
      }
      
      const { embedding } = await response.json();
      
      // Search with the embedding
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
    <div className="max-w-6xl mx-auto p-8">
      <Link
        href={`/projects/${projectId}`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Project
      </Link>

      <h1 className="text-3xl font-bold mb-6">Meeting Documentation</h1>

      {/* Search Section */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Semantic Search</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search across all meeting documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="flex-1 px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {searchQuery && searchResults.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Documentation List */}
      {displayDocs.length === 0 ? (
        <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery
              ? "No results found. Try a different search query."
              : "No documentation yet. Meeting docs will appear here after meetings are completed."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayDocs.map((doc) => (
            <div
              key={doc._id}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Documentation from {new Date(doc.createdAt).toLocaleDateString()}
                  </h3>
                  {searchQuery && doc.relevanceScore !== undefined && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Relevance: {(doc.relevanceScore * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                <Link
                  href={`/meetings/${doc.meetingId}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Meeting →
                </Link>
              </div>

              {doc.summary && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <p className="text-gray-700 dark:text-gray-300">{doc.summary}</p>
                </div>
              )}

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Content</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {doc.content}
                </p>
              </div>

              {doc.keyPoints && doc.keyPoints.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Key Points</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {doc.keyPoints.map((point, i) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {doc.actionItems && doc.actionItems.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Action Items</h4>
                  <ul className="space-y-2">
                    {doc.actionItems.map((item, i) => (
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
          ))}
        </div>
      )}
    </div>
  );
}


