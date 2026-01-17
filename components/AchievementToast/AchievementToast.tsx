'use client'

/**
 * AchievementToast Component
 * Achievement unlock notification with spin animation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Achievement } from '@/types';
import { achievementUnlockVariants, badgeSpinVariants } from '@/utils/animations';
import { rarityColors, achievementIcons } from '@/data/achievements';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import './AchievementToast.css';

export interface AchievementToastProps {
  /** Achievement that was unlocked */
  achievement: Achievement;
  /** Whether toast is visible */
  visible: boolean;
  /** Close callback */
  onClose?: () => void;
}

/**
 * AchievementToast - Animated achievement unlock notification
 */
export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  visible,
  onClose,
}) => {
  const reducedMotion = useReducedMotion();
  const icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || '🏆';
  const rarityColor = rarityColors[achievement.rarity];

  // Auto-dismiss after 4 seconds
  React.useEffect(() => {
    if (visible && onClose) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  const variants = reducedMotion 
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : achievementUnlockVariants;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="achievement-toast"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="alert"
          aria-live="polite"
        >
          <motion.div
            className="achievement-toast__badge"
            style={{ borderColor: rarityColor }}
            variants={reducedMotion ? undefined : badgeSpinVariants}
            initial="idle"
            animate="spin"
          >
            {icon}
          </motion.div>
          
          <div className="achievement-toast__content">
            <span className="achievement-toast__label">Achievement Unlocked!</span>
            <span className="achievement-toast__title">{achievement.title}</span>
            <span 
              className="achievement-toast__rarity"
              style={{ color: rarityColor }}
            >
              {achievement.rarity.toUpperCase()}
            </span>
          </div>

          {onClose && (
            <button
              className="achievement-toast__close"
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

export default AchievementToast;
