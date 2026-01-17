'use client';

/**
 * PixelAvatar Component
 * Generates a pixel-art avatar based on a username seed
 */

import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';
import './PixelAvatar.css';

export interface PixelAvatarProps {
  /** Username to seed accessibility */
  username: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Optional custom class name */
  className?: string;
  /** Seed customization */
  seed?: string;
}

/**
 * PixelAvatar - Renders a consistent pixel art avatar for a user
 */
export const PixelAvatar: React.FC<PixelAvatarProps> = ({
  username,
  size = 'medium',
  className = '',
  seed,
}) => {
  const avatarSvg = useMemo(() => {
    const avatar = createAvatar(pixelArt, {
      seed: seed || username,
      scale: 90,
      backgroundColor: ['transparent'],
    });
    return avatar.toString();
  }, [username, seed]);

  return (
    <div
      className={`pixel-avatar pixel-avatar--${size} ${className}`}
      role="img"
      aria-label={`Avatar for ${username}`}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
    />
  );
};

export default PixelAvatar;
