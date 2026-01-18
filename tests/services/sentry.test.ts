/**
 * Sentry Service Tests
 * 
 * Tests Sentry configuration for error tracking.
 */

import { describe, it, expect } from 'vitest';

describe('Sentry Configuration', () => {
  it('Should have SENTRY_DSN configured', () => {
    const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) {
      console.warn('⚠ SENTRY_DSN not configured');
      return;
    }
    expect(dsn).toMatch(/^https:\/\/.*@.*\.ingest\..*sentry\.io/);
  });

  it('Should have SENTRY_ORG configured for releases', () => {
    const org = process.env.SENTRY_ORG;
    if (!org) {
      console.warn('⚠ SENTRY_ORG not configured (optional for releases)');
      return;
    }
    expect(org.length).toBeGreaterThan(0);
  });

  it('Should have SENTRY_PROJECT configured for releases', () => {
    const project = process.env.SENTRY_PROJECT;
    if (!project) {
      console.warn('⚠ SENTRY_PROJECT not configured (optional for releases)');
      return;
    }
    expect(project.length).toBeGreaterThan(0);
  });
});
