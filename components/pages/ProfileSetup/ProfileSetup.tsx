'use client';

/**
 * ProfileSetup Page Component
 * Profile customization form shown after registration
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarSeed, setAvatarSeed] = useState(generateRandomSeed());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Pre-fill display name from Google profile
  useEffect(() => {
    if (session?.user?.name && !displayName) {
      setDisplayName(session.user.name);
    }
  }, [session?.user?.name, displayName]);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        
        if (data.available) {
          setUsernameAvailable(true);
          setUsernameError('');
        } else {
          setUsernameAvailable(false);
          setUsernameError(data.message || 'Username not available');
        }
      } catch {
        setUsernameError('Error checking username');
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const validateUsername = useCallback((value: string) => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (value.length > 20) {
      return 'Username must be 20 characters or less';
    }
    if (!/^[a-z0-9_]+$/.test(value.toLowerCase())) {
      return 'Only letters, numbers, and underscores allowed';
    }
    return '';
  }, []);

  const handleUsernameChange = (value: string) => {
    const lowerValue = value.toLowerCase();
    setUsername(lowerValue);
    setUsernameAvailable(null);
    const error = lowerValue ? validateUsername(lowerValue) : '';
    setUsernameError(error);
  };

  const handleRandomize = () => {
    setAvatarSeed(generateRandomSeed());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }

    if (!usernameAvailable) {
      setUsernameError('Please choose an available username');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          displayName: displayName || username,
          avatarSeed,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUsernameError(data.error || 'Failed to complete profile');
        return;
      }

      // Update session to refresh JWT token
      await updateSession();

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Profile setup error:', error);
      setUsernameError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while session loads
  if (!session) {
    return (
      <div className="profile-setup">
        <div className="profile-setup__loading">Loading...</div>
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
          <div className="profile-setup__username-wrapper">
            <PixelInput
              label="Username"
              placeholder="farmer_joe"
              value={username}
              onChange={handleUsernameChange}
              error={usernameError}
              icon="👤"
              maxLength={20}
            />
            {isCheckingUsername && (
              <span className="profile-setup__checking">Checking...</span>
            )}
            {!isCheckingUsername && usernameAvailable === true && !usernameError && (
              <span className="profile-setup__available">✓ Available</span>
            )}
          </div>

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
              label={isSubmitting ? 'Saving...' : 'Complete Setup'}
              variant="success"
              icon="✓"
              fullWidth
              disabled={!username || !!usernameError || !usernameAvailable || isSubmitting}
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetup;

