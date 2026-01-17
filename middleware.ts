/**
 * NextAuth.js Middleware
 * Route protection and profile completion enforcement
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isProfileSetup = req.nextUrl.pathname === '/profile-setup';

    // If no token, withAuth will redirect to login
    if (!token) {
      return NextResponse.next();
    }

    // Redirect to profile-setup if profile not completed (for protected routes)
    if (!isProfileSetup && !token.profileCompletedAt) {
      return NextResponse.redirect(new URL('/profile-setup', req.url));
    }

    // Redirect away from profile-setup if already completed
    if (isProfileSetup && token.profileCompletedAt) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/farms/:path*',
    '/profile/:path*',
    '/profile-setup',
    '/settings/:path*',
    '/leaderboard/:path*',
    '/museum/:path*',
    '/museums/:path*',
  ],
};
