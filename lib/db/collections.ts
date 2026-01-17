/**
 * MongoDB Collection Helpers
 * Type-safe collection accessors for all database collections
 */

import { Collection } from 'mongodb';
import { getDb } from '../mongodb';
import type {
  DbUser,
  DbAccount,
  DbSession,
  DbFarm,
  DbAchievement,
  DbUserAchievement,
  DbFriendship,
  DbNotification,
} from './types';

/**
 * Get the users collection
 */
export async function getUsersCollection(): Promise<Collection<DbUser>> {
  const db = await getDb();
  return db.collection<DbUser>('users');
}

/**
 * Get the accounts collection (NextAuth managed)
 */
export async function getAccountsCollection(): Promise<Collection<DbAccount>> {
  const db = await getDb();
  return db.collection<DbAccount>('accounts');
}

/**
 * Get the sessions collection (NextAuth managed)
 */
export async function getSessionsCollection(): Promise<Collection<DbSession>> {
  const db = await getDb();
  return db.collection<DbSession>('sessions');
}

/**
 * Get the farms collection
 */
export async function getFarmsCollection(): Promise<Collection<DbFarm>> {
  const db = await getDb();
  return db.collection<DbFarm>('farms');
}

/**
 * Get the achievements collection
 */
export async function getAchievementsCollection(): Promise<Collection<DbAchievement>> {
  const db = await getDb();
  return db.collection<DbAchievement>('achievements');
}

/**
 * Get the user_achievements collection
 */
export async function getUserAchievementsCollection(): Promise<Collection<DbUserAchievement>> {
  const db = await getDb();
  return db.collection<DbUserAchievement>('user_achievements');
}

/**
 * Get the friendships collection
 */
export async function getFriendshipsCollection(): Promise<Collection<DbFriendship>> {
  const db = await getDb();
  return db.collection<DbFriendship>('friendships');
}

/**
 * Get the notifications collection
 */
export async function getNotificationsCollection(): Promise<Collection<DbNotification>> {
  const db = await getDb();
  return db.collection<DbNotification>('notifications');
}
