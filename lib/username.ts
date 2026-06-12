/**
 * Username validation for profile setup.
 * Shared between the check-username and complete-profile routes,
 * and exported so it can be unit-tested without next/server.
 */

import { isSeedUsername } from './demo-store';

export const RESERVED_USERNAMES = [
  'admin',
  'plante',
  'system',
  'api',
  'null',
  'undefined',
  'root',
  'mod',
  'moderator',
];

// Lowercase, numbers, underscores only, 3-20 chars
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export interface UsernameCheckResult {
  available: boolean;
  reason?: 'invalid' | 'reserved' | 'taken';
  message?: string;
}

export function checkUsername(rawUsername: string | null | undefined): UsernameCheckResult {
  const username = rawUsername?.toLowerCase().trim();

  if (!username || !USERNAME_PATTERN.test(username)) {
    return {
      available: false,
      reason: 'invalid',
      message: 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only',
    };
  }

  if (RESERVED_USERNAMES.includes(username)) {
    return {
      available: false,
      reason: 'reserved',
      message: 'This username is reserved',
    };
  }

  if (isSeedUsername(username)) {
    return {
      available: false,
      reason: 'taken',
      message: 'This username is already taken',
    };
  }

  return { available: true };
}
