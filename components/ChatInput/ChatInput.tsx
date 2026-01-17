'use client';

/**
 * ChatInput Component
 * Text input field with send button for chat messages
 */

import React, { useState, useRef, useCallback } from 'react';
import './ChatInput.css';

export interface ChatInputProps {
    /** Callback when message is sent */
    onSend: (message: string) => void;
    /** Disabled state (e.g., while AI is responding) */
    disabled?: boolean;
    /** Input placeholder */
    placeholder?: string;
}

/**
 * ChatInput - Message input with send button
 */
export const ChatInput: React.FC<ChatInputProps> = ({
    onSend,
    disabled = false,
    placeholder = 'Type a message...',
}) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = useCallback(() => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || disabled) return;

        // Clear any pending debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce to prevent rapid submissions (500ms per rate limiting guidance)
        debounceRef.current = setTimeout(() => {
            onSend(trimmedMessage);
            setMessage('');
            inputRef.current?.focus();
        }, 100); // Small delay for UX, actual rate limiting is 500ms between API calls
    }, [message, disabled, onSend]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="chat-input">
            <input
                ref={inputRef}
                type="text"
                className="chat-input__field"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                aria-label="Chat message input"
                maxLength={1000}
            />
            <button
                type="button"
                className="chat-input__send nes-btn is-primary"
                onClick={handleSubmit}
                disabled={disabled || !message.trim()}
                aria-label="Send message"
            >
                <span className="chat-input__send-icon" aria-hidden="true">📤</span>
                <span className="chat-input__send-text">Send</span>
            </button>
        </div>
    );
};

export default ChatInput;
