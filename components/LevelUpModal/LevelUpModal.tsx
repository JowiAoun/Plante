'use client'

/**
 * LevelUpModal Component
 * Celebratory overlay when level is reached
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelModal } from '@/components/PixelModal';
import { ActionButton } from '@/components/ActionButton';
import { PixelAvatar } from '@/components/PixelAvatar';
import type { EmoteType } from '@/components/EmoteMenu';
import './LevelUpModal.css';

export interface Reward {
  icon: string;
  name: string;
  description?: string;
}

export interface LevelUpModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** New level reached */
  level: number;
  /** User's avatar seed for spinning avatar */
  avatarSeed?: string;
  /** Rewards earned */
  rewards?: Reward[];
  /** Close callback */
  onClose: () => void;
}

/**
 * LevelUpModal - Celebratory level up display
 */
export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  level,
  avatarSeed,
  rewards = [],
  onClose,
}) => {
  const [spinEmote, setSpinEmote] = useState<EmoteType | null>(null);

  // Trigger spin animation when modal opens
  useEffect(() => {
    if (isOpen && avatarSeed) {
      setSpinEmote('spin');
      // Keep spinning for a few rotations
      const timer = setTimeout(() => setSpinEmote(null), 1800);
      return () => clearTimeout(timer);
    } else {
      setSpinEmote(null);
    }
  }, [isOpen, avatarSeed]);
  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      size="small"
    >
      <div className="level-up-modal">
        {/* Celebration animation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="level-up-modal__celebration"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: 'spring', bounce: 0.5 }}
            >
              <span className="level-up-modal__confetti" aria-hidden="true">
                🎉✨🎊
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spinning Avatar */}
        {avatarSeed && (
          <motion.div
            className="level-up-modal__avatar"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.4, type: 'spring' }}
          >
            <PixelAvatar
              username={avatarSeed}
              seed={avatarSeed}
              size="large"
              emote={spinEmote}
            />
          </motion.div>
        )}

        {/* Level display */}
        <motion.div
          className="level-up-modal__level"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3, type: 'spring' }}
        >
          <span className="level-up-modal__label">LEVEL UP!</span>
          <span className="level-up-modal__number">{level}</span>
        </motion.div>

        {/* Rewards */}
        {rewards.length > 0 && (
          <motion.div
            className="level-up-modal__rewards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="level-up-modal__rewards-title">Rewards</h3>
            <ul className="level-up-modal__rewards-list">
              {rewards.map((reward, index) => (
                <li key={index} className="level-up-modal__reward">
                  <span className="level-up-modal__reward-icon">{reward.icon}</span>
                  <span className="level-up-modal__reward-name">{reward.name}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.div
          className="level-up-modal__action"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <ActionButton
            label="Continue"
            variant="success"
            onClick={onClose}
            icon="🚀"
          />
        </motion.div>
      </div>
    </PixelModal>
  );
};

export default LevelUpModal;
