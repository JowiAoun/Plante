/**
 * Complete Profile API
 * POST /api/auth/complete-profile
 *
 * Demo mode: validates the chosen profile and returns it. Persistence
 * happens client-side via the session update() call, which writes the
 * profile into the JWT cookie (there is no database).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkUsername } from '@/lib/username';

/**
 * POST /api/auth/complete-profile
 * Complete the user's profile setup
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, displayName, avatarSeed } = body;

    // Validate username (format, reserved list, taken seed names)
    const normalizedUsername = username?.toLowerCase().trim();
    const check = checkUsername(normalizedUsername);
    if (!check.available) {
      if (check.reason === 'taken') {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        {
          error: check.reason === 'reserved' ? 'Username is reserved' : 'Invalid username format',
        },
        { status: 400 }
      );
    }

    // Validate display name
    const trimmedDisplayName = displayName?.trim() || normalizedUsername;
    if (trimmedDisplayName.length < 1 || trimmedDisplayName.length > 50) {
      return NextResponse.json(
        { error: 'Display name must be 1-50 characters' },
        { status: 400 }
      );
    }

    // Validate avatar seed
    const trimmedAvatarSeed = avatarSeed?.trim();
    if (!trimmedAvatarSeed) {
      return NextResponse.json(
        { error: 'Avatar seed is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        username: normalizedUsername,
        displayName: trimmedDisplayName,
        avatarSeed: trimmedAvatarSeed,
        level: session.user.level ?? 1,
        xp: session.user.xp ?? 0,
        profileCompletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error completing profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
