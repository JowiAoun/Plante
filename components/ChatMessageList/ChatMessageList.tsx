'use client';

/**
 * ChatMessageList Component
 * Scrollable chat message history
 */

import React, { useEffect, useRef } from 'react';
import type { ChatMessage as ChatMessageType } from '@/types';
import { ChatMessage } from '@/components/ChatMessage';
import './ChatMessageList.css';

export interface ChatMessageListProps {
    /** Array of messages to display */
    messages: ChatMessageType[];
    /** Callback to play audio for a message */
    onPlayAudio?: (audioUrl: string) => void;
}

/**
 * ChatMessageList - Scrollable message container
 */
export const ChatMessageList: React.FC<ChatMessageListProps> = ({
    messages,
    onPlayAudio,
}) => {
    const listRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div
            ref={listRef}
            className="chat-message-list"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
        >
            {messages.length === 0 ? (
                <div className="chat-message-list__empty">
                    <span className="chat-message-list__empty-icon" aria-hidden="true">🌱</span>
                    <p className="chat-message-list__empty-text">
                        Hi! I&apos;m Plante, your plant care assistant.
                    </p>
                    <p className="chat-message-list__empty-hint">
                        Ask me anything about your plants or farms!
                    </p>
                </div>
            ) : (
                <div className="chat-message-list__messages">
                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            onPlayAudio={onPlayAudio}
                        />
                    ))}
                </div>
            )}
            <div ref={bottomRef} className="chat-message-list__bottom" aria-hidden="true" />
        </div>
    );
};

export default ChatMessageList;
