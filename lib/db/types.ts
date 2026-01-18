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
    chatAnalyticsConsent?: boolean;
    chatAnalyticsConsentAt?: Date;
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
    light?: { min: number; max: number };
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

  type: 'alert' | 'achievement' | 'social' | 'system' | 'weekly_pulse';
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

/**
 * SMS Notification Preferences (embedded in user document)
 */
export interface SmsPreferences {
  enabled: boolean;
  phoneNumber: string;           // E.164 format: +1234567890
  phoneVerified: boolean;
  verificationCode?: string;     // Hashed 6-digit code
  verificationExpires?: Date;

  categories: {
    wateringConfirmation: boolean;
    maintenanceReminders: boolean;
    waterTankAlerts: boolean;
    environmentalAlerts: boolean;
    weeklyPulse: boolean;
  };

  quietHours: {
    enabled: boolean;
    start: string;               // "22:00" (10 PM)
    end: string;                 // "08:00" (8 AM)
    timezone: string;            // "America/New_York"
  };

  thresholds: {
    tankLowPercent: number;      // Default: 25
    tankCriticalPercent: number; // Default: 10
  };

  lastSmsAt?: Date;
  dailySmsCount: number;
  lastCountReset?: Date;
}

/**
 * Default SMS preferences for new users
 */
export const defaultSmsPreferences: SmsPreferences = {
  enabled: false,
  phoneNumber: '',
  phoneVerified: false,
  categories: {
    wateringConfirmation: true,
    maintenanceReminders: true,
    waterTankAlerts: true,
    environmentalAlerts: true,
    weeklyPulse: true,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York',
  },
  thresholds: {
    tankLowPercent: 25,
    tankCriticalPercent: 10,
  },
  dailySmsCount: 0,
};

/**
 * SMS notification types
 */
export type SmsNotificationType =
  | 'watering'
  | 'maintenance'
  | 'tank_low'
  | 'tank_critical'
  | 'tank_empty'
  | 'temp_high'
  | 'temp_low'
  | 'humidity_alert'
  | 'weekly_pulse'
  | 'farm_action'
  | 'verification';

/**
 * SMS job status
 */
export type SmsJobStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

/**
 * SMS Notification Job (queue document)
 */
export interface DbSmsJob {
  _id: ObjectId;
  userId: ObjectId;
  farmId?: ObjectId;
  type: SmsNotificationType;
  message: string;
  phoneNumber: string;

  status: SmsJobStatus;
  attempts: number;
  maxAttempts: number;          // Default: 3

  scheduledFor: Date;
  createdAt: Date;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  twilioMessageSid?: string;
}
