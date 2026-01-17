/**
 * AppShell Component
 * Main layout wrapper with header, nav, content area, and footer
 */

import React, { useState } from 'react';
import type { User, Notification } from '../../types';
import { TopBar } from '../TopBar';
import './AppShell.css';

export interface AppShellProps {
  /** Main content */
  children: React.ReactNode;
  /** Current user */
  user?: User | null;
  /** Notifications */
  notifications?: Notification[];
  /** Theme variant */
  theme?: 'default' | 'spring' | 'night' | 'neon';
  /** Show footer */
  showFooter?: boolean;
}

/**
 * AppShell - Main application layout
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  user,
  notifications = [],
  theme = 'default',
  showFooter = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        {/* Sidebar (mobile overlay) */}
        <aside
          className={`app-shell__sidebar ${sidebarOpen ? 'app-shell__sidebar--open' : ''}`}
          aria-hidden={!sidebarOpen}
        >
          <nav className="app-shell__sidebar-nav" aria-label="Sidebar navigation">
            <a href="#dashboard" className="app-shell__sidebar-link">🏠 Dashboard</a>
            <a href="#farms" className="app-shell__sidebar-link">🌱 My Farms</a>
            <a href="#museum" className="app-shell__sidebar-link">🏛️ Museum</a>
            <a href="#leaderboard" className="app-shell__sidebar-link">🏆 Leaderboard</a>
            <a href="#settings" className="app-shell__sidebar-link">⚙️ Settings</a>
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

      {/* Footer */}
      {showFooter && (
        <footer className="app-shell__footer">
          <p>🌱 Plante — Pixel Plant Monitoring</p>
        </footer>
      )}
    </div>
  );
};

export default AppShell;
