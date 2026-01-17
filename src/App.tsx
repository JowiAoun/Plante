/**
 * Plante - Main Application
 * Pixel-art plant monitoring UI
 */

import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { Settings } from './pages/Settings';
import { mockUsers, mockNotifications } from './mocks/data';
import './App.css';

type Page = 'dashboard' | 'profile' | 'leaderboard' | 'settings';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const currentUser = mockUsers[0];

  // Simple hash-based navigation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const page = href.replace('#', '') as Page;
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile user={currentUser} />;
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
    >
      {/* Navigation tabs */}
      <nav className="app-nav">
        <a
          href="#dashboard"
          className={`app-nav__link ${currentPage === 'dashboard' ? 'app-nav__link--active' : ''}`}
          onClick={handleNavigation}
        >
          🏠 Dashboard
        </a>
        <a
          href="#profile"
          className={`app-nav__link ${currentPage === 'profile' ? 'app-nav__link--active' : ''}`}
          onClick={handleNavigation}
        >
          👤 Profile
        </a>
        <a
          href="#leaderboard"
          className={`app-nav__link ${currentPage === 'leaderboard' ? 'app-nav__link--active' : ''}`}
          onClick={handleNavigation}
        >
          🏆 Leaderboard
        </a>
        <a
          href="#settings"
          className={`app-nav__link ${currentPage === 'settings' ? 'app-nav__link--active' : ''}`}
          onClick={handleNavigation}
        >
          ⚙️ Settings
        </a>
      </nav>

      {/* Page content */}
      <div className="app-content">
        {renderPage()}
      </div>
    </AppShell>
  );
}

export default App;
