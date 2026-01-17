'use client'

/**
 * NotificationBell Component
 * Bell icon with unread count and dropdown
 */

import React, { useState, useRef, useEffect } from 'react';
import type { Notification } from '@/types';
import { AchievementModal } from '@/components/AchievementModal';
import { ActionButton } from '@/components/ActionButton';
import { Toast, ToastContainer } from '@/components/Toast';
import { PixelAvatar } from '@/components/PixelAvatar';
import './NotificationBell.css';

import { useRouter } from 'next/navigation';

export interface NotificationBellProps {
  /** List of notifications */
  items: Notification[];
  /** Callback when notification is marked as read */
  onMarkRead?: (id: string) => void;
  /** Callback when all are marked as read */
  onMarkAllRead?: () => void;
}

// Severity colors
const severityColors: Record<Notification['severity'], string> = {
  info: 'var(--color-primary)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-critical)',
};

// Type icons
const typeIcons: Record<Notification['type'], string> = {
  alert: '⚠️',
  achievement: '🏆',
  social: '👥',
  system: '⚙️',
};

/**
 * Format timestamp to relative time
 */
const formatRelativeTime = (ts: string): string => {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = now - then;
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

/**
 * NotificationBell - Bell with unread count and dropdown list
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  items,
  onMarkRead,
  onMarkAllRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Notification | null>(null);

  const unreadCount = items.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Handle notification click
  const handleItemClick = (notification: Notification) => {
    onMarkRead?.(notification.id);
    setIsOpen(false);
    
    // Check if it's an achievement
    if (notification.type === 'achievement') {
      setSelectedAchievement(notification);
      setAchievementModalOpen(true);
      return;
    }
    
    // Handle redirect
    if (notification.link) {
      router.push(notification.link);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <>
      <div className="notification-bell" onKeyDown={handleKeyDown}>
        <button
          ref={buttonRef}
          className={`notification-bell__button ${hasUnread ? 'notification-bell__button--active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`Notifications${hasUnread ? `, ${unreadCount} unread` : ''}`}
        >
          <span className="notification-bell__icon" aria-hidden="true">🔔</span>
          {hasUnread && (
            <span className="notification-bell__badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div ref={dropdownRef} className="notification-bell__dropdown" role="menu">
            <div className="notification-bell__header">
              <span className="notification-bell__title">Notifications</span>
              {hasUnread && onMarkAllRead && (
                <button
                  className="notification-bell__mark-all"
                  onClick={onMarkAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="notification-bell__list">
              {items.length === 0 ? (
                <div className="notification-bell__empty">
                  No notifications
                </div>
              ) : (
                items.slice(0, 10).map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-bell__item ${notification.read ? '' : 'notification-bell__item--unread'}`}
                    role="menuitem"
                    onClick={() => handleItemClick(notification)}
                    style={{ borderLeftColor: severityColors[notification.severity] }}
                  >
                    <div className="notification-bell__item-icon-container">
                      {notification.senderAvatarSeed ? (
                        <PixelAvatar 
                          username="user" 
                          seed={notification.senderAvatarSeed} 
                          size="small" 
                          className="notification-bell__item-avatar"
                        />
                      ) : (
                        <span className="notification-bell__item-icon">
                          {typeIcons[notification.type]}
                        </span>
                      )}
                    </div>
                    <div className="notification-bell__item-content">
                      <p className="notification-bell__item-message">
                        {notification.message}
                      </p>
                      <span className="notification-bell__item-time">
                        {formatRelativeTime(notification.ts)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <AchievementModal 
        isOpen={achievementModalOpen}
        notification={selectedAchievement}
        onClose={() => setAchievementModalOpen(false)}
      />
    </>
  );
};

export default NotificationBell;
