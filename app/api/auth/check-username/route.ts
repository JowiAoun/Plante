/**
 * Check Username Availability API
 * GET /api/auth/check-username?username={username}
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkUsername } from '@/lib/username';

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

    return NextResponse.json(checkUsername(username));
  } catch (error) {
    console.error('Error checking username:', error);
    return NextResponse.json(
      { available: false, reason: 'error' },
      { status: 500 }
    );
  }
}
