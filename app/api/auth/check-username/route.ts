/**
 * Check Username Availability API
 * GET /api/auth/check-username?username={username}
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/db/collections';

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = ['admin', 'plante', 'system', 'api', 'null', 'undefined', 'root', 'mod', 'moderator'];

// Username validation regex: lowercase, numbers, underscores only, 3-20 chars
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

/**
 * GET /api/auth/check-username
 * Check if a username is available
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username')?.toLowerCase().trim();

    if (!username) {
      return NextResponse.json(
        { available: false, reason: 'invalid' },
        { status: 400 }
      );
    }

    // Check format
    if (!USERNAME_PATTERN.test(username)) {
      return NextResponse.json({
        available: false,
        reason: 'invalid',
        message: 'Username must be 3-20 characters, lowercase letters, numbers, and underscores only',
      });
    }

    // Check reserved
    if (RESERVED_USERNAMES.includes(username)) {
      return NextResponse.json({
        available: false,
        reason: 'reserved',
        message: 'This username is reserved',
      });
    }

    // Check database
    const users = await getUsersCollection();
    const existing = await users.findOne(
      { username },
      { projection: { _id: 1 } }
    );

    if (existing) {
      return NextResponse.json({
        available: false,
        reason: 'taken',
        message: 'This username is already taken',
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { available: false, reason: 'error' },
      { status: 500 }
    );
  }
}
