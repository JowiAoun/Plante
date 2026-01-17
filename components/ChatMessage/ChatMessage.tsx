'use client';

/**
 * ChatMessage Component
 * Individual chat message bubble
 */

import React from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';
import './ChatMessage.css';

export interface ChatMessageProps {
    /** The message data */
    message: ChatMessageType;
    /** Callback to play audio */
    onPlayAudio?: (audioUrl: string) => void;
}

/**
 * ChatMessage - Single message in the chat
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    onPlayAudio,
}) => {
    const isUser = message.role === 'user';
    const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div
            className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}
            role="article"
            aria-label={`${isUser ? 'You' : 'Plante'} said at ${formattedTime}`}
        >
            <div className="chat-message__bubble">
                {message.isLoading ? (
                    <div className="chat-message__loading" aria-label="Plante is typing">
                        <span className="chat-message__dot"></span>
                        <span className="chat-message__dot"></span>
                        <span className="chat-message__dot"></span>
                    </div>
                ) : (
                    <p className="chat-message__content">{message.content}</p>
                )}
            </div>

            <div className="chat-message__meta">
                <span className="chat-message__time">{formattedTime}</span>
                {!isUser && message.audioUrl && onPlayAudio && (
                    <button
                        type="button"
                        className="chat-message__play-audio"
                        onClick={() => onPlayAudio(message.audioUrl!)}
                        aria-label="Play voice message"
                    >
                        🔊
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
