/**
 * Username Validation Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { checkUsername, RESERVED_USERNAMES, USERNAME_PATTERN } from '@/lib/username';
import { resetDemoStore } from '@/lib/demo-store';

beforeEach(() => {
  resetDemoStore();
});

describe('checkUsername', () => {
  it('rejects malformed usernames', () => {
    for (const bad of ['', 'ab', 'has space', 'way_too_long_username_here', 'émoji']) {
      expect(checkUsername(bad)).toMatchObject({ available: false, reason: 'invalid' });
    }
    expect(checkUsername(null)).toMatchObject({ available: false, reason: 'invalid' });
  });

  it('normalizes case before validating (matches profile-setup behavior)', () => {
    expect(checkUsername('VALID_NAME')).toEqual({ available: true });
  });

  it('rejects reserved usernames', () => {
    for (const reserved of RESERVED_USERNAMES) {
      expect(checkUsername(reserved)).toMatchObject({ available: false, reason: 'reserved' });
    }
  });

  it('rejects seed usernames as taken', () => {
    expect(checkUsername('fern_fanatic')).toMatchObject({ available: false, reason: 'taken' });
    expect(checkUsername('MOSS_BOSS')).toMatchObject({ available: false, reason: 'taken' });
  });

  it('accepts fresh valid usernames', () => {
    expect(checkUsername('brand_new_farmer')).toEqual({ available: true });
    expect(USERNAME_PATTERN.test('brand_new_farmer')).toBe(true);
  });
});
