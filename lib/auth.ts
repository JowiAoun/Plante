/**
 * NextAuth.js Configuration (Demo Mode)
 *
 * Zero-env, self-contained demo auth: a credentials provider signs everyone
 * in as the demo user, and the profile chosen during profile-setup lives
 * entirely inside the JWT session cookie (no database). This keeps the app
 * fully stateless, so it works on serverless deployments with no secrets.
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DEMO_SESSION_COOKIE, DEMO_SESSION_SECRET, DEMO_USER_ID } from './demo-config';

// next-auth v4 derives the request origin from x-forwarded headers when
// VERCEL or AUTH_TRUST_HOST is set. VERCEL is a system env var that Vercel
// injects automatically; this fallback covers deployments where system env
// exposure is disabled.
process.env.AUTH_TRUST_HOST ??= 'true';

/** Session fields a client may persist into the token via update(). */
const UPDATABLE_TOKEN_FIELDS = [
  'username',
  'displayName',
  'avatarSeed',
  'profileCompletedAt',
  'chatAnalyticsConsent',
] as const;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'demo',
      name: 'Demo Account',
      credentials: {},
      async authorize() {
        // Everyone gets the same demo identity; no password, no lookup.
        return {
          id: DEMO_USER_ID,
          name: 'Demo Farmer',
          email: 'demo@plante.example',
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/profile-setup',
  },
  session: {
    strategy: 'jwt',
  },
  cookies: {
    // Fixed name read by both the auth route and the middleware; see
    // DEMO_SESSION_COOKIE. secure:false so the same cookie works on
    // http://localhost and https production (demo only, no secrets).
    sessionToken: {
      name: DEMO_SESSION_COOKIE,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in: fresh demo session with no profile yet, so the
      // middleware routes the user through /profile-setup.
      if (user) {
        token.id = user.id;
        token.level = 1;
        token.xp = 0;
        token.username = undefined;
        token.displayName = undefined;
        token.avatarSeed = undefined;
        token.profileCompletedAt = undefined;
        token.chatAnalyticsConsent = undefined;
      }

      // Session update: merge whitelisted fields from the client payload.
      // The JWT cookie itself is the only persistence layer in the demo.
      if (trigger === 'update' && session && typeof session === 'object') {
        const payload = session as Record<string, unknown>;
        for (const field of UPDATABLE_TOKEN_FIELDS) {
          if (payload[field] !== undefined) {
            token[field] = payload[field] as never;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add token data to session
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string | undefined;
        session.user.displayName = token.displayName as string | undefined;
        session.user.avatarSeed = token.avatarSeed as string | undefined;
        session.user.level = token.level as number | undefined;
        session.user.xp = token.xp as number | undefined;
        session.user.profileCompletedAt = token.profileCompletedAt as string | undefined;
        session.user.chatAnalyticsConsent = token.chatAnalyticsConsent as boolean | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Allow URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    },
  },
  secret: DEMO_SESSION_SECRET,
};
