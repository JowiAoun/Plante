/**
 * TopBar Component
 * Logo, navigation, notification bell, and user avatar
 */

import React from 'react';
import type { User } from '../../types';
import { NotificationBell } from '../NotificationBell';
import type { Notification } from '../../types';
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
      {/* Menu toggle for mobile */}
      <button
        className="top-bar__menu-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar menu"
      >
        ☰
      </button>

      {/* Logo - PLACEHOLDER */}
      <div className="top-bar__logo">
        <span className="top-bar__logo-icon" aria-hidden="true">🌱</span>
        <span className="top-bar__logo-text">
          PLANTE
          <span className="top-bar__logo-placeholder">(placeholder)</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="top-bar__nav" aria-label="Main navigation">
        <a href="#dashboard" className="top-bar__nav-link top-bar__nav-link--active">
          Dashboard
        </a>
        <a href="#museum" className="top-bar__nav-link">
          Museum
        </a>
        <a href="#leaderboard" className="top-bar__nav-link">
          Leaderboard
        </a>
      </nav>

      {/* Right side actions */}
      <div className="top-bar__actions">
        <NotificationBell
          items={notifications}
          onMarkRead={onMarkRead}
        />

        {user ? (
          <button
            className="top-bar__avatar"
            onClick={onAvatarClick}
            aria-label={`User menu for ${user.displayName}`}
          >
            <span className="top-bar__avatar-icon" aria-hidden="true">👤</span>
            <span className="top-bar__avatar-level">Lv.{user.level}</span>
          </button>
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
