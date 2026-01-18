/**
 * TopBar Component
 * Logo, notification bell, and user avatar
 */

import React from 'react';
import type { User } from '@/types';
import { NotificationBell } from '@/components/NotificationBell';
import { UserProfile } from '@/components/UserProfile';
import type { Notification } from '@/types';
import './TopBar.css';

export interface TopBarProps {
  /** Toggle sidebar callback */
  onToggleSidebar?: () => void;
  /** Notifications list */
  notifications?: Notification[];
  /** Current user */
  user?: User | null;
  /** Notification mark read callback */
  onMarkRead?: (id: string) => void;
  /** User avatar click callback */
  onAvatarClick?: () => void;
}

/**
 * TopBar - Main navigation header
 */
export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  notifications = [],
  user,
  onMarkRead,
  onAvatarClick,
}) => {
  return (
    <header className="top-bar" role="banner">
      {/* Menu toggle */}
      <button
        className="top-bar__menu-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar menu"
      >
        ☰
      </button>

      {/* Logo */}
      <div className="top-bar__logo">
        <img
          src="/logo.ico"
          alt="Plante Logo"
          className="top-bar__logo-icon"
          style={{
            width: '24px',
            height: '24px',
            objectFit: 'contain',
            imageRendering: 'pixelated'
          }}
        />
        <span className="top-bar__logo-text">PLANTE</span>
      </div>

      {/* Right side actions */}
      <div className="top-bar__actions">
        <NotificationBell
          items={notifications}
          onMarkRead={onMarkRead}
        />

        {user ? (
          <UserProfile
            user={user}
            size="small"
            onClick={onAvatarClick}
          />
        ) : (
          <button className="top-bar__login nes-btn is-primary">
            Login
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
