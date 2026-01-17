/**
 * AchievementBadge Component
 * Shows achievement badge with locked/unlocked state
 */

import React, { useState } from 'react';
import type { Achievement } from '../../types';
import { rarityColors, achievementIcons } from '../../data/achievements';
import './AchievementBadge.css';

export interface AchievementBadgeProps {
  /** Achievement data */
  achievement: Achievement;
  /** Whether the achievement is unlocked */
  unlocked?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show tooltip on hover */
  showTooltip?: boolean;
}

/**
 * AchievementBadge - Displays achievement with rarity and lock state
 */
export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  unlocked = false,
  size = 'medium',
  showTooltip = true,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  const icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || '🏆';
  const rarityColor = rarityColors[achievement.rarity];

  return (
    <div
      className={`achievement-badge achievement-badge--${size} ${unlocked ? 'achievement-badge--unlocked' : 'achievement-badge--locked'}`}
      style={{ '--rarity-color': rarityColor } as React.CSSProperties}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
      onFocus={() => setTooltipVisible(true)}
      onBlur={() => setTooltipVisible(false)}
      tabIndex={0}
      role="img"
      aria-label={`${achievement.title}${unlocked ? ' (Unlocked)' : ' (Locked)'}: ${achievement.description}`}
    >
      <div className="achievement-badge__icon">
        {unlocked ? icon : '🔒'}
      </div>
      
      <div className="achievement-badge__rarity-indicator" />
      
      {showTooltip && tooltipVisible && (
        <div className="achievement-badge__tooltip" role="tooltip">
          <div className="achievement-badge__tooltip-title">
            {achievement.title}
          </div>
          <div className="achievement-badge__tooltip-rarity" style={{ color: rarityColor }}>
            {achievement.rarity.toUpperCase()}
          </div>
          <div className="achievement-badge__tooltip-desc">
            {achievement.description}
          </div>
          {unlocked && achievement.unlockedAt && (
            <div className="achievement-badge__tooltip-date">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
