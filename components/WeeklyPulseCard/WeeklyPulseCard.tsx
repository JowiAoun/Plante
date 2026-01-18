'use client'

/**
 * WeeklyPulseCard Component
 * Displays the weekly plant insight summary with reaction buttons
 */

import React, { useState } from 'react';
import type { WeeklyInsightPulse } from '@/types';
import './WeeklyPulseCard.css';

export interface WeeklyPulseCardProps {
    /** The weekly pulse data */
    pulse: WeeklyInsightPulse;
    /** Callback when user reacts */
    onReaction?: (reaction: 'helpful' | 'not_helpful') => Promise<void>;
}

const issueIcons: Record<string, string> = {
    temperature: '🌡️',
    humidity: '💧',
    soilMoisture: '🌱',
    none: '✨',
};

const issueLabels: Record<string, string> = {
    temperature: 'Temperature',
    humidity: 'Humidity',
    soilMoisture: 'Soil Moisture',
    none: 'All Good!',
};

/**
 * WeeklyPulseCard - Display weekly plant insights
 */
export const WeeklyPulseCard: React.FC<WeeklyPulseCardProps> = ({
    pulse,
    onReaction,
}) => {
    const [reaction, setReaction] = useState<'helpful' | 'not_helpful' | null>(
        pulse.userReaction || null
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReaction = async (value: 'helpful' | 'not_helpful') => {
        if (isSubmitting || reaction) return;

        setIsSubmitting(true);
        try {
            await onReaction?.(value);
            setReaction(value);
        } catch (error) {
            console.error('Failed to record reaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const weekRange = `${new Date(pulse.stats.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(pulse.stats.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    return (
        <div className="weekly-pulse-card">
            <div className="weekly-pulse-card__header">
                <span className="weekly-pulse-card__icon">📊</span>
                <div className="weekly-pulse-card__header-text">
                    <h2 className="weekly-pulse-card__title">Weekly Plant Report</h2>
                    <span className="weekly-pulse-card__date">{weekRange}</span>
                </div>
            </div>

            <div className="weekly-pulse-card__summary">
                <p>{pulse.summary}</p>
            </div>

            {pulse.primaryIssue !== 'none' && (
                <div className="weekly-pulse-card__issue">
                    <span className="weekly-pulse-card__issue-icon">
                        {issueIcons[pulse.primaryIssue]}
                    </span>
                    <span className="weekly-pulse-card__issue-label">
                        Primary Issue: {issueLabels[pulse.primaryIssue]}
                    </span>
                </div>
            )}

            {pulse.suggestions.length > 0 && (
                <div className="weekly-pulse-card__suggestions">
                    <h3>💡 Suggestions</h3>
                    <ul>
                        {pulse.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="weekly-pulse-card__encouragement">
                {pulse.encouragement}
            </div>

            <div className="weekly-pulse-card__stats">
                <div className="weekly-pulse-card__stat">
                    <span className="weekly-pulse-card__stat-value">{pulse.stats.alerts.total}</span>
                    <span className="weekly-pulse-card__stat-label">Total Alerts</span>
                </div>
                <div className="weekly-pulse-card__stat">
                    <span className="weekly-pulse-card__stat-value">{pulse.stats.alerts.criticalCount}</span>
                    <span className="weekly-pulse-card__stat-label">Critical</span>
                </div>
                <div className="weekly-pulse-card__stat">
                    <span className="weekly-pulse-card__stat-value">{pulse.stats.averageResponseTimeMinutes}m</span>
                    <span className="weekly-pulse-card__stat-label">Avg Response</span>
                </div>
            </div>

            <div className="weekly-pulse-card__reaction">
                <span className="weekly-pulse-card__reaction-label">
                    {reaction ? 'Thanks for your feedback!' : 'Was this helpful?'}
                </span>
                <div className="weekly-pulse-card__reaction-buttons">
                    <button
                        className={`weekly-pulse-card__reaction-btn ${reaction === 'helpful' ? 'weekly-pulse-card__reaction-btn--active' : ''}`}
                        onClick={() => handleReaction('helpful')}
                        disabled={isSubmitting || reaction !== null}
                        aria-label="Helpful"
                    >
                        👍
                    </button>
                    <button
                        className={`weekly-pulse-card__reaction-btn ${reaction === 'not_helpful' ? 'weekly-pulse-card__reaction-btn--active' : ''}`}
                        onClick={() => handleReaction('not_helpful')}
                        disabled={isSubmitting || reaction !== null}
                        aria-label="Not helpful"
                    >
                        👎
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeeklyPulseCard;
