/**
 * Demo Chat Engine Tests
 * Keyword routing and sensor-value grounding.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { generateDemoReply } from '@/lib/demo-chat';
import { resetDemoStore, listFarms } from '@/lib/demo-store';
import { DEMO_USER_ID } from '@/lib/demo-config';
import type { DemoChatContext } from '@/lib/demo-chat';

let ctx: DemoChatContext;

beforeEach(() => {
  resetDemoStore();
  ctx = {
    user: { username: 'demo_farmer', displayName: 'Demo Farmer', level: 3, xp: 420 },
    farms: listFarms(DEMO_USER_ID),
  };
});

describe('generateDemoReply', () => {
  it('reports live sensor values when a farm is named', () => {
    const farm = ctx.farms.find((f) => f.name === 'Tomato Paradise')!;
    const { response } = generateDemoReply('How is Tomato Paradise doing?', ctx);
    expect(response).toContain('Tomato Paradise');
    expect(response).toContain(`${farm.sensors.temperature.value}°C`);
    expect(response).toContain(`${farm.sensors.humidity.value}%`);
  });

  it('explains the problem for a critical farm', () => {
    const { response } = generateDemoReply('Help, my Pepper Palace is dying 😭', ctx);
    expect(response.toLowerCase()).toContain('critical');
    expect(response.toLowerCase()).toContain('soil moisture');
  });

  it('answers humidity questions across farms', () => {
    const { response } = generateDemoReply('what is the humidity like?', ctx);
    expect(response).toContain('Humidity');
    expect(response).toContain('%');
  });

  it('greets the user by display name', () => {
    const { response } = generateDemoReply('hello there', ctx);
    expect(response).toContain('Demo Farmer');
  });

  it('answers gamification questions with level and xp', () => {
    const { response } = generateDemoReply('what level am I?', ctx);
    expect(response).toContain('level 3');
    expect(response).toContain('420');
  });

  it('falls back to a tip for unrelated messages', () => {
    const { response } = generateDemoReply('zzzz qwerty', ctx);
    expect(response.length).toBeGreaterThan(20);
  });

  it('returns at most 3 suggested actions, mirroring the old chat route', () => {
    const water = generateDemoReply('should I water my plants?', ctx);
    expect(water.suggestedActions).toContain('How often should I water?');
    expect(water.suggestedActions.length).toBeLessThanOrEqual(3);

    // Seed data always has a warning/critical farm, so status chip appears
    expect(water.suggestedActions).toContain('Check my farm status');
  });
});
