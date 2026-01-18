'use client'

/**
 * AppShell Component
 * Main layout wrapper with header, sidebar navigation, and content area
 */

import React, { useState } from 'react';
import type { User, Notification } from '@/types';
import { TopBar } from '@/components/TopBar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  // currentPage and onNavigate are deprecated in favor of App Router
  currentPage?: string; // Kept for backward compat if needed, but unused
  onNavigate?: (page: any) => void;
}

/**
 * AppShell - Main application layout
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  user,
  notifications = [],
  theme = 'default',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Helper to determine if link is active
  const isActive = (path: string) => {
    // Exact match for root or dashboard
    if (path === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) return true;
    // Starts with path for others (e.g. /leaderboard matches /leaderboard/subpage)
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/chat', icon: '💬', label: 'Chat' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: `/farms/explore/${user?.id || 'guest'}`, icon: '🌾', label: 'Farm' },
    { path: '/museum', icon: '🏛️', label: 'Museum' },
    { path: '/weekly-pulse', icon: '📊', label: 'Weekly Pulse' },
    { path: '/leaderboard', icon: '🏆', label: 'Leaderboard' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
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
        onAvatarClick={() => router.push('/profile')}
      />

      {/* Main layout area */}
      <div className="app-shell__body">
        {/* Sidebar */}
        <aside
          className={`app-shell__sidebar ${sidebarOpen ? 'app-shell__sidebar--open' : ''}`}
        >
          <nav className="app-shell__sidebar-nav" aria-label="Main navigation">
            {navItems.filter(item => item.path !== '/settings' && item.path !== '/profile').map(({ path, icon, label }) => (
              <Link
                key={path}
                href={path}
                className={`app-shell__sidebar-link ${isActive(path) ? 'app-shell__sidebar-link--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive(path) ? 'page' : undefined}
              >
                <span className="app-shell__sidebar-icon">{icon}</span>
                <span className="app-shell__sidebar-label">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom navigation (Settings) */}
          <nav className="app-shell__sidebar-nav app-shell__sidebar-nav--bottom" aria-label="Secondary navigation">
            {navItems.filter(item => item.path === '/settings').map(({ path, icon, label }) => (
              <Link
                key={path}
                href={path}
                className={`app-shell__sidebar-link ${isActive(path) ? 'app-shell__sidebar-link--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                aria-current={isActive(path) ? 'page' : undefined}
              >
                <span className="app-shell__sidebar-icon">{icon}</span>
                <span className="app-shell__sidebar-label">{label}</span>
              </Link>
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
