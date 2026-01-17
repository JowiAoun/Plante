'use client'

/**
 * PixelModal Component
 * Globally-consistent modal with pixel border and backdrop
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PixelModal.css';

export interface PixelModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
}

/**
 * PixelModal - Consistent modal with pixel styling
 */
export const PixelModal: React.FC<PixelModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="pixel-modal__backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
          aria-hidden="true"
        >
          <motion.div
            ref={modalRef}
            className={`pixel-modal nes-container is-dark pixel-modal--${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'pixel-modal-title' : undefined}
            tabIndex={-1}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15, type: 'tween' }}
          >
            {(title || showCloseButton) && (
              <div className="pixel-modal__header">
                {title && (
                  <h2 id="pixel-modal-title" className="pixel-modal__title">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    className="pixel-modal__close"
                    onClick={onClose}
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            <div className="pixel-modal__content">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PixelModal;
