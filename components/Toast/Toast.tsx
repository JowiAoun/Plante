'use client'

/**
 * Toast Component
 * Small ephemeral notifications for actions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Toast.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  /** Toast message */
  message: string;
  /** Variant/type */
  variant?: ToastVariant;
  /** Whether toast is visible */
  visible: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Icon (emoji) */
  icon?: string;
  /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
  duration?: number;
}

// Variant icons
const variantIcons: Record<ToastVariant, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

/**
 * Toast - Ephemeral notification
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  visible,
  onClose,
  icon,
  duration = 3000,
}) => {
  // Auto-dismiss
  React.useEffect(() => {
    if (visible && duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  const displayIcon = icon || variantIcons[variant];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`toast toast--${variant}`}
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2, type: 'tween' }}
        >
          <span className="toast__icon" aria-hidden="true">
            {displayIcon}
          </span>
          <span className="toast__message">{message}</span>
          {onClose && (
            <button
              className="toast__close"
              onClick={onClose}
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast container for multiple toasts
export interface ToastContainerProps {
  children: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => (
  <div className="toast-container" aria-live="polite" aria-atomic="true">
    {children}
  </div>
);

export default Toast;
