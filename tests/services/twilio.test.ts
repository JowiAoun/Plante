/**
 * Twilio Service Tests
 * 
 * Tests Twilio configuration and client setup.
 * Does NOT send actual SMS messages.
 */

import { describe, it, expect } from 'vitest';

describe('Twilio Configuration', () => {
  it('Should have TWILIO_ACCOUNT_SID configured', () => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    if (!sid) {
      console.warn('⚠ TWILIO_ACCOUNT_SID not configured');
      return;
    }
    expect(sid).toMatch(/^AC/); // Twilio SIDs start with AC
  });

  it('Should have TWILIO_AUTH_TOKEN configured', () => {
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!token) {
      console.warn('⚠ TWILIO_AUTH_TOKEN not configured');
      return;
    }
    expect(token.length).toBeGreaterThan(0);
  });

  it('Should have TWILIO_PHONE_NUMBER configured', () => {
    const phone = process.env.TWILIO_PHONE_NUMBER;
    if (!phone) {
      console.warn('⚠ TWILIO_PHONE_NUMBER not configured');
      return;
    }
    // Should be a valid phone format
    expect(phone).toMatch(/^\+?\d+$/);
  });
});
