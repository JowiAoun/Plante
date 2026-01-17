'use client';

/**
 * UserProfile Component
 * Displays user avatar with name and level info
 */

import React from 'react';
import { PixelAvatar } from '@/components/PixelAvatar';
import type { User } from '@/types';
import './UserProfile.css';

export interface UserProfileProps {
  /** User object */
  user: User;
  /** Click handler */
  onClick?: () => void;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show level badge */
  showLevel?: boolean;
}

/**
 * UserProfile - Reusable user display component
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onClick,
  size = 'medium',
  showLevel = true,
}) => {
  // Map container size to avatar size
  // 'medium' profile -> 'medium' avatar
  // 'small' profile -> 'small' avatar
  // 'large' profile -> 'large' avatar
  const avatarSize = size; 

  return (
    <button 
      className={`user-profile user-profile--${size}`}
      onClick={onClick}
      type="button"
      aria-label={`Profile for ${user.displayName}`}
    >
      <PixelAvatar 
        username={user.username} 
        seed={user.avatarSeed || user.username}
        size={avatarSize} 
      />
      
      <div className="user-profile__info">
        <span className="user-profile__name">{user.displayName}</span>
        {showLevel && (
          <span className="user-profile__level">Lv.{user.level}</span>
        )}
      </div>
    </button>
  );
};

export default UserProfile;
