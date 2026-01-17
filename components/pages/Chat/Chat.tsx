'use client';

/**
 * Chat Page Component
 * AI-powered chat interface with voice synthesis
 */

import React from 'react';
import { AIAvatar } from '@/components/AIAvatar';
import { ChatMessageList } from '@/components/ChatMessageList';
import { ChatInput } from '@/components/ChatInput';
import { VoiceToggle } from '@/components/VoiceToggle';
import { AudioPlayer } from '@/components/AudioPlayer';
import { useChat } from '@/hooks/useChat';
import './Chat.css';

/**
 * Chat - Main chat page component
 */
export const Chat: React.FC = () => {
    const {
        messages,
        isLoading,
        error,
        errorMessage,
        voiceEnabled,
        audioUrl,
        isSpeaking,
        sendMessage,
        toggleVoice,
        clearError,
        playAudio,
        stopAudio,
    } = useChat();

    return (
        <div className="chat">
            {/* Header with AI Avatar */}
            <header className="chat__header">
                <AIAvatar
                    speaking={isSpeaking}
                    emotion={error ? 'alert' : isLoading ? 'thinking' : 'happy'}
                    size="medium"
                />
                <div className="chat__header-controls">
                    <VoiceToggle enabled={voiceEnabled} onToggle={toggleVoice} />
                </div>
            </header>

            {/* Error Banner */}
            {error && errorMessage && (
                <div className="chat__error" role="alert">
                    <span className="chat__error-icon" aria-hidden="true">⚠️</span>
                    <span className="chat__error-message">{errorMessage}</span>
                    <button
                        type="button"
                        className="chat__error-dismiss"
                        onClick={clearError}
                        aria-label="Dismiss error"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Message List */}
            <ChatMessageList messages={messages} onPlayAudio={playAudio} />

            {/* Input Area */}
            <ChatInput
                onSend={sendMessage}
                disabled={isLoading}
                placeholder={isLoading ? 'Plante is thinking...' : 'Ask me about your plants...'}
            />

            {/* Hidden Audio Player */}
            <AudioPlayer
                audioUrl={audioUrl || undefined}
                autoPlay
                onEnd={stopAudio}
                onError={stopAudio}
                onPlay={() => { }}
            />
        </div>
    );
};

export default Chat;
