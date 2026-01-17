/**
 * NextAuth.js Configuration
 * Central authentication setup with Google provider and MongoDB adapter
 */

import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from './mongodb';
import { env } from './env';
import { getUsersCollection } from './db/collections';
import { ObjectId } from 'mongodb';

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, { databaseName: 'plante' }) as NextAuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/profile-setup',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in - fetch user data
      if (user) {
        token.id = user.id;
        const users = await getUsersCollection();
        const dbUser = await users.findOne({ _id: new ObjectId(user.id) });
        
        if (dbUser) {
          token.username = dbUser.username;
          token.displayName = dbUser.displayName;
          token.avatarSeed = dbUser.avatarSeed;
          token.level = dbUser.level ?? 1;
          token.xp = dbUser.xp ?? 0;
          token.profileCompletedAt = dbUser.profileCompletedAt;
        }
      }

      // Handle session update (e.g., after profile completion)
      if (trigger === 'update' && session) {
        // Refresh user data from database
        const users = await getUsersCollection();
        const dbUser = await users.findOne({ _id: new ObjectId(token.id as string) });
        
        if (dbUser) {
          token.username = dbUser.username;
          token.displayName = dbUser.displayName;
          token.avatarSeed = dbUser.avatarSeed;
          token.level = dbUser.level;
          token.xp = dbUser.xp;
          token.profileCompletedAt = dbUser.profileCompletedAt;
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
        session.user.profileCompletedAt = token.profileCompletedAt as Date | undefined;
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
  events: {
    async createUser({ user }) {
      // Initialize new user with default values
      const users = await getUsersCollection();
      await users.updateOne(
        { _id: new ObjectId(user.id) },
        {
          $set: {
            level: 1,
            xp: 0,
            settings: {
              theme: 'default',
              voiceEnabled: false,
              notificationsEnabled: true,
              pixelScale: '1x',
            },
            lastSeenAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );
    },
  },
  secret: env.NEXTAUTH_SECRET,
};

