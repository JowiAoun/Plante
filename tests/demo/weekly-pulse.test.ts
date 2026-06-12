/**
 * Weekly Pulse Tests
 * Deterministic insight generation from demo-store stats.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPrimaryIssue,
  generateWeeklyInsight,
  aggregateWeeklyStats,
} from '@/lib/weekly-pulse';
import { resetDemoStore } from '@/lib/demo-store';
import { DEMO_USER_ID } from '@/lib/demo-config';

beforeEach(() => {
  resetDemoStore();
});

describe('getPrimaryIssue', () => {
  it('picks the dominant alert type', () => {
    expect(getPrimaryIssue({ temperature: 0, humidity: 0, soilMoisture: 0 })).toBe('none');
    expect(getPrimaryIssue({ temperature: 2, humidity: 0, soilMoisture: 1 })).toBe('temperature');
    expect(getPrimaryIssue({ temperature: 1, humidity: 3, soilMoisture: 1 })).toBe('humidity');
    expect(getPrimaryIssue({ temperature: 0, humidity: 0, soilMoisture: 2 })).toBe('soilMoisture');
  });
});

describe('aggregateWeeklyStats', () => {
  it('counts the seeded critical pepper farm', async () => {
    const stats = await aggregateWeeklyStats(DEMO_USER_ID);
    expect(stats.userId).toBe(DEMO_USER_ID);
    expect(stats.alerts.byType.soilMoisture).toBeGreaterThanOrEqual(1);
    expect(stats.alerts.criticalCount).toBeGreaterThanOrEqual(1);
    expect(stats.healthTrend).toBe('declining');
  });

  it('returns empty stats for a user with no farms beyond the shared one', async () => {
    const stats = await aggregateWeeklyStats('user-with-no-farms');
    // Only the healthy shared kalanchoe farm is visible
    expect(stats.alerts.total).toBe(0);
    expect(stats.healthTrend).toBe('improving');
  });
});

describe('generateWeeklyInsight', () => {
  it('is deterministic and keyed to the primary issue', async () => {
    const stats = await aggregateWeeklyStats(DEMO_USER_ID);
    const a = await generateWeeklyInsight(stats);
    const b = await generateWeeklyInsight(stats);

    expect(a).toEqual(b);
    expect(a.primaryIssue).toBe('soilMoisture');
    expect(a.summary.length).toBeGreaterThan(10);
    expect(a.suggestions.length).toBeGreaterThan(0);
    expect(a.encouragement.length).toBeGreaterThan(0);
  });

  it('celebrates an alert-free week', async () => {
    const insight = await generateWeeklyInsight({
      userId: 'x',
      weekStartDate: new Date().toISOString(),
      weekEndDate: new Date().toISOString(),
      alerts: { total: 0, byType: { temperature: 0, humidity: 0, soilMoisture: 0 }, criticalCount: 0 },
      averageResponseTimeMinutes: 0,
      healthTrend: 'improving',
    });
    expect(insight.primaryIssue).toBe('none');
  });
});
