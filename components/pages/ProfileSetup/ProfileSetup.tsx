'use client';

/**
 * ProfileSetup Page Component
 * Profile customization form shown after registration
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PixelAvatar } from '@/components/PixelAvatar';
import { PixelInput } from '@/components/PixelInput';
import { ActionButton } from '@/components/ActionButton';
import './ProfileSetup.css';

/**
 * Generate a random seed string for avatar
 */
const generateRandomSeed = (): string => {
  const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Wise', 'Lucky', 'Cosmic', 'Mystic', 'Noble', 'Gentle'];
  const nouns = ['Farmer', 'Gardener', 'Sprout', 'Leaf', 'Root', 'Bloom', 'Seed', 'Plant', 'Grove', 'Forest'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999);
  return `${adj}${noun}${num}`;
};

/**
 * ProfileSetup - Profile customization form
 */
export const ProfileSetup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(generateRandomSeed());
  const [isComplete, setIsComplete] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const validateUsername = useCallback((value: string) => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 20) {
      return 'Username must be 20 characters or less';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Only letters, numbers, and underscores allowed';
    }
    return '';
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameError(value ? validateUsername(value) : '');
  };

  const handleRandomize = () => {
    setAvatarSeed(generateRandomSeed());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    // For now, just show success (no persistence per user request)
    console.log('Profile setup complete:', {
      username,
      displayName: displayName || username,
      avatarSeed,
    });
    
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="profile-setup">
        <motion.div
          className="profile-setup__card nes-container is-dark"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="profile-setup__success">
            <div className="profile-setup__success-icon">🎉</div>
            <h2 className="profile-setup__success-title">Welcome, {displayName || username}!</h2>
            <p className="profile-setup__success-message">
              Your profile is all set. Ready to start farming?
            </p>
            <ActionButton
              label="Go to Dashboard"
              variant="success"
              icon="🌱"
              onClick={() => window.location.href = '/dashboard'}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="profile-setup">
      <motion.div
        className="profile-setup__card nes-container is-dark"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="profile-setup__header">
          <h1 className="profile-setup__title">Set Up Your Profile</h1>
          <p className="profile-setup__subtitle">Customize your farmer identity</p>
        </div>

        {/* Form */}
        <form className="profile-setup__form" onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="profile-setup__avatar-section">
            <div className="profile-setup__avatar-preview">
              <PixelAvatar 
                username={avatarSeed} 
                seed={avatarSeed}
                size="large"
              />
            </div>
            <div className="profile-setup__avatar-controls">
              <div className="profile-setup__seed-input">
                <PixelInput
                  label="Avatar Seed"
                  placeholder="Enter seed..."
                  value={avatarSeed}
                  onChange={setAvatarSeed}
                  hint="Change this to customize your avatar"
                />
              </div>
              <button 
                type="button"
                className="profile-setup__randomize-btn"
                onClick={handleRandomize}
              >
                🎲 Random
              </button>
            </div>
          </div>

          {/* Username Input */}
          <PixelInput
            label="Username"
            placeholder="farmer_joe"
            value={username}
            onChange={handleUsernameChange}
            error={usernameError}
            icon="👤"
            maxLength={20}
          />

          {/* Display Name Input */}
          <PixelInput
            label="Display Name"
            placeholder="Joe the Farmer"
            value={displayName}
            onChange={setDisplayName}
            hint="Optional - defaults to username"
            icon="✨"
            maxLength={50}
          />

          {/* Submit Button */}
          <div className="profile-setup__submit-btn">
            <ActionButton
              label="Complete Setup"
              variant="success"
              icon="✓"
              fullWidth
              disabled={!username || !!usernameError}
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;
