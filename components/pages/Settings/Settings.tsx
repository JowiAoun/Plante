'use client'

/**
 * Settings Page
 * Theme switcher and preferences
 */

import React, { useState } from 'react';
import { ActionButton } from '@/components/../components/ActionButton';
import { Toast, ToastContainer } from '@/components/../components/Toast';
import './Settings.css';

type Theme = 'default' | 'spring' | 'night' | 'neon';

/**
 * Settings - Application settings page
 */
export const Settings: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [toast, setToast] = useState<string | null>(null);

  const themes: { id: Theme; name: string; emoji: string; colors: string[] }[] = [
    { id: 'default', name: 'Default', emoji: '🎮', colors: ['#1D2B53', '#29ADFF', '#FFEC27'] },
    { id: 'spring', name: 'Spring', emoji: '🌸', colors: ['#1D2B53', '#00E436', '#FF77A8'] },
    { id: 'night', name: 'Night', emoji: '🌙', colors: ['#0a0a1a', '#7E2553', '#83769C'] },
    { id: 'neon', name: 'Neon', emoji: '⚡', colors: ['#1D2B53', '#FF77A8', '#00E436'] },
  ];

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    setToast(`Theme changed to ${theme}`);
  };

  return (
    <div className="settings">
      <header className="settings__header">
        <h1 className="settings__title">⚙️ Settings</h1>
      </header>

      {/* Theme Switcher */}
      <section className="settings__section nes-container is-dark">
        <h2 className="settings__section-title">Theme</h2>
        <div className="settings__theme-grid">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`settings__theme-btn ${currentTheme === theme.id ? 'settings__theme-btn--active' : ''}`}
              onClick={() => handleThemeChange(theme.id)}
            >
              <span className="settings__theme-emoji">{theme.emoji}</span>
              <span className="settings__theme-name">{theme.name}</span>
              <div className="settings__theme-colors">
                {theme.colors.map((color, i) => (
                  <span
                    key={i}
                    className="settings__theme-swatch"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="settings__section nes-container is-dark">
        <h2 className="settings__section-title">Notifications</h2>
        <div className="settings__option">
          <label className="settings__label">
            <input 
              type="checkbox" 
              className="nes-checkbox is-dark" 
              defaultChecked 
              onChange={(e) => {
                const status = e.target.checked ? 'enabled' : 'disabled';
                setToast(`Push notifications ${status}`);
              }}
            />
            <span>Push notifications</span>
          </label>
        </div>
        <div className="settings__option">
          <label className="settings__label">
            <input 
              type="checkbox" 
              className="nes-checkbox is-dark" 
              defaultChecked 
              onChange={(e) => {
                const status = e.target.checked ? 'enabled' : 'disabled';
                setToast(`Email alerts ${status}`);
              }}
            />
            <span>Email alerts</span>
          </label>
        </div>
        <div className="settings__option">
          <label className="settings__label">
            <input 
              type="checkbox" 
              className="nes-checkbox is-dark" 
              onChange={(e) => {
                const status = e.target.checked ? 'enabled' : 'disabled';
                setToast(`Sound effects ${status}`);
              }}
            />
            <span>Sound effects</span>
          </label>
        </div>
      </section>

      {/* Account */}
      <section className="settings__section nes-container is-dark">
        <h2 className="settings__section-title">Account</h2>
        <div className="settings__actions">
          <ActionButton label="Export Data" variant="secondary" icon="📥" />
          <ActionButton label="Log Out" variant="warning" icon="🚪" />
        </div>
      </section>

      <ToastContainer>
        {toast && (
          <Toast
            message={toast}
            variant="success"
            visible={true}
            onClose={() => setToast(null)}
          />
        )}
      </ToastContainer>
    </div>
  );
};

export default Settings;
