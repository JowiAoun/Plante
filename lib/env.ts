/**
 * Environment Variable Configuration
 * Centralized access for all environment variables with validation
 */

/**
 * Environment variables used by the application
 */
export const env = {
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || '',

  // Sentry
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || 'development',

  // Gemini AI (Chat)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // ElevenLabs Voice (TTS)
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
} as const;

/**
 * Validate that required environment variables are set
 * Call this at app startup in production
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'MONGODB_URI',
  ] as const;

  const missing = required.filter((key) => !env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Check if we're in development mode
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Check if we're in production mode
 */
export const isProd = process.env.NODE_ENV === 'production';
