'use client'

/**
 * Profile Page
 * User profile with avatar, level, XP bar, and achievements
 */

import React, { useState } from 'react';
import { PixelAvatar } from '@/components/PixelAvatar';
import { AchievementBadge } from '@/components/../components/AchievementBadge';
import { ActionButton } from '@/components/../components/ActionButton';
import { LevelUpModal } from '@/components/../components/LevelUpModal';
import { achievements } from '@/data/achievements';
import { mockUsers } from '@/mocks/data';
import type { User } from '@/types';
import './Profile.css';

export interface ProfileProps {
  /** User to display (defaults to mock user) */
  user?: User;
}

/**
 * Profile - User profile page
 */
export const Profile: React.FC<ProfileProps> = ({ 
  user = mockUsers[0] 
}) => {
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Calculate XP progress
  const xpProgress = (user.xp % 500) / 500 * 100;

  // User's unlocked achievements
  const userAchievements = achievements.map(ach => ({
    ...ach,
    unlocked: ach.unlockedBy?.includes(user.id) || false,
  }));

  return (
    <div className="profile">
      {/* Profile Header */}
      <header className="profile__header nes-container is-dark">
        <div className="profile__avatar">
          <PixelAvatar 
            username={user.username} 
            seed={user.avatarSeed || user.username}
            size="large" 
          />
        </div>
        <div className="profile__info">
          <h1 className="profile__name">{user.displayName}</h1>
          <p className="profile__username">@{user.username}</p>
        </div>
        <div className="profile__level">
          <span className="profile__level-badge">Lv.{user.level}</span>
          <div className="profile__xp-bar">
            <div 
              className="profile__xp-fill" 
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <span className="profile__xp-text">
            {user.xp % 500} / 500 XP
          </span>
        </div>
      </header>

      {/* Stats */}
      <section className="profile__stats">
        <div className="profile__stat">
          <span className="profile__stat-value">{user.xp}</span>
          <span className="profile__stat-label">Total XP</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">{userAchievements.filter(a => a.unlocked).length}</span>
          <span className="profile__stat-label">Achievements</span>
        </div>
        <div className="profile__stat">
          <span className="profile__stat-value">4</span>
          <span className="profile__stat-label">Farms</span>
        </div>
      </section>

      {/* Achievements */}
      <section className="profile__achievements">
        <div className="profile__section-header">
          <h2>Achievements</h2>
          <span className="profile__achievement-count">
            {userAchievements.filter(a => a.unlocked).length}/{achievements.length}
          </span>
        </div>
        <div className="profile__achievement-grid">
          {userAchievements.map((ach) => (
            <AchievementBadge
              key={ach.id}
              achievement={ach}
              unlocked={ach.unlocked}
              size="medium"
            />
          ))}
        </div>
      </section>

      {/* Actions */}
      <section className="profile__actions">
        <ActionButton
          label="Visit Museum"
          variant="secondary"
          icon="🏛️"
        />
        <ActionButton
          label="Demo Level Up"
          variant="success"
          icon="⬆️"
          onClick={() => setShowLevelUp(true)}
        />
      </section>

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={showLevelUp}
        level={user.level + 1}
        rewards={[
          { icon: '🌱', name: 'New Seed Slot' },
          { icon: '💧', name: '+10 Water Capacity' },
        ]}
        onClose={() => setShowLevelUp(false)}
      />
    </div>
  );
};

export default Profile;
