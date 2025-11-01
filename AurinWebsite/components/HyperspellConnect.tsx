"use client";

import { useState, useEffect } from "react";

interface HyperspellConnectProps {
  onSuccess?: (accountId: string) => void;
  onError?: (error: Error) => void;
}

export function HyperspellConnect({ onSuccess, onError }: HyperspellConnectProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/hyperspell/token");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get token");
      }
      const data = await response.json();
      setToken(data.token);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to authenticate";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!token) {
      setError("No authentication token available");
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      // Build the Hyperspell Connect URL with the user token
      const connectUrl = `https://connect.hyperspell.com?token=${encodeURIComponent(token)}`;

      // Open the connection URL in a popup window
      const width = 600;
      const height = 700;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const popup = window.open(
        connectUrl,
        "hyperspell-connect",
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      // Listen for the popup to close or for a success message
      const checkPopup = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(checkPopup);
          setConnecting(false);
          if (onSuccess) {
            onSuccess("connected");
          }
        }
      }, 500);

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkPopup);
        if (popup && !popup.closed) {
          popup.close();
        }
        setConnecting(false);
      }, 300000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className="inline-flex items-center rounded-full bg-[var(--color-stone)] text-[var(--color-ink)] px-6 py-2.5 text-sm font-medium"
      >
        Loading...
      </button>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={fetchToken}
          className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:brightness-95 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting || !token}
      className="inline-flex items-center rounded-full bg-[var(--color-primary)] text-white px-6 py-2.5 text-sm font-medium shadow-sm hover:brightness-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {connecting ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Connecting...
        </>
      ) : (
        "Connect Integrations"
      )}
    </button>
  );
}

