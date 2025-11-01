"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function IntegrationsPage() {
  const integrations = useQuery(api.integrations.list) ?? [];
  const connectIntegration = useAction(api.integrations.connect);
  const removeIntegration = useMutation(api.integrations.remove);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [hyperspellToken, setHyperspellToken] = useState("");
  const [mossToken, setMossToken] = useState("");
  const [recallToken, setRecallToken] = useState("");

  const handleConnect = async (
    provider: "hyperspell" | "recall" | "moss",
    token: string
  ) => {
    if (!token.trim()) {
      alert("Please enter an access token");
      return;
    }
    setConnecting(provider);
    try {
      await connectIntegration({ provider, code: token });
      if (provider === "hyperspell") setHyperspellToken("");
      if (provider === "moss") setMossToken("");
      if (provider === "recall") setRecallToken("");
      alert(`${provider} connected successfully!`);
    } catch (error) {
      alert(`Failed to connect ${provider}: ${error}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return;
    await removeIntegration({ integrationId: integrationId as any });
  };

  const hyperspellIntegration = integrations.find((i) => i.provider === "hyperspell");
  const mossIntegration = integrations.find((i) => i.provider === "moss");
  const recallIntegration = integrations.find((i) => i.provider === "recall");

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">Integrations</h1>

      <div className="space-y-6">
        {/* Hyperspell Integration */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Hyperspell</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect your Hyperspell account to enable integrations with meeting
                platforms.
              </p>
            </div>
            {hyperspellIntegration ? (
              <div className="flex items-center gap-4">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  Connected
                </span>
                <button
                  onClick={() => handleDisconnect(hyperspellIntegration._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Access Token"
                  value={hyperspellToken}
                  onChange={(e) => setHyperspellToken(e.target.value)}
                  className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                  disabled={connecting !== null}
                />
                <button
                  onClick={() => handleConnect("hyperspell", hyperspellToken)}
                  disabled={connecting !== null}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {connecting === "hyperspell" ? "Connecting..." : "Connect"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Moss Integration */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Moss</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect Moss for semantic search across your meeting documentation.
              </p>
            </div>
            {mossIntegration ? (
              <div className="flex items-center gap-4">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  Connected
                </span>
                <button
                  onClick={() => handleDisconnect(mossIntegration._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Access Token"
                  value={mossToken}
                  onChange={(e) => setMossToken(e.target.value)}
                  className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                  disabled={connecting !== null}
                />
                <button
                  onClick={() => handleConnect("moss", mossToken)}
                  disabled={connecting !== null}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {connecting === "moss" ? "Connecting..." : "Connect"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recall Integration */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Recall</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect Recall API to enable bot creation and meeting management.
              </p>
            </div>
            {recallIntegration ? (
              <div className="flex items-center gap-4">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  Connected
                </span>
                <button
                  onClick={() => handleDisconnect(recallIntegration._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Access Token"
                  value={recallToken}
                  onChange={(e) => setRecallToken(e.target.value)}
                  className="px-4 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
                  disabled={connecting !== null}
                />
                <button
                  onClick={() => handleConnect("recall", recallToken)}
                  disabled={connecting !== null}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {connecting === "recall" ? "Connecting..." : "Connect"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

