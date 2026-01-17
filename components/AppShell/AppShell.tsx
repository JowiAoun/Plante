'use client'

/**
 * AppShell Component
 * Main layout wrapper with header, sidebar navigation, and content area
 */

import React, { useState } from 'react';
import type { User, Notification } from '@/types';
import { TopBar } from '@/components/TopBar';
import './AppShell.css';

export type Page = 'dashboard' | 'profile' | 'museum' | 'leaderboard' | 'settings';

export interface AppShellProps {
  /** Main content */
  children: React.ReactNode;
  /** Current user */
  user?: User | null;
  /** Notifications */
  notifications?: Notification[];
  /** Theme variant */
  theme?: 'default' | 'spring' | 'night' | 'neon';
  /** Current active page */
  currentPage?: Page;
  /** Page navigation callback */
  onNavigate?: (page: Page) => void;
}

/**
 * AppShell - Main application layout
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  user,
  notifications = [],
  theme = 'default',
  currentPage = 'dashboard',
  onNavigate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: Page) => {
    e.preventDefault();
    onNavigate?.(page);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const navItems: { page: Page; icon: string; label: string }[] = [
    { page: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { page: 'profile', icon: '👤', label: 'Profile' },
    { page: 'museum', icon: '🏛️', label: 'Museum' },
    { page: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
    { page: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className={`app-shell app-shell--${theme}`} data-theme={theme}>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="app-shell__skip-link">
        Skip to main content
      </a>

      {/* Header */}
      <TopBar
        user={user}
        notifications={notifications}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main layout area */}
      <div className="app-shell__body">
        {/* Sidebar */}
        <aside
          className={`app-shell__sidebar ${sidebarOpen ? 'app-shell__sidebar--open' : ''}`}
        >
          <nav className="app-shell__sidebar-nav" aria-label="Main navigation">
            {navItems.map(({ page, icon, label }) => (
              <a
                key={page}
                href={`#${page}`}
                className={`app-shell__sidebar-link ${currentPage === page ? 'app-shell__sidebar-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, page)}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                <span className="app-shell__sidebar-icon">{icon}</span>
                <span className="app-shell__sidebar-label">{label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="app-shell__backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <main id="main-content" className="app-shell__main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
