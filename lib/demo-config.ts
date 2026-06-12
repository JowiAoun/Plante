/**
 * Demo Mode Configuration
 *
 * Edge-safe constants only (imported by both lib/auth.ts and middleware.ts).
 * This app is a self-contained demo: there are no secrets to protect, so the
 * session secret is intentionally public and hard-coded.
 */

export const DEMO_SESSION_SECRET = 'plante-demo-not-a-secret';

export const DEMO_USER_ID = 'demo-user';

/**
 * Explicit session cookie name shared by the auth route and the middleware.
 * Without env vars, next-auth's default cookie naming diverges between the
 * Node auth route (secure "__Secure-" prefix on https) and the Edge
 * middleware (which infers the name from NEXTAUTH_URL/VERCEL env vars),
 * causing a login redirect loop on Vercel. Pinning one name avoids the
 * inference entirely.
 */
export const DEMO_SESSION_COOKIE = 'plante-demo.session-token';
