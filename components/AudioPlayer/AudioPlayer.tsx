'use client';

/**
 * AudioPlayer Component
 * Hidden audio element for playing TTS responses
 */

import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayer.css';

export interface AudioPlayerProps {
    /** Audio URL or base64 data to play */
    audioUrl?: string;
    /** Auto-play when audioUrl changes */
    autoPlay?: boolean;
    /** Callback when audio finishes */
    onEnd?: () => void;
    /** Callback when audio starts playing */
    onPlay?: () => void;
    /** Callback when audio fails to load */
    onError?: () => void;
}

/**
 * AudioPlayer - Hidden audio player for TTS
 */
export const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioUrl,
    autoPlay = false,
    onEnd,
    onPlay,
    onError,
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // If no audioUrl, stop any playing audio
        if (!audioUrl) {
            audio.pause();
            audio.currentTime = 0;
            return;
        }

        setIsLoading(true);

        const handleCanPlay = () => {
            setIsLoading(false);
            if (autoPlay) {
                audio.play().catch(() => {
                    // Auto-play blocked, user interaction required
                    onError?.();
                });
            }
        };

        const handlePlay = () => {
            onPlay?.();
        };

        const handleEnded = () => {
            onEnd?.();
        };

        const handleError = () => {
            setIsLoading(false);
            onError?.();
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        // Load new audio
        audio.src = audioUrl;
        audio.load();

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [audioUrl, autoPlay, onEnd, onPlay, onError]);

    return (
        <div className="audio-player">
            <audio ref={audioRef} className="audio-player__element" aria-hidden="true" />
            {isLoading && (
                <div className="audio-player__loading" aria-live="polite">
                    <span className="audio-player__loading-text">Loading audio...</span>
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;
