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
  adapter: MongoDBAdapter(clientPromise) as NextAuthOptions['adapter'],
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
  callbacks: {
    async session({ session, user }) {
      // Add user data to session
      if (session.user && user) {
        session.user.id = user.id;
        
        // Fetch additional user fields from database
        const users = await getUsersCollection();
        const dbUser = await users.findOne({ _id: new ObjectId(user.id) });
        
        if (dbUser) {
          session.user.username = dbUser.username;
          session.user.displayName = dbUser.displayName;
          session.user.avatarSeed = dbUser.avatarSeed;
          session.user.level = dbUser.level;
          session.user.xp = dbUser.xp;
          session.user.profileCompletedAt = dbUser.profileCompletedAt;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect new users to profile setup
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
