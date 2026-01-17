'use client';

/**
 * AIAvatar Component
 * Animated AI assistant character with different states
 */

import React from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import './AIAvatar.css';

export interface AIAvatarProps {
    /** Whether the AI is speaking */
    speaking?: boolean;
    /** Current emotion/state */
    emotion?: 'happy' | 'thinking' | 'alert';
    /** Size variant */
    size?: 'small' | 'medium' | 'large';
}

/**
 * AIAvatar - Pixel-art AI assistant avatar
 */
export const AIAvatar: React.FC<AIAvatarProps> = ({
    speaking = false,
    emotion = 'happy',
    size = 'medium',
}) => {
    const prefersReducedMotion = useReducedMotion();

    // Get emoji based on emotion
    const getEmoji = () => {
        switch (emotion) {
            case 'thinking':
                return '🤔';
            case 'alert':
                return '⚠️';
            case 'happy':
            default:
                return '🌱';
        }
    };

    return (
        <div
            className={`ai-avatar ai-avatar--${size} ${speaking && !prefersReducedMotion ? 'ai-avatar--speaking' : ''}`}
            aria-label={`Plante AI assistant, ${speaking ? 'speaking' : 'idle'}`}
            role="img"
        >
            <div className="ai-avatar__face">
                <span className="ai-avatar__emoji" aria-hidden="true">
                    {getEmoji()}
                </span>
            </div>
            {speaking && (
                <div className="ai-avatar__speech-indicator" aria-hidden="true">
                    <span className="ai-avatar__dot"></span>
                    <span className="ai-avatar__dot"></span>
                    <span className="ai-avatar__dot"></span>
                </div>
            )}
            <span className="ai-avatar__name">Plante</span>
        </div>
    );
};

export default AIAvatar;
