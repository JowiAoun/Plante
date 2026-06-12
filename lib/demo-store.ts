/**
 * In-Memory Demo Store
 *
 * Replaces MongoDB for the self-contained demo. The store is seeded from
 * lib/demo-data.ts on first access and cached on globalThis so it survives
 * dev hot-reloads. On serverless deployments each instance gets its own
 * copy: seed reads are always consistent, runtime mutations are ephemeral.
 */

import {
  seedUsers,
  seedFarms,
  seedNotifications,
  seedAchievements,
  farmSimProfiles,
  defaultSimProfile,
  defaultSmsPreferences,
} from './demo-data';
import type {
  DemoUser,
  DemoFarm,
  DemoNotification,
  DemoAchievement,
  FarmSimProfile,
  SmsPreferences,
} from './demo-data';

export type { DemoUser, DemoFarm, DemoNotification, DemoAchievement, SmsPreferences };

export interface LidState {
  isOpen: boolean;
  angle: number;
}

interface DemoStore {
  users: DemoUser[];
  farms: DemoFarm[];
  notifications: DemoNotification[];
  achievements: DemoAchievement[];
  simProfiles: Record<string, FarmSimProfile>;
  smsPreferences: Record<string, SmsPreferences>;
  lids: Record<string, LidState>;
}

const GLOBAL_KEY = '__planteDemoStore__';

type GlobalWithStore = typeof globalThis & { [GLOBAL_KEY]?: DemoStore };

function createStore(): DemoStore {
  return {
    users: structuredClone(seedUsers),
    farms: structuredClone(seedFarms),
    notifications: structuredClone(seedNotifications),
    achievements: structuredClone(seedAchievements),
    simProfiles: structuredClone(farmSimProfiles),
    smsPreferences: {},
    lids: {},
  };
}

function getStore(): DemoStore {
  const g = globalThis as GlobalWithStore;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = createStore();
  }
  return g[GLOBAL_KEY];
}

/** Reset the store to seed state (used by tests). */
export function resetDemoStore(): void {
  const g = globalThis as GlobalWithStore;
  delete g[GLOBAL_KEY];
}

function isShared(farm: DemoFarm): boolean {
  return farm.ownerId === 'shared';
}

function canAccess(farm: DemoFarm, userId: string): boolean {
  return farm.ownerId === userId || isShared(farm);
}

// ---------------------------------------------------------------------------
// Status & trend (ported from the old farm sync route)
// ---------------------------------------------------------------------------

/**
 * Calculate farm status from sensor values and thresholds.
 * Only temperature/humidity/soilMoisture count toward status, each with a
 * 10% warning buffer inside the threshold range.
 */
export function calculateStatus(
  sensors: DemoFarm['sensors'],
  thresholds: DemoFarm['thresholds']
): 'healthy' | 'warning' | 'critical' {
  const checks: { value: number; min: number; max: number }[] = [
    { value: sensors.temperature.value, ...thresholds.temperature },
    { value: sensors.humidity.value, ...thresholds.humidity },
    { value: sensors.soilMoisture.value, ...thresholds.soilMoisture },
  ];

  let hasCritical = false;
  let hasWarning = false;

  for (const check of checks) {
    const range = check.max - check.min;
    const warningBuffer = range * 0.1;

    if (check.value < check.min || check.value > check.max) {
      hasCritical = true;
    } else if (
      check.value < check.min + warningBuffer ||
      check.value > check.max - warningBuffer
    ) {
      hasWarning = true;
    }
  }

  if (hasCritical) return 'critical';
  if (hasWarning) return 'warning';
  return 'healthy';
}

/** Calculate trend from previous and current values (5% threshold). */
export function calculateTrend(
  previousValue: number | undefined,
  currentValue: number
): 'up' | 'down' | 'stable' {
  if (previousValue === undefined) return 'stable';
  const diff = currentValue - previousValue;
  const threshold = Math.abs(previousValue) * 0.05;
  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}

// ---------------------------------------------------------------------------
// Users / leaderboard
// ---------------------------------------------------------------------------

export function getSeedUser(id: string): DemoUser | null {
  return getStore().users.find((u) => u.id === id) ?? null;
}

export function listSeedUsers(): DemoUser[] {
  return getStore().users;
}

export function isSeedUsername(username: string): boolean {
  return getStore().users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

/** Seed users sorted for the leaderboard (level desc, then xp desc). */
export function leaderboardRows(): DemoUser[] {
  return [...getStore().users].sort(
    (a, b) => b.level - a.level || b.xp - a.xp
  );
}

// ---------------------------------------------------------------------------
// Farms
// ---------------------------------------------------------------------------

/** Farms visible to a user: their own plus the shared Kalanchoe farm. Newest first. */
export function listFarms(ownerId: string): DemoFarm[] {
  return getStore()
    .farms.filter((f) => canAccess(f, ownerId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getFarm(id: string, userId: string): DemoFarm | null {
  const farm = getStore().farms.find((f) => f.id === id);
  if (!farm || !canAccess(farm, userId)) return null;
  return farm;
}

export function getFarmByDeviceId(deviceId: string): DemoFarm | null {
  return getStore().farms.find((f) => f.deviceId === deviceId) ?? null;
}

export function createFarm(
  ownerId: string,
  input: { name: string; species?: string; thumbnailUrl?: string; deviceId?: string }
): DemoFarm {
  const store = getStore();
  const now = new Date();
  const id = `farm-${now.getTime().toString(36)}${Math.floor(Math.random() * 1296)
    .toString(36)
    .padStart(2, '0')}`;

  const profile = structuredClone(defaultSimProfile);

  const farm: DemoFarm = {
    id,
    ownerId,
    name: input.name.trim(),
    species: input.species || undefined,
    thumbnailUrl: input.thumbnailUrl || undefined,
    status: 'healthy',
    sensors: {
      temperature: { value: profile.temperature.baseline, unit: 'celsius', trend: 'stable', updatedAt: now },
      humidity: { value: profile.humidity.baseline, unit: 'percent', trend: 'stable', updatedAt: now },
      soilMoisture: { value: profile.soilMoisture.baseline, unit: 'percent', trend: 'stable', updatedAt: now },
    },
    thresholds: {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 80 },
      soilMoisture: { min: 30, max: 70 },
      light: { min: 200, max: 10000 },
    },
    ...(input.deviceId ? { deviceId: input.deviceId } : {}),
    lastSeen: now,
    wateringCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  store.farms.push(farm);
  store.simProfiles[id] = profile;
  return farm;
}

const FARM_UPDATE_FIELDS = ['name', 'species', 'thumbnailUrl', 'thresholds', 'deviceId'] as const;

export function updateFarm(
  id: string,
  userId: string,
  fields: Record<string, unknown>
): DemoFarm | null {
  const farm = getFarm(id, userId);
  if (!farm) return null;

  for (const field of FARM_UPDATE_FIELDS) {
    if (fields[field] !== undefined) {
      (farm as unknown as Record<string, unknown>)[field] = fields[field];
    }
  }
  farm.updatedAt = new Date();
  return farm;
}

export function deleteFarm(id: string, userId: string): boolean {
  const store = getStore();
  const index = store.farms.findIndex((f) => f.id === id && f.ownerId === userId);
  if (index === -1) return false;
  store.farms.splice(index, 1);
  delete store.simProfiles[id];
  delete store.lids[id];
  return true;
}

/**
 * Simulate a fresh sensor reading: each value drifts by a small random step,
 * clamped to [baseline - band, baseline + band] so the farm's intended
 * status stays stable. Recomputes trend and status.
 */
export function syncFarm(id: string, userId: string): DemoFarm | null {
  const farm = getFarm(id, userId);
  if (!farm) return null;

  const profile = getStore().simProfiles[farm.id] ?? defaultSimProfile;
  const now = new Date();

  const sensorKeys = ['temperature', 'humidity', 'soilMoisture', 'light'] as const;
  for (const key of sensorKeys) {
    const sensor = farm.sensors[key];
    const sim = profile[key];
    if (!sensor || !sim) continue;

    const step = sim.band * 0.5;
    const jitter = (Math.random() * 2 - 1) * step;
    const next = Math.min(
      sim.baseline + sim.band,
      Math.max(sim.baseline - sim.band, sensor.value + jitter)
    );
    const value = Math.round(next * 10) / 10;

    sensor.trend = calculateTrend(sensor.value, value);
    sensor.value = value;
    sensor.updatedAt = now;
  }

  farm.status = calculateStatus(farm.sensors, farm.thresholds);
  farm.lastSeen = now;
  farm.updatedAt = now;
  return farm;
}

export function incrementWatering(id: string, userId: string): DemoFarm | null {
  const farm = getFarm(id, userId);
  if (!farm) return null;
  farm.wateringCount += 1;
  farm.updatedAt = new Date();
  return farm;
}

// ---------------------------------------------------------------------------
// Greenhouse lid
// ---------------------------------------------------------------------------

const OPEN_ANGLE = 90;
const CLOSED_ANGLE = 0;

export function getLidState(farmId: string): LidState {
  const store = getStore();
  if (!store.lids[farmId]) {
    store.lids[farmId] = { isOpen: false, angle: CLOSED_ANGLE };
  }
  return store.lids[farmId];
}

export function setLid(farmId: string, action: 'open' | 'close' | 'toggle'): LidState {
  const lid = getLidState(farmId);
  const open = action === 'toggle' ? !lid.isOpen : action === 'open';
  lid.isOpen = open;
  lid.angle = open ? OPEN_ANGLE : CLOSED_ANGLE;
  return lid;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function listNotifications(
  userId: string,
  options: { unreadOnly?: boolean; limit?: number } = {}
): DemoNotification[] {
  let notifications = getStore()
    .notifications.filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (options.unreadOnly) {
    notifications = notifications.filter((n) => !n.read);
  }
  if (options.limit && options.limit > 0) {
    notifications = notifications.slice(0, options.limit);
  }
  return notifications;
}

export function markNotificationRead(userId: string, id: string): boolean {
  const notification = getStore().notifications.find(
    (n) => n.id === id && n.userId === userId
  );
  if (!notification) return false;
  notification.read = true;
  notification.readAt = new Date();
  return true;
}

export function addNotification(
  userId: string,
  input: Omit<DemoNotification, 'id' | 'userId' | 'read' | 'createdAt'>
): DemoNotification {
  const store = getStore();
  const notification: DemoNotification = {
    ...input,
    id: `notif-${Date.now().toString(36)}${Math.floor(Math.random() * 1296)
      .toString(36)
      .padStart(2, '0')}`,
    userId,
    read: false,
    createdAt: new Date(),
  };
  store.notifications.push(notification);
  return notification;
}

// ---------------------------------------------------------------------------
// SMS preferences (believable fakes — nothing is ever sent)
// ---------------------------------------------------------------------------

export function getSmsPreferences(userId: string): SmsPreferences {
  const store = getStore();
  if (!store.smsPreferences[userId]) {
    store.smsPreferences[userId] = structuredClone(defaultSmsPreferences);
  }
  return store.smsPreferences[userId];
}

export function updateSmsPreferences(
  userId: string,
  patch: Partial<SmsPreferences>
): SmsPreferences {
  const prefs = getSmsPreferences(userId);
  const { categories, quietHours, thresholds, ...rest } = patch;
  Object.assign(prefs, rest);
  if (categories) Object.assign(prefs.categories, categories);
  if (quietHours) Object.assign(prefs.quietHours, quietHours);
  if (thresholds) Object.assign(prefs.thresholds, thresholds);
  return prefs;
}

export function setPhonePendingVerification(userId: string, phoneNumber: string): SmsPreferences {
  const prefs = getSmsPreferences(userId);
  prefs.phoneNumber = phoneNumber;
  prefs.phoneVerified = false;
  return prefs;
}

export function setPhoneVerified(userId: string): SmsPreferences {
  const prefs = getSmsPreferences(userId);
  prefs.phoneVerified = true;
  prefs.enabled = true;
  return prefs;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function listAchievements(): DemoAchievement[] {
  return getStore().achievements;
}

export function listUserAchievements(userId: string): DemoAchievement[] {
  return getStore().achievements.filter((a) => a.unlockedBy.includes(userId));
}
