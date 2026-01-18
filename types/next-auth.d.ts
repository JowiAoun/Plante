/**
 * NextAuth.js Type Extensions
 */

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Extended profile fields
      username?: string;
      displayName?: string;
      avatarSeed?: string;
      level?: number;
      xp?: number;
      profileCompletedAt?: Date;
      chatAnalyticsConsent?: boolean;
    };
  }

  interface User {
    username?: string;
    displayName?: string;
    avatarSeed?: string;
    level?: number;
    xp?: number;
    profileCompletedAt?: Date;
    chatAnalyticsConsent?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    username?: string;
    displayName?: string;
    avatarSeed?: string;
    level?: number;
    xp?: number;
    profileCompletedAt?: Date;
    chatAnalyticsConsent?: boolean;
  }
}

