/**
 * Demo Mode Configuration
 *
 * Edge-safe constants only (imported by both lib/auth.ts and middleware.ts).
 * This app is a self-contained demo: there are no secrets to protect, so the
 * session secret is intentionally public and hard-coded.
 */

export const DEMO_SESSION_SECRET = 'plante-demo-not-a-secret';

export const DEMO_USER_ID = 'demo-user';
