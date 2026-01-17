'use client'

/**
 * AchievementModal Component
 * Celebratory overlay when an achievement is unlocked
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelModal } from '@/components/PixelModal';
import { ActionButton } from '@/components/ActionButton';
import { Notification } from '@/types';
import './AchievementModal.css';

export interface AchievementModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Notification that triggered the modal */
  notification: Notification | null;
  /** Close callback */
  onClose: () => void;
}

/**
 * AchievementModal - Celebratory achievement display
 */
export const AchievementModal: React.FC<AchievementModalProps> = ({
  isOpen,
  notification,
  onClose,
}) => {
  if (!notification) return null;

  // Extract achievement name from message (simple parsing for now)
  // Format: 'You unlocked "Green Streak" badge!'
  const match = notification.message.match(/"([^"]+)"/);
  const achievementName = match ? match[1] : 'Achievement Unlocked';
  
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="small"
    >
      <div className="achievement-modal">
        {/* Celebration animation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="achievement-modal__celebration"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.6 }}
            >
              <span className="achievement-modal__icon" aria-hidden="true">
                🏆
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content display */}
        <motion.div
          className="achievement-modal__content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span className="achievement-modal__label">Achievement Unlocked!</span>
          
          <h2 className="achievement-modal__title">{achievementName}</h2>
          
          <p className="achievement-modal__description">
            {notification.message}
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.div
          className="achievement-modal__action"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <ActionButton
            label="Sweet!"
            variant="primary"
            onClick={onClose}
            icon="✨"
          />
        </motion.div>
      </div>
    </PixelModal>
  );
};

export default AchievementModal;
