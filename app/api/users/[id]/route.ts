/**
 * User API Route
 * GET /api/users/[id] - Get user profile
 * PATCH /api/users/[id] - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/db/collections';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 * Fetch a user's public profile
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const users = await getUsersCollection();
    const user = await users.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          username: 1,
          displayName: 1,
          avatarSeed: 1,
          level: 1,
          xp: 1,
          profileCompletedAt: 1,
          createdAt: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
      avatarSeed: user.avatarSeed,
      level: user.level,
      xp: user.xp,
      profileCompletedAt: user.profileCompletedAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/users/[id]
 * Update user profile (authenticated, owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Users can only update their own profile
    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedFields = ['username', 'displayName', 'avatarSeed', 'settings'];
    const updateFields: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    // Mark profile as completed if setting username/displayName for first time
    if (body.username && body.displayName && !body.profileCompletedAt) {
      updateFields.profileCompletedAt = new Date();
    }

    updateFields.updatedAt = new Date();

    const users = await getUsersCollection();
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: result._id.toString(),
      username: result.username,
      displayName: result.displayName,
      avatarSeed: result.avatarSeed,
      level: result.level,
      xp: result.xp,
      settings: result.settings,
      profileCompletedAt: result.profileCompletedAt,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
