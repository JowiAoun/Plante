/**
 * Demo Store Tests
 * Seeding consistency, sensor simulation bounds, lid state, CRUD.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  resetDemoStore,
  listFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm,
  syncFarm,
  incrementWatering,
  getLidState,
  setLid,
  listNotifications,
  markNotificationRead,
  getSmsPreferences,
  updateSmsPreferences,
  listSeedUsers,
  leaderboardRows,
  calculateStatus,
  calculateTrend,
} from '@/lib/demo-store';
import { DEMO_USER_ID } from '@/lib/demo-config';

beforeEach(() => {
  resetDemoStore();
});

describe('seeding', () => {
  it('always returns the same seed farms on a fresh store', () => {
    const first = listFarms(DEMO_USER_ID).map((f) => f.id);
    resetDemoStore();
    const second = listFarms(DEMO_USER_ID).map((f) => f.id);
    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(5);
  });

  it('includes the shared Kalanchoe farm for any user', () => {
    const farms = listFarms('some-other-user');
    expect(farms.map((f) => f.id)).toContain('kalanchoe-farm');
  });

  it('does not expose demo-user farms to other users', () => {
    expect(getFarm('farm-tomato', 'some-other-user')).toBeNull();
    expect(getFarm('kalanchoe-farm', 'some-other-user')).not.toBeNull();
  });

  it('seeds fictional leaderboard users sorted by level then xp', () => {
    const rows = leaderboardRows();
    expect(rows.length).toBe(listSeedUsers().length);
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];
      expect(
        prev.level > curr.level || (prev.level === curr.level && prev.xp >= curr.xp)
      ).toBe(true);
    }
  });
});

describe('syncFarm simulation', () => {
  it('keeps each farm status stable under repeated jitter', () => {
    for (let i = 0; i < 50; i++) {
      expect(syncFarm('farm-tomato', DEMO_USER_ID)?.status).toBe('healthy');
      expect(syncFarm('farm-herb', DEMO_USER_ID)?.status).toBe('warning');
      expect(syncFarm('farm-pepper', DEMO_USER_ID)?.status).toBe('critical');
    }
  });

  it('keeps sensor values inside threshold-safe bands', () => {
    for (let i = 0; i < 50; i++) {
      const farm = syncFarm('farm-tomato', DEMO_USER_ID)!;
      expect(farm.sensors.temperature.value).toBeGreaterThanOrEqual(22.8);
      expect(farm.sensors.temperature.value).toBeLessThanOrEqual(25.2);
      expect(farm.sensors.soilMoisture.value).toBeGreaterThanOrEqual(43.5);
      expect(farm.sensors.soilMoisture.value).toBeLessThanOrEqual(46.5);
    }
  });

  it('updates lastSeen and returns null for unknown farms', () => {
    const before = getFarm('farm-tomato', DEMO_USER_ID)!.lastSeen.getTime();
    const after = syncFarm('farm-tomato', DEMO_USER_ID)!.lastSeen.getTime();
    expect(after).toBeGreaterThanOrEqual(before);
    expect(syncFarm('nope', DEMO_USER_ID)).toBeNull();
  });
});

describe('status & trend helpers', () => {
  it('flags out-of-range values as critical and buffer-zone values as warning', () => {
    const thresholds = {
      temperature: { min: 15, max: 30 },
      humidity: { min: 40, max: 80 },
      soilMoisture: { min: 30, max: 70 },
    };
    const reading = (value: number) => ({
      value,
      unit: 'x',
      trend: 'stable' as const,
      updatedAt: new Date(),
    });
    const sensors = (t: number, h: number, s: number) => ({
      temperature: reading(t),
      humidity: reading(h),
      soilMoisture: reading(s),
    });

    expect(calculateStatus(sensors(24, 65, 45), thresholds)).toBe('healthy');
    expect(calculateStatus(sensors(24, 65, 32), thresholds)).toBe('warning');
    expect(calculateStatus(sensors(24, 65, 22), thresholds)).toBe('critical');
  });

  it('computes trends with a 5% threshold', () => {
    expect(calculateTrend(undefined, 50)).toBe('stable');
    expect(calculateTrend(100, 110)).toBe('up');
    expect(calculateTrend(100, 90)).toBe('down');
    expect(calculateTrend(100, 102)).toBe('stable');
  });
});

describe('farm CRUD', () => {
  it('creates, updates, and deletes a farm', () => {
    const farm = createFarm(DEMO_USER_ID, { name: '  Test Patch  ', species: 'Mint' });
    expect(farm.name).toBe('Test Patch');
    expect(getFarm(farm.id, DEMO_USER_ID)).not.toBeNull();

    const updated = updateFarm(farm.id, DEMO_USER_ID, { name: 'Renamed Patch' });
    expect(updated?.name).toBe('Renamed Patch');

    expect(deleteFarm(farm.id, DEMO_USER_ID)).toBe(true);
    expect(getFarm(farm.id, DEMO_USER_ID)).toBeNull();
  });

  it('does not allow deleting the shared farm', () => {
    expect(deleteFarm('kalanchoe-farm', DEMO_USER_ID)).toBe(false);
  });

  it('increments the watering count', () => {
    const before = getFarm('farm-pepper', DEMO_USER_ID)!.wateringCount;
    incrementWatering('farm-pepper', DEMO_USER_ID);
    expect(getFarm('farm-pepper', DEMO_USER_ID)!.wateringCount).toBe(before + 1);
  });
});

describe('lid state', () => {
  it('defaults to closed and toggles', () => {
    expect(getLidState('farm-tomato')).toEqual({ isOpen: false, angle: 0 });
    expect(setLid('farm-tomato', 'open')).toEqual({ isOpen: true, angle: 90 });
    expect(setLid('farm-tomato', 'toggle')).toEqual({ isOpen: false, angle: 0 });
    expect(setLid('farm-tomato', 'close')).toEqual({ isOpen: false, angle: 0 });
  });
});

describe('notifications', () => {
  it('lists newest first and supports unreadOnly/limit', () => {
    const all = listNotifications(DEMO_USER_ID);
    expect(all.length).toBeGreaterThanOrEqual(4);
    for (let i = 1; i < all.length; i++) {
      expect(all[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(all[i].createdAt.getTime());
    }

    const unread = listNotifications(DEMO_USER_ID, { unreadOnly: true });
    expect(unread.every((n) => !n.read)).toBe(true);

    expect(listNotifications(DEMO_USER_ID, { limit: 2 }).length).toBe(2);
  });

  it('marks a notification as read', () => {
    const unread = listNotifications(DEMO_USER_ID, { unreadOnly: true })[0];
    expect(markNotificationRead(DEMO_USER_ID, unread.id)).toBe(true);
    expect(listNotifications(DEMO_USER_ID).find((n) => n.id === unread.id)?.read).toBe(true);
    expect(markNotificationRead(DEMO_USER_ID, 'nope')).toBe(false);
  });
});

describe('sms preferences', () => {
  it('starts from defaults and deep-merges updates', () => {
    const prefs = getSmsPreferences(DEMO_USER_ID);
    expect(prefs.enabled).toBe(false);
    expect(prefs.categories.weeklyPulse).toBe(true);

    const updated = updateSmsPreferences(DEMO_USER_ID, {
      enabled: true,
      categories: { weeklyPulse: false } as never,
    });
    expect(updated.enabled).toBe(true);
    expect(updated.categories.weeklyPulse).toBe(false);
    // Untouched nested keys survive the merge
    expect(updated.categories.wateringConfirmation).toBe(true);
  });
});
