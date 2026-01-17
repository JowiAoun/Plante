/**
 * Complete Profile API
 * POST /api/auth/complete-profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/db/collections';

// Reserved usernames
const RESERVED_USERNAMES = ['admin', 'plante', 'system', 'api', 'null', 'undefined', 'root', 'mod', 'moderator'];

// Username validation
const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

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

    // Validate username
    const normalizedUsername = username?.toLowerCase().trim();
    if (!normalizedUsername || !USERNAME_PATTERN.test(normalizedUsername)) {
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    if (RESERVED_USERNAMES.includes(normalizedUsername)) {
      return NextResponse.json(
        { error: 'Username is reserved' },
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

    const users = await getUsersCollection();

    // Check username availability (except for current user)
    const existingUser = await users.findOne({
      username: normalizedUsername,
      _id: { $ne: new ObjectId(session.user.id) },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Update user profile
    const now = new Date();
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          username: normalizedUsername,
          displayName: trimmedDisplayName,
          avatarSeed: trimmedAvatarSeed,
          profileCompletedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result._id.toString(),
        username: result.username,
        displayName: result.displayName,
        avatarSeed: result.avatarSeed,
        level: result.level,
        xp: result.xp,
        profileCompletedAt: result.profileCompletedAt,
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
