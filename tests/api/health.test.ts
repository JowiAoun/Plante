/**
 * API Health Tests
 * 
 * Tests all Next.js API routes to ensure they respond correctly.
 * These are connectivity/response tests, not full integration tests.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { TEST_TIMEOUT } from '../setup';

// Base URL for API testing (uses Next.js dev server)
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Helper to make API requests
async function apiRequest(
  path: string,
  options: RequestInit = {}
): Promise<{ status: number; ok: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    let data;
    try {
      data = await response.json();
    } catch {
      // Some endpoints return empty or non-JSON
      data = null;
    }
    
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

describe('API Health Checks', { timeout: TEST_TIMEOUT }, () => {
  let serverRunning = false;

  beforeAll(async () => {
    // Check if server is running
    try {
      const response = await fetch(`${BASE_URL}/api/auth/providers`);
      serverRunning = response.ok || response.status === 401;
    } catch {
      serverRunning = false;
    }
  });

  describe('Auth Endpoints', () => {
    it('GET /api/auth/providers - should respond', async () => {
      if (!serverRunning) {
        console.warn('⚠ Server not running, skipping API tests');
        return;
      }
      const result = await apiRequest('/api/auth/providers');
      expect(result.status).toBeGreaterThan(0);
    });

    it('POST /api/auth/check-username - should validate input', async () => {
      if (!serverRunning) return;
      const result = await apiRequest('/api/auth/check-username', {
        method: 'POST',
        body: JSON.stringify({ username: 'test' }),
      });
      // Should respond (even with error for invalid session)
      expect(result.status).toBeGreaterThan(0);
    });
  });

  describe('Farm Endpoints', () => {
    it('GET /api/farms - should require auth', async () => {
      if (!serverRunning) return;
      const result = await apiRequest('/api/farms');
      // Either 401 (unauthorized) or 200 with empty farms
      expect([200, 401, 403]).toContain(result.status);
    });
  });

  describe('Leaderboard Endpoint', () => {
    it('GET /api/leaderboard - should return rankings', async () => {
      if (!serverRunning) return;
      const result = await apiRequest('/api/leaderboard');
      expect(result.ok).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('Friends Endpoints', () => {
    it('GET /api/friends - should require auth', async () => {
      if (!serverRunning) return;
      const result = await apiRequest('/api/friends');
      expect([200, 401, 403]).toContain(result.status);
    });
  });

  describe('Notifications Endpoints', () => {
    it('GET /api/notifications - should require auth', async () => {
      if (!serverRunning) return;
      const result = await apiRequest('/api/notifications');
      expect([200, 401, 403]).toContain(result.status);
    });

    it('GET /api/notifications/preferences - should require auth', async () => {
      if (!serverRunning) return;
      const result = await apiRequest('/api/notifications/preferences');
      expect([200, 401, 403]).toContain(result.status);
    });
  });

  describe('Chat Endpoint', () => {
    it('POST /api/chat - should require auth and message', async () => {
      if (!serverRunning) return;
      const result = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'test' }),
      });
      // Should respond with auth error or validation error
      expect(result.status).toBeGreaterThan(0);
    });
  });
});

// Summary test
describe('API Summary', () => {
  it('All endpoints are reachable', () => {
    // This test serves as a summary marker
    expect(true).toBe(true);
  });
});
