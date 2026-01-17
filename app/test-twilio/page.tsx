"use client";

import { useState } from "react";

export default function TwilioTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ success?: boolean; error?: string; message?: string } | null>(null);

  const sendTestSms = async (type: string, params: Record<string, unknown> = {}) => {
    setLoading(type);
    setResult(null);
    try {
      const res = await fetch("/api/notifications/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, params }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">📱 Twilio Integration Test</h1>
        <p className="text-gray-600">
          Send test SMS notifications to your configured phone number.
          <br />
          <span className="text-sm italic">
            Note: In dev mode, check console logs. In prod, check your phone.
          </span>
        </p>
      </header>
      
      {result && (
        <div className={`p-4 rounded mb-6 ${result.error || result.success === false ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
          <h3 className="font-bold">{result.error || result.success === false ? "Error" : "Success"}</h3>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="space-y-6">
        {/* Watering Confirmation */}
        <div className="p-4 border rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">🌱 Watering Confirmation</h2>
          <p className="text-sm text-gray-500 mb-4">
            Simulates a successful watering action.
          </p>
          <button
            onClick={() => sendTestSms("watering", { plantName: "Monstera Deliciosa", nextWateringDate: "Tomorrow at 9 AM" })}
            disabled={!!loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading === "watering" ? "Sending..." : "Send Watering SMS"}
          </button>
        </div>

        {/* Tank Alert */}
        <div className="p-4 border rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">💧 Tank Level Alert</h2>
          <p className="text-sm text-gray-500 mb-4">
            Simulates a low water tank warning (20%).
          </p>
          <button
            onClick={() => sendTestSms("tank_low", { farmName: "Kitchen Garden", percentage: 20, estimatedDays: 2 })}
            disabled={!!loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading === "tank_low" ? "Sending..." : "Send Tank Alert"}
          </button>
        </div>

        {/* Critical Alert */}
        <div className="p-4 border rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">🚨 Critical Temp Alert</h2>
          <p className="text-sm text-gray-500 mb-4">
            Simulates a high temperature warning.
          </p>
          <button
            onClick={() => sendTestSms("temp_high", { 
              farmName: "Greenhouse", 
              temperature: 95, 
              plantNames: "Orchids",
              minTemp: 65,
              maxTemp: 85,
              isHigh: true 
            })}
            disabled={!!loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading === "temp_high" ? "Sending..." : "Send Critical Alert"}
          </button>
        </div>
      </div>
    </div>
  );
}
