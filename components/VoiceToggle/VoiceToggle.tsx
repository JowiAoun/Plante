/**
 * VoiceToggle Component
 * Toggle button for enabling/disabling voice output
 */

import React from 'react';
import './VoiceToggle.css';

export interface VoiceToggleProps {
    /** Whether voice is enabled */
    enabled: boolean;
    /** Toggle callback */
    onToggle: (enabled: boolean) => void;
    /** Disabled state */
    disabled?: boolean;
}

/**
 * VoiceToggle - Pixel-art styled voice on/off toggle
 */
export const VoiceToggle: React.FC<VoiceToggleProps> = ({
    enabled,
    onToggle,
    disabled = false,
}) => {
    return (
        <button
            type="button"
            className={`voice-toggle ${enabled ? 'voice-toggle--enabled' : 'voice-toggle--disabled'}`}
            onClick={() => onToggle(!enabled)}
            disabled={disabled}
            aria-label={enabled ? 'Disable voice responses' : 'Enable voice responses'}
            aria-pressed={enabled}
        >
            <span className="voice-toggle__icon" aria-hidden="true">
                {enabled ? '🔊' : '🔇'}
            </span>
            <span className="voice-toggle__label">
                {enabled ? 'Voice On' : 'Voice Off'}
            </span>
        </button>
    );
};

export default VoiceToggle;
