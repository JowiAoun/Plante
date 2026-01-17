/**
 * Twilio Client Initialization
 * Provides a singleton Twilio client instance with dev mode fallback
 */

import Twilio from 'twilio';
import { env, isDev } from '@/lib/env';

/**
 * Mock Twilio client for development
 * Logs SMS to console instead of sending
 */
const mockClient = {
  messages: {
    create: async (params: { to: string; from: string; body: string }) => {
      console.log('📱 [DEV MODE] SMS would be sent:');
      console.log(`   To: ${params.to}`);
      console.log(`   From: ${params.from}`);
      console.log(`   Body: ${params.body}`);
      return {
        sid: `MOCK_${Date.now()}`,
        status: 'sent',
        to: params.to,
        from: params.from,
        body: params.body,
      };
    },
  },
};

/**
 * Get Twilio client instance
 * Returns mock client in dev mode if credentials are not configured
 */
export function getTwilioClient() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = env;

  // Use mock client if credentials are missing or in dev mode without creds
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    if (isDev) {
      console.log('⚠️ Twilio credentials not configured - using mock client');
      return mockClient;
    }
    throw new Error('Twilio credentials not configured');
  }

  return Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  return !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER);
}

/**
 * Get the phone number to send from
 */
export function getSenderPhoneNumber(): string {
  return env.TWILIO_PHONE_NUMBER;
}

/**
 * Get the recipient override (for demo/hackathon)
 * If set, all SMS will be sent to this number regardless of user settings
 */
export function getRecipientOverride(): string | null {
  return env.TWILIO_RECIPIENT_OVERRIDE || null;
}
