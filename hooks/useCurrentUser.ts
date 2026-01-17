'use client';

/**
 * useCurrentUser Hook
 * Returns the current user from session in the User type format
 */

import { useSession } from 'next-auth/react';
import type { User } from '@/types';

export function useCurrentUser(): { user: User | null; isLoading: boolean } {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return { user: null, isLoading: true };
  }

  if (!session?.user) {
    return { user: null, isLoading: false };
  }

  const user: User = {
    id: session.user.id || '',
    username: session.user.username || '',
    displayName: session.user.displayName || session.user.name || '',
    avatarSeed: session.user.avatarSeed || session.user.username || '',
    level: session.user.level || 1,
    xp: session.user.xp || 0,
  };

  return { user, isLoading: false };
}
