/**
 * NextAuth.js Middleware
 * Route protection and profile completion enforcement
 */

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isProfileSetup = pathname === '/profile-setup';
    const hasCompletedProfile = !!token?.profileCompletedAt;

    // If no token, withAuth will redirect to login
    if (!token) {
      return NextResponse.next();
    }

    // User on profile-setup page
    if (isProfileSetup) {
      // If profile already completed, redirect to dashboard
      if (hasCompletedProfile) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      // Otherwise, allow them to complete profile setup
      return NextResponse.next();
    }

    // User on protected routes (not profile-setup)
    // If profile not completed, redirect to profile-setup
    if (!hasCompletedProfile) {
      return NextResponse.redirect(new URL('/profile-setup', req.url));
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
