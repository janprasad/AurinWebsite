"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { HyperspellConnect } from "@/components/HyperspellConnect";

export default function IntegrationsPage() {
  const integrations = useQuery(api.integrations.list) ?? [];
  const removeIntegration = useMutation(api.integrations.remove);

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm("Are you sure you want to disconnect this integration?")) return;
    await removeIntegration({ integrationId: integrationId as any });
  };

  const hyperspellIntegration = integrations.find((i) => i.provider === "hyperspell");

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-6">Integrations</h1>

      <div className="space-y-6">
        {/* Hyperspell Integration */}
        <div className="bg-white p-6 rounded-lg border border-[color:var(--color-stone)] shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-display font-semibold text-[var(--color-ink)] mb-2">Hyperspell</h2>
              <p className="text-[var(--color-ink)]/70 text-sm leading-relaxed mb-4">
                Connect your accounts (Slack, Gmail, Google Calendar, etc.) through Hyperspell 
                to enable seamless integration with meeting platforms and automatically sync meeting data.
              </p>
              {!hyperspellIntegration && (
                <div className="bg-[var(--color-stone)]/30 p-4 rounded-lg text-sm text-[var(--color-ink)]/80 mb-4">
                  <p className="font-medium mb-2">What you can connect:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Slack - for meeting notifications and summaries</li>
                    <li>Gmail - for email-based meeting invites</li>
                    <li>Google Calendar - for automatic meeting scheduling</li>
                    <li>And more...</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="ml-6">
              {hyperspellIntegration ? (
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 font-semibold">Connected</span>
                  </div>
                  <button
                    onClick={() => handleDisconnect(hyperspellIntegration._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-full text-sm hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <HyperspellConnect
                  onSuccess={() => {
                    alert("Hyperspell connected successfully! Your account connections are now active.");
                  }}
                  onError={(error) => {
                    console.error("Hyperspell connection error:", error);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

