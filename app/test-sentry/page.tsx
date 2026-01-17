"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";

export default function SentryTestPage() {
  const [loading, setLoading] = useState(false);

  const throwClientError = () => {
    throw new Error("Sentry Client Test Error");
  };

  const throwServerError = async () => {
    setLoading(true);
    try {
      await fetch("/api/test-sentry");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Sentry Integration Test</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl">Client-Side Error</h2>
        <p className="text-gray-600">
          Clicking this will crash the React component and send an error to Sentry.
        </p>
        <button
          onClick={throwClientError}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Throw Client Error
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">Server-Side Error</h2>
        <p className="text-gray-600">
          Clicking this will call an API route that throws an error on the server.
        </p>
        <button
          onClick={throwServerError}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition disabled:opacity-50"
        >
          {loading ? "Calling API..." : "Throw Server Error"}
        </button>
      </div>
    </div>
  );
}
