/**
 * Demo Seed Data
 *
 * Hard-coded, fully fictional data that replaces the MongoDB database.
 * Every name, username, and identifier here is invented for the demo;
 * nothing is copied from real records.
 *
 * Shapes mirror the old MongoDB documents (lib/db/types.ts) but use plain
 * string ids everywhere. Dates are real Date objects so route code can keep
 * calling .toISOString().
 */

import { DEMO_USER_ID } from './demo-config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoUser {
  id: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  level: number;
  xp: number;
  profileCompletedAt: Date;
}

export interface DemoSensorReading {
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  updatedAt: Date;
}

export interface DemoFarm {
  id: string;
  ownerId: string;
  name: string;
  species?: string;
  thumbnailUrl?: string;
  status: 'healthy' | 'warning' | 'critical';
  sensors: {
    temperature: DemoSensorReading;
    humidity: DemoSensorReading;
    soilMoisture: DemoSensorReading;
    light?: DemoSensorReading;
  };
  thresholds: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    soilMoisture: { min: number; max: number };
    light?: { min: number; max: number };
  };
  deviceId?: string;
  lastSeen: Date;
  wateringCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoNotification {
  id: string;
  userId: string;
  type: 'alert' | 'achievement' | 'social' | 'system' | 'weekly_pulse';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  link?: string;
  farmId?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface DemoAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedBy: string[];
  unlockedAt?: string;
}

export interface SmsPreferences {
  enabled: boolean;
  phoneNumber: string;
  phoneVerified: boolean;
  categories: {
    wateringConfirmation: boolean;
    maintenanceReminders: boolean;
    waterTankAlerts: boolean;
    environmentalAlerts: boolean;
    weeklyPulse: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  thresholds: {
    tankLowPercent: number;
    tankCriticalPercent: number;
  };
  dailySmsCount: number;
}

/** Per-sensor simulation profile: values drift inside [baseline - band, baseline + band]. */
export interface SensorSimProfile {
  baseline: number;
  band: number;
}

export type FarmSimProfile = {
  temperature: SensorSimProfile;
  humidity: SensorSimProfile;
  soilMoisture: SensorSimProfile;
  light?: SensorSimProfile;
};

// ---------------------------------------------------------------------------
// Seed users (leaderboard / social) — all fictional
// ---------------------------------------------------------------------------

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);

export const seedUsers: DemoUser[] = [
  {
    id: 'user-fiona',
    username: 'fern_fanatic',
    displayName: 'Fern Fanatic Fiona',
    avatarSeed: 'fiona-fern',
    level: 21,
    xp: 11200,
    profileCompletedAt: daysAgo(220),
  },
  {
    id: 'user-morgan',
    username: 'moss_boss',
    displayName: 'Moss Boss Morgan',
    avatarSeed: 'morgan-moss',
    level: 17,
    xp: 7800,
    profileCompletedAt: daysAgo(180),
  },
  {
    id: 'user-carl',
    username: 'cactus_carl',
    displayName: 'Cactus Carl',
    avatarSeed: 'carl-cactus',
    level: 14,
    xp: 5600,
    profileCompletedAt: daysAgo(140),
  },
  {
    id: 'user-penny',
    username: 'petal_pusher',
    displayName: 'Petal Pusher Penny',
    avatarSeed: 'penny-petal',
    level: 12,
    xp: 4300,
    profileCompletedAt: daysAgo(120),
  },
  {
    id: 'user-sky',
    username: 'sprout_scout',
    displayName: 'Sprout Scout Sky',
    avatarSeed: 'sky-sprout',
    level: 9,
    xp: 2950,
    profileCompletedAt: daysAgo(90),
  },
  {
    id: 'user-remy',
    username: 'root_rookie',
    displayName: 'Root Rookie Remy',
    avatarSeed: 'remy-root',
    level: 4,
    xp: 850,
    profileCompletedAt: daysAgo(30),
  },
];

// ---------------------------------------------------------------------------
// Seed farms — owned by the demo user, plus the shared Kalanchoe farm
// ---------------------------------------------------------------------------

const reading = (
  value: number,
  unit: string,
  trend: DemoSensorReading['trend'] = 'stable'
): DemoSensorReading => ({ value, unit, trend, updatedAt: minutesAgo(5) });

export const seedFarms: DemoFarm[] = [
  {
    id: 'farm-tomato',
    ownerId: DEMO_USER_ID,
    name: 'Tomato Paradise',
    species: 'Cherry Tomato',
    thumbnailUrl: '/sprites/farm_tomato_32.png',
    status: 'healthy',
    sensors: {
      temperature: reading(24, 'celsius'),
      humidity: reading(65, 'percent', 'up'),
      soilMoisture: reading(45, 'percent'),
      light: reading(450, 'lux'),
    },
    thresholds: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 80 },
      soilMoisture: { min: 30, max: 70 },
      light: { min: 200, max: 10000 },
    },
    lastSeen: minutesAgo(5),
    wateringCount: 32,
    createdAt: daysAgo(45),
    updatedAt: minutesAgo(5),
  },
  {
    id: 'farm-herb',
    ownerId: DEMO_USER_ID,
    name: 'Herb Haven',
    species: 'Sweet Basil',
    thumbnailUrl: '/sprites/farm_herb_32.png',
    status: 'warning',
    sensors: {
      temperature: reading(27, 'celsius', 'up'),
      humidity: reading(50, 'percent', 'down'),
      soilMoisture: reading(32, 'percent', 'down'),
    },
    thresholds: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 80 },
      soilMoisture: { min: 30, max: 70 },
    },
    lastSeen: minutesAgo(12),
    wateringCount: 21,
    createdAt: daysAgo(30),
    updatedAt: minutesAgo(12),
  },
  {
    id: 'farm-pepper',
    ownerId: DEMO_USER_ID,
    name: 'Pepper Palace',
    species: 'Scotch Bonnet',
    thumbnailUrl: '/sprites/farm_pepper_32.png',
    status: 'critical',
    sensors: {
      temperature: reading(28, 'celsius', 'up'),
      humidity: reading(48, 'percent', 'down'),
      soilMoisture: reading(22, 'percent', 'down'),
    },
    thresholds: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 80 },
      soilMoisture: { min: 30, max: 70 },
    },
    lastSeen: minutesAgo(60),
    wateringCount: 14,
    createdAt: daysAgo(25),
    updatedAt: minutesAgo(60),
  },
  {
    id: 'farm-succulent',
    ownerId: DEMO_USER_ID,
    name: 'Succulent Sanctuary',
    species: 'Echeveria',
    thumbnailUrl: '/sprites/farm_succulent_32.png',
    status: 'healthy',
    sensors: {
      temperature: reading(22, 'celsius'),
      humidity: reading(45, 'percent'),
      soilMoisture: reading(40, 'percent'),
    },
    thresholds: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 30, max: 60 },
      soilMoisture: { min: 20, max: 60 },
    },
    lastSeen: minutesAgo(8),
    wateringCount: 9,
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(8),
  },
  {
    id: 'kalanchoe-farm',
    ownerId: 'shared',
    name: 'Kalanchoe Farm',
    species: 'Kalanchoe blossfeldiana',
    thumbnailUrl: '/sprites/farm_succulent_32.png',
    status: 'healthy',
    sensors: {
      temperature: reading(23, 'celsius'),
      humidity: reading(55, 'percent'),
      soilMoisture: reading(40, 'percent'),
      light: reading(520, 'lux'),
    },
    thresholds: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 80 },
      soilMoisture: { min: 30, max: 70 },
      light: { min: 200, max: 10000 },
    },
    deviceId: 'kalanchoe-farm',
    lastSeen: minutesAgo(2),
    wateringCount: 47,
    createdAt: daysAgo(60),
    updatedAt: minutesAgo(2),
  },
];

/**
 * Simulation profiles per seed farm. Bands are chosen so each farm's
 * intended status (healthy/warning/critical) is stable under jitter:
 * status only checks temperature/humidity/soilMoisture against thresholds
 * with a 10% warning buffer.
 */
export const farmSimProfiles: Record<string, FarmSimProfile> = {
  'farm-tomato': {
    temperature: { baseline: 24, band: 1.2 },
    humidity: { baseline: 65, band: 3 },
    soilMoisture: { baseline: 45, band: 1.5 },
    light: { baseline: 450, band: 60 },
  },
  'farm-herb': {
    // soilMoisture stays in the warning buffer zone (30–34) → status warning
    temperature: { baseline: 27, band: 1.2 },
    humidity: { baseline: 50, band: 3 },
    soilMoisture: { baseline: 32, band: 1.5 },
  },
  'farm-pepper': {
    // soilMoisture stays below min (30) → status critical
    temperature: { baseline: 28, band: 0.4 },
    humidity: { baseline: 48, band: 3 },
    soilMoisture: { baseline: 22, band: 1.5 },
  },
  'farm-succulent': {
    temperature: { baseline: 22, band: 1.2 },
    humidity: { baseline: 45, band: 3 },
    soilMoisture: { baseline: 40, band: 1.5 },
  },
  'kalanchoe-farm': {
    temperature: { baseline: 23, band: 1.2 },
    humidity: { baseline: 55, band: 3 },
    soilMoisture: { baseline: 40, band: 1.5 },
    light: { baseline: 520, band: 60 },
  },
};

/** Default sim profile for farms created at runtime through the UI. */
export const defaultSimProfile: FarmSimProfile = {
  temperature: { baseline: 23, band: 1.2 },
  humidity: { baseline: 60, band: 3 },
  soilMoisture: { baseline: 50, band: 1.5 },
};

// ---------------------------------------------------------------------------
// Seed notifications for the demo user
// ---------------------------------------------------------------------------

export const seedNotifications: DemoNotification[] = [
  {
    id: 'notif-001',
    userId: DEMO_USER_ID,
    type: 'alert',
    severity: 'critical',
    title: 'Critical soil moisture',
    message: 'Pepper Palace needs water urgently!',
    link: '/farms/farm-pepper',
    farmId: 'farm-pepper',
    read: false,
    createdAt: minutesAgo(5),
  },
  {
    id: 'notif-002',
    userId: DEMO_USER_ID,
    type: 'system',
    severity: 'warning',
    title: 'Soil moisture low',
    message: 'Herb Haven soil moisture is near its threshold',
    link: '/farms/farm-herb',
    farmId: 'farm-herb',
    read: false,
    createdAt: minutesAgo(30),
  },
  {
    id: 'notif-003',
    userId: DEMO_USER_ID,
    type: 'achievement',
    severity: 'info',
    title: 'Achievement unlocked',
    message: 'You unlocked the "Green Streak" badge!',
    link: '/profile',
    read: false,
    createdAt: minutesAgo(60),
  },
  {
    id: 'notif-004',
    userId: DEMO_USER_ID,
    type: 'social',
    severity: 'info',
    title: 'New follower',
    message: 'Fern Fanatic Fiona followed you!',
    link: '/user/user-fiona',
    read: true,
    readAt: minutesAgo(100),
    createdAt: minutesAgo(120),
  },
  {
    id: 'notif-005',
    userId: DEMO_USER_ID,
    type: 'weekly_pulse',
    severity: 'info',
    title: 'Weekly Pulse ready',
    message: 'Your weekly plant report is ready to view',
    link: '/weekly-pulse',
    read: true,
    readAt: daysAgo(1),
    createdAt: daysAgo(2),
  },
];

// ---------------------------------------------------------------------------
// Seed achievements
// ---------------------------------------------------------------------------

export const seedAchievements: DemoAchievement[] = [
  {
    id: 'ach-001',
    title: 'First Seedling',
    description: 'Plant your first seed',
    icon: 'seedling',
    rarity: 'common',
    unlockedBy: [DEMO_USER_ID, 'user-fiona', 'user-morgan', 'user-carl', 'user-sky'],
    unlockedAt: daysAgo(40).toISOString(),
  },
  {
    id: 'ach-002',
    title: 'Green Streak',
    description: 'Keep plants healthy for 7 days straight',
    icon: 'streak',
    rarity: 'rare',
    unlockedBy: [DEMO_USER_ID, 'user-fiona', 'user-penny'],
    unlockedAt: daysAgo(20).toISOString(),
  },
  {
    id: 'ach-003',
    title: 'Harvest Master',
    description: 'Complete 10 successful harvests',
    icon: 'harvest',
    rarity: 'epic',
    unlockedBy: ['user-fiona'],
    unlockedAt: daysAgo(10).toISOString(),
  },
  {
    id: 'ach-004',
    title: 'Water Wizard',
    description: 'Never miss a watering for 30 days',
    icon: 'water',
    rarity: 'epic',
    unlockedBy: [],
  },
  {
    id: 'ach-005',
    title: 'Community Leader',
    description: 'Help 50 other farmers',
    icon: 'community',
    rarity: 'legendary',
    unlockedBy: [],
  },
];

// ---------------------------------------------------------------------------
// Default SMS preferences (per-user, mutated in the demo store)
// ---------------------------------------------------------------------------

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
