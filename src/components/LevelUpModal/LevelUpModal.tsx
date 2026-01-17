/**
 * LevelUpModal Component
 * Celebratory overlay when level is reached
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelModal } from '../PixelModal';
import { ActionButton } from '../ActionButton';
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
  rewards = [],
  onClose,
}) => {
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
