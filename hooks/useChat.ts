'use client';

/**
 * useChat Hook
 * Manages chat state, API communication, and voice synthesis
 */

import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, ChatErrorType } from '@/types';

// Local storage key for voice preference
const VOICE_PREFERENCE_KEY = 'plante-chat-voice-enabled';

/**
 * Generate unique message ID
 */
function generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Chat hook return type
 */
export interface UseChatReturn {
    messages: ChatMessage[];
    isLoading: boolean;
    error: ChatErrorType | null;
    errorMessage: string | null;
    voiceEnabled: boolean;
    audioUrl: string | null;
    isSpeaking: boolean;
    sendMessage: (text: string) => Promise<void>;
    toggleVoice: () => void;
    clearHistory: () => void;
    clearError: () => void;
    playAudio: (url: string) => void;
    stopAudio: () => void;
}

/**
 * useChat - Chat state management hook
 */
export function useChat(): UseChatReturn {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ChatErrorType | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Load voice preference from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(VOICE_PREFERENCE_KEY);
        if (stored !== null) {
            setVoiceEnabled(stored === 'true');
        }
    }, []);

    // Save voice preference to localStorage and stop audio when disabling
    const toggleVoice = useCallback(() => {
        setVoiceEnabled((prev) => {
            const newValue = !prev;
            localStorage.setItem(VOICE_PREFERENCE_KEY, String(newValue));
            // Stop any playing audio when disabling voice
            if (!newValue) {
                setAudioUrl(null);
                setIsSpeaking(false);
            }
            return newValue;
        });
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
        setErrorMessage(null);
    }, []);

    // Clear chat history
    const clearHistory = useCallback(() => {
        setMessages([]);
        clearError();
    }, [clearError]);

    // Play audio
    const playAudio = useCallback((url: string) => {
        setAudioUrl(url);
        setIsSpeaking(true);
    }, []);

    // Stop audio
    const stopAudio = useCallback(() => {
        setAudioUrl(null);
        setIsSpeaking(false);
    }, []);

    // Fetch voice audio for a response
    const fetchVoiceAudio = useCallback(async (text: string): Promise<string | undefined> => {
        try {
            const response = await fetch('/api/chat/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                // Voice is optional, just log and continue
                console.warn('Voice synthesis failed');
                return undefined;
            }

            // Convert audio to blob URL
            const audioBlob = await response.blob();
            return URL.createObjectURL(audioBlob);
        } catch {
            console.warn('Voice synthesis error');
            return undefined;
        }
    }, []);

    // Send a message to the AI
    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        clearError();

        // Add user message
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: text.trim(),
            timestamp: new Date().toISOString(),
        };

        // Add loading message for AI
        const loadingMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            isLoading: true,
        };

        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setIsLoading(true);

        try {
            // Send to API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text.trim(),
                    conversationHistory: messages,
                    voiceEnabled,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            // Get voice audio if enabled
            let voiceUrl: string | undefined;
            if (voiceEnabled && data.response) {
                voiceUrl = await fetchVoiceAudio(data.response);
            }

            // Replace loading message with actual response
            const assistantMessage: ChatMessage = {
                id: loadingMessage.id,
                role: 'assistant',
                content: data.response,
                timestamp: new Date().toISOString(),
                audioUrl: voiceUrl,
                isLoading: false,
            };

            setMessages((prev) =>
                prev.map((msg) => (msg.id === loadingMessage.id ? assistantMessage : msg))
            );

            // Auto-play audio if voice is enabled
            if (voiceUrl) {
                playAudio(voiceUrl);
            }
        } catch (err) {
            // Remove loading message on error
            setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id));

            const errorMsg = err instanceof Error ? err.message : 'Unknown error';

            // Determine error type
            if (errorMsg.includes('rate') || errorMsg.includes('quota')) {
                setError('GEMINI_RATE_LIMIT');
                setErrorMessage('AI is thinking too hard, please wait a moment');
            } else if (errorMsg.includes('context') || errorMsg.includes('token')) {
                setError('CONTEXT_TOO_LONG');
                setErrorMessage('Starting a fresh conversation');
                clearHistory();
            } else {
                setError('NETWORK_ERROR');
                setErrorMessage('Connection issues, please try again');
            }
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading, voiceEnabled, clearError, fetchVoiceAudio, playAudio, clearHistory]);

    return {
        messages,
        isLoading,
        error,
        errorMessage,
        voiceEnabled,
        audioUrl,
        isSpeaking,
        sendMessage,
        toggleVoice,
        clearHistory,
        clearError,
        playAudio,
        stopAudio,
    };
}
