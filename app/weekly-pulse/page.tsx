'use client'

/**
 * Weekly Pulse Page
 * Displays the user's weekly plant insights
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { WeeklyInsightPulse } from '@/types';
import { WeeklyPulseCard } from '@/components/WeeklyPulseCard';

export default function WeeklyPulsePage() {
    const router = useRouter();
    const [pulse, setPulse] = useState<WeeklyInsightPulse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    // Generate a new pulse
    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);
        try {
            const res = await fetch('/api/weekly-pulse/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            });

            if (!res.ok) {
                throw new Error('Failed to generate pulse');
            }

            const data = await res.json();
            setPulse(data.pulse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate pulse');
        } finally {
            setGenerating(false);
        }
    };

    // Record reaction
    const handleReaction = async (reaction: 'helpful' | 'not_helpful') => {
        if (!pulse) return;

        const res = await fetch(`/api/weekly-pulse/${pulse.id}/reaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reaction }),
        });

        if (!res.ok) {
            throw new Error('Failed to record reaction');
        }
    };

    // On mount, try to generate a pulse for demo
    useEffect(() => {
        handleGenerate().finally(() => setLoading(false));
    }, []);

    return (
        <div className="weekly-pulse-page">
            <style jsx>{`
        .weekly-pulse-page {
          padding: 24px;
          max-width: 800px;
          margin: 0 auto;
        }
        .weekly-pulse-page__header {
          text-align: center;
          margin-bottom: 32px;
        }
        .weekly-pulse-page__title {
          font-size: 32px;
          margin: 0 0 8px 0;
          color: var(--text-primary, #fff);
          text-shadow: 3px 3px 0 var(--shadow-color, #0a0a1a);
        }
        .weekly-pulse-page__subtitle {
          color: var(--text-secondary, #aaa);
          margin: 0;
        }
        .weekly-pulse-page__loading,
        .weekly-pulse-page__error {
          text-align: center;
          padding: 48px;
          color: var(--text-secondary, #aaa);
        }
        .weekly-pulse-page__error {
          color: var(--color-error, #f44336);
        }
        .weekly-pulse-page__actions {
          display: flex;
          justify-content: center;
          margin-top: 24px;
        }
        .weekly-pulse-page__btn {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          background: var(--color-primary, #7c4dff);
          border: 3px solid var(--color-primary-bright, #9d7cff);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .weekly-pulse-page__btn:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .weekly-pulse-page__btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .weekly-pulse-page__back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: bold;
          background: transparent;
          border: 2px solid var(--border-primary, #4a4a6a);
          border-radius: 6px;
          color: var(--text-secondary, #aaa);
          cursor: pointer;
          transition: all 0.1s;
        }
        .weekly-pulse-page__back:hover {
          border-color: var(--text-primary, #fff);
          color: var(--text-primary, #fff);
        }
      `}</style>

            <button
                className="weekly-pulse-page__back"
                onClick={() => router.back()}
            >
                ← Back
            </button>

            <header className="weekly-pulse-page__header">
                <h1 className="weekly-pulse-page__title">📊 Weekly Pulse</h1>
                <p className="weekly-pulse-page__subtitle">
                    AI-powered insights about your plant care this week
                </p>
            </header>

            {loading ? (
                <div className="weekly-pulse-page__loading">
                    <p>🌱 Analyzing your plant data...</p>
                </div>
            ) : error ? (
                <div className="weekly-pulse-page__error">
                    <p>{error}</p>
                    <button
                        className="weekly-pulse-page__btn"
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        {generating ? 'Generating...' : 'Try Again'}
                    </button>
                </div>
            ) : pulse ? (
                <>
                    <WeeklyPulseCard pulse={pulse} onReaction={handleReaction} />
                    <div className="weekly-pulse-page__actions">
                        <button
                            className="weekly-pulse-page__btn"
                            onClick={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? 'Generating...' : '🔄 Refresh Pulse'}
                        </button>
                    </div>
                </>
            ) : (
                <div className="weekly-pulse-page__loading">
                    <p>No pulse data available.</p>
                    <button
                        className="weekly-pulse-page__btn"
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        {generating ? 'Generating...' : 'Generate Pulse'}
                    </button>
                </div>
            )}
        </div>
    );
}
