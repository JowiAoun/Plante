/**
 * MongoDB Database Types
 * Type definitions for all collections matching the schema spec
 */

import { ObjectId } from 'mongodb';

/**
 * User document stored in MongoDB
 */
export interface DbUser {
  _id: ObjectId;

  // NextAuth managed fields
  email: string;
  emailVerified: Date | null;
  image?: string;

  // Profile fields
  username?: string;
  displayName?: string;
  avatarSeed?: string;

  // Gamification
  level: number;
  xp: number;

  // Settings (embedded document)
  settings: {
    theme: 'default' | 'spring' | 'night' | 'neon';
    voiceEnabled: boolean;
    notificationsEnabled: boolean;
    pixelScale: '1x' | '2x';
  };

  // Status
  profileCompletedAt?: Date;
  lastSeenAt: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OAuth account link (NextAuth managed)
 */
export interface DbAccount {
  _id: ObjectId;
  userId: ObjectId;
  type: 'oauth';
  provider: string;
  providerAccountId: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

/**
 * User session (NextAuth managed)
 */
export interface DbSession {
  _id: ObjectId;
  sessionToken: string;
  userId: ObjectId;
  expires: Date;
}

/**
 * Sensor reading with metadata
 */
export interface SensorReading {
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  updatedAt: Date;
}

/**
 * Farm document
 */
export interface DbFarm {
  _id: ObjectId;
  ownerId: ObjectId;

  // Basic info
  name: string;
  species?: string;
  thumbnailUrl?: string;

  // Status
  status: 'healthy' | 'warning' | 'critical';

  // Sensor readings
  sensors: {
    temperature: SensorReading;
    humidity: SensorReading;
    soilMoisture: SensorReading;
    light?: SensorReading;
  };

  // Thresholds for alerts
  thresholds: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    soilMoisture: { min: number; max: number };
  };

  // Device info
  deviceId?: string;
  lastSeen: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Achievement definition
 */
export interface DbAchievement {
  _id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  criteria: {
    type: 'level' | 'farms' | 'streak' | 'event';
    value: number;
  };
}

/**
 * User achievement unlock record
 */
export interface DbUserAchievement {
  _id: ObjectId;
  userId: ObjectId;
  achievementId: string;
  unlockedAt: Date;
}

/**
 * Friendship relationship
 */
export interface DbFriendship {
  _id: ObjectId;
  users: [ObjectId, ObjectId];
  status: 'pending' | 'accepted' | 'blocked';
  initiatedBy: ObjectId;
  createdAt: Date;
  acceptedAt?: Date;
}

/**
 * User notification
 */
export interface DbNotification {
  _id: ObjectId;
  userId: ObjectId;

  type: 'alert' | 'achievement' | 'social' | 'system';
  severity: 'info' | 'warning' | 'critical';

  title: string;
  message: string;
  link?: string;

  // Related entities
  farmId?: ObjectId;
  achievementId?: string;
  fromUserId?: ObjectId;

  // Status
  read: boolean;
  readAt?: Date;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date;
}
