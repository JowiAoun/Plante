'use client'

/**
 * Settings Page
 * Theme switcher, notifications, and preferences
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActionButton } from '@/components/../components/ActionButton';
import { Toast, ToastContainer } from '@/components/../components/Toast';
import './Settings.css';
import { signOut } from 'next-auth/react';

type Theme = 'default' | 'spring' | 'night' | 'neon';

interface SmsPreferences {
  smsEnabled: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  categories: {
    wateringConfirmation: boolean;
    maintenanceReminders: boolean;
    waterTankAlerts: boolean;
    environmentalAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultSmsPreferences: SmsPreferences = {
  smsEnabled: false,
  phoneNumber: '',
  phoneVerified: false,
  categories: {
    wateringConfirmation: true,
    maintenanceReminders: true,
    waterTankAlerts: true,
    environmentalAlerts: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

/**
 * Mask phone number for display (e.g., +1613******* )
 */
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  const visible = phone.slice(0, 5);
  const masked = '*'.repeat(phone.length - 5);
  return visible + masked;
}

/**
 * Settings - Application settings page
 */
export const Settings: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [toast, setToast] = useState<string | null>(null);
  const [smsPrefs, setSmsPrefs] = useState<SmsPreferences>(defaultSmsPreferences);
  const [phoneInput, setPhoneInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(5);

  // Fetch SMS preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const res = await fetch('/api/notifications/preferences');
        if (res.ok) {
          const data = await res.json();
          setSmsPrefs(data);
          setPhoneInput(data.phoneNumber || '');
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    }
    fetchPreferences();
  }, []);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('plante-theme') as Theme | null;
    if (savedTheme && ['default', 'spring', 'night', 'neon'].includes(savedTheme)) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    // Load polling interval
    const savedInterval = localStorage.getItem('plante-polling-interval');
    if (savedInterval) {
      const parsed = parseInt(savedInterval, 10);
      if (parsed >= 1 && parsed <= 60) {
        setPollingInterval(parsed);
      }
    }
  }, []);

  const handlePollingIntervalChange = (value: number) => {
    const clamped = Math.max(1, Math.min(60, value));
    setPollingInterval(clamped);
    localStorage.setItem('plante-polling-interval', String(clamped));
    setToast(`Sensor refresh: ${clamped}s`);
  };

  const themes: { id: Theme; name: string; emoji: string; colors: string[] }[] = [
    { id: 'default', name: 'Default', emoji: '🎮', colors: ['#1D2B53', '#29ADFF', '#FFEC27'] },
    { id: 'spring', name: 'Spring', emoji: '🌸', colors: ['#1D2B53', '#00E436', '#FF77A8'] },
    { id: 'night', name: 'Night', emoji: '🌙', colors: ['#0a0a1a', '#7E2553', '#83769C'] },
    { id: 'neon', name: 'Neon', emoji: '⚡', colors: ['#1D2B53', '#FF77A8', '#00E436'] },
  ];

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('plante-theme', theme);
    setToast(`Theme changed to ${theme}`);
  };

  const updatePreferences = useCallback(async (updates: Partial<SmsPreferences>) => {
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setSmsPrefs(data);
        return true;
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
    return false;
  }, []);

  const handleSmsToggle = async (enabled: boolean) => {
    const success = await updatePreferences({ smsEnabled: enabled });
    if (success) {
      setToast(`SMS notifications ${enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const handleSendVerification = async () => {
    if (!phoneInput) {
      setToast('Please enter a phone number');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneInput }),
      });
      
      if (res.ok) {
        setVerificationSent(true);
        setToast('Verification code sent!');
      } else {
        const data = await res.json();
        setToast(data.error || 'Failed to send code');
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      setToast('Failed to send verification code');
    }
    setLoading(false);
  };

  const handleConfirmVerification = async () => {
    if (!verificationCode) {
      setToast('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/verify/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      
      if (res.ok) {
        setSmsPrefs(prev => ({ ...prev, phoneVerified: true, phoneNumber: phoneInput }));
        setVerificationSent(false);
        setVerificationCode('');
        setToast('Phone verified successfully!');
      } else {
        const data = await res.json();
        setToast(data.error || 'Invalid code');
      }
    } catch (error) {
      console.error('Error confirming verification:', error);
      setToast('Failed to verify code');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleExportData = () => {
    const data = {
      theme: currentTheme,
      smsPreferences: smsPrefs,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plante-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast('Settings exported successfully!');
  };

  const handleCategoryToggle = async (category: keyof SmsPreferences['categories'], enabled: boolean) => {
    const newCategories = { ...smsPrefs.categories, [category]: enabled };
    const success = await updatePreferences({ categories: newCategories } as Partial<SmsPreferences>);
    if (success) {
      const categoryNames: Record<string, string> = {
        wateringConfirmation: 'Watering confirmations',
        maintenanceReminders: 'Maintenance reminders',
        waterTankAlerts: 'Water tank alerts',
        environmentalAlerts: 'Environmental alerts',
      };
      setToast(`${categoryNames[category]} ${enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const handleQuietHoursToggle = async (enabled: boolean) => {
    const success = await updatePreferences({ 
      quietHours: { ...smsPrefs.quietHours, enabled } 
    } as Partial<SmsPreferences>);
    if (success) {
      setToast(`Quiet hours ${enabled ? 'enabled' : 'disabled'}`);
    }
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

      {/* Sensor Polling Interval */}
      <section className="settings__section nes-container is-dark">
        <h2 className="settings__section-title">📡 Sensor Refresh Rate</h2>
        <div className="settings__polling">
          <div className="settings__polling-label">
            <span>Update sensors every:</span>
            <span className="settings__polling-value">{pollingInterval}s</span>
          </div>
          <div className="settings__gauge">
            <div className="settings__gauge-track">
              {Array.from({ length: 12 }, (_, i) => {
                // 12 segments: 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60
                const values = [1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60];
                const value = values[i];
                const isActive = pollingInterval >= value;
                return (
                  <button
                    key={i}
                    className={`settings__gauge-segment ${isActive ? 'settings__gauge-segment--active' : ''}`}
                    onClick={() => handlePollingIntervalChange(value)}
                    title={`${value}s`}
                  />
                );
              })}
            </div>
            <div className="settings__gauge-labels">
              <span>1s</span>
              <span>30s</span>
              <span>60s</span>
            </div>
          </div>
          <p className="settings__polling-hint">Lower = faster updates, higher battery usage</p>
        </div>
      </section>

      {/* SMS Notifications */}
      <section className="settings__section nes-container is-dark">
        <h2 className="settings__section-title">📱 SMS Notifications</h2>
        
        {/* Master Toggle */}
        <div className="settings__option">
          <label className="settings__label">
            <input 
              type="checkbox" 
              className="nes-checkbox is-dark" 
              checked={smsPrefs.smsEnabled}
              onChange={(e) => handleSmsToggle(e.target.checked)}
            />
            <span>Enable SMS Notifications</span>
          </label>
        </div>

        {/* Phone Number */}
        <div className="settings__phone-section">
          <label className="settings__label settings__label--block">Phone Number</label>
          <div className="settings__phone-input-row">
            <input
              type="text"
              className="nes-input is-dark settings__phone-input"
              placeholder="+1234567890"
              value={maskPhoneNumber(smsPrefs.phoneVerified ? smsPrefs.phoneNumber : phoneInput)}
              onChange={(e) => {
                // Get the raw input - user might be typing or deleting
                const newValue = e.target.value;
                // If the new value is shorter, user is deleting - trim the actual phone
                if (newValue.length < maskPhoneNumber(phoneInput).length) {
                  setPhoneInput(phoneInput.slice(0, -1));
                } else {
                  // User is adding a character - get the last typed char
                  const lastChar = newValue.slice(-1);
                  if (lastChar && lastChar !== '*') {
                    setPhoneInput(phoneInput + lastChar);
                  }
                }
              }}
              disabled={smsPrefs.phoneVerified}
            />
            {smsPrefs.phoneVerified ? (
              <span className="settings__verified-badge">✓ Verified</span>
            ) : (
              <button
                className="nes-btn is-primary settings__verify-btn"
                onClick={handleSendVerification}
                disabled={loading || !phoneInput}
              >
                {loading ? '...' : 'Verify'}
              </button>
            )}
          </div>
          
          {/* Verification Code Input */}
          {verificationSent && !smsPrefs.phoneVerified && (
            <div className="settings__verification-row">
              <input
                type="text"
                className="nes-input is-dark settings__code-input"
                placeholder="6-digit code"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              />
              <button
                className="nes-btn is-success"
                onClick={handleConfirmVerification}
                disabled={loading || verificationCode.length !== 6}
              >
                Confirm
              </button>
            </div>
          )}
        </div>

        {/* Category Toggles */}
        {smsPrefs.smsEnabled && smsPrefs.phoneVerified && (
          <>
            <div className="settings__subsection">
              <label className="settings__label settings__label--block">Notification Types</label>
              <div className="settings__option">
                <label className="settings__label">
                  <input 
                    type="checkbox" 
                    className="nes-checkbox is-dark" 
                    checked={smsPrefs.categories.wateringConfirmation}
                    onChange={(e) => handleCategoryToggle('wateringConfirmation', e.target.checked)}
                  />
                  <span>🌱 Watering confirmations</span>
                </label>
              </div>
              <div className="settings__option">
                <label className="settings__label">
                  <input 
                    type="checkbox" 
                    className="nes-checkbox is-dark" 
                    checked={smsPrefs.categories.maintenanceReminders}
                    onChange={(e) => handleCategoryToggle('maintenanceReminders', e.target.checked)}
                  />
                  <span>🔔 Maintenance reminders</span>
                </label>
              </div>
              <div className="settings__option">
                <label className="settings__label">
                  <input 
                    type="checkbox" 
                    className="nes-checkbox is-dark" 
                    checked={smsPrefs.categories.waterTankAlerts}
                    onChange={(e) => handleCategoryToggle('waterTankAlerts', e.target.checked)}
                  />
                  <span>💧 Water tank alerts</span>
                </label>
              </div>
              <div className="settings__option">
                <label className="settings__label">
                  <input 
                    type="checkbox" 
                    className="nes-checkbox is-dark" 
                    checked={smsPrefs.categories.environmentalAlerts}
                    onChange={(e) => handleCategoryToggle('environmentalAlerts', e.target.checked)}
                  />
                  <span>🌡️ Environmental alerts</span>
                </label>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="settings__subsection">
              <div className="settings__option">
                <label className="settings__label">
                  <input 
                    type="checkbox" 
                    className="nes-checkbox is-dark" 
                    checked={smsPrefs.quietHours.enabled}
                    onChange={(e) => handleQuietHoursToggle(e.target.checked)}
                  />
                  <span>🌙 Quiet hours ({smsPrefs.quietHours.start} - {smsPrefs.quietHours.end})</span>
                </label>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Other Notifications */}
      <section className="settings__section nes-container is-dark">
        <h2 className="settings__section-title">Other Notifications</h2>
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
      {/* Account */}
      <section className="settings__section nes-container is-dark">
        <h2 className="settings__section-title">Account</h2>
        <div className="settings__actions">
          <ActionButton 
            label="Export Data" 
            variant="secondary" 
            icon="📥" 
            onClick={handleExportData}
          />
          <ActionButton 
            label="Log Out" 
            variant="warning" 
            icon="🚪" 
            onClick={handleLogout}
          />
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
