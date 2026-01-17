/**
 * Plante - Main Application
 * Pixel-art plant monitoring UI
 */

import { useState } from 'react';
import { AppShell } from './components/AppShell';
import type { Page } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';
import { mockUsers, mockNotifications } from './mocks/data';
import './App.css';

// Placeholder Museum page
const Museum = () => (
  <div>
    <h1 style={{ fontFamily: 'var(--font-game)', fontSize: '20px', color: 'var(--color-accent)', marginBottom: '16px' }}>
      🏛️ Museum
    </h1>
    <p style={{ color: 'var(--color-text-muted)' }}>
      Your plant collection and exhibits will appear here.
    </p>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const currentUser = mockUsers[0];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile user={currentUser} />;
      case 'museum':
        return <Museum />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell
      user={currentUser}
      notifications={mockNotifications}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      <div className="app-content">
        {renderPage()}
      </div>
    </AppShell>
  );
}

export default App;
