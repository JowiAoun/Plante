/**
 * Friends List API Route
 * GET /api/friends - List user's friends
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getFriendshipsCollection, getUsersCollection } from '@/lib/db/collections';

/**
 * GET /api/friends
 * Get list of accepted friends for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new ObjectId(session.user.id);
    const friendships = await getFriendshipsCollection();
    const users = await getUsersCollection();

    // Find all accepted friendships involving this user
    const userFriendships = await friendships
      .find({
        users: userId,
        status: 'accepted',
      })
      .toArray();

    // Extract friend IDs (the other user in each friendship)
    const friendIds = userFriendships.map((f) =>
      f.users.find((id) => !id.equals(userId))
    ).filter((id): id is ObjectId => id !== undefined);

    if (friendIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch friend profiles
    const friends = await users
      .find({ _id: { $in: friendIds } })
      .project({
        _id: 1,
        username: 1,
        displayName: 1,
        avatarSeed: 1,
        level: 1,
        xp: 1,
        lastSeenAt: 1,
      })
      .toArray();

    return NextResponse.json(
      friends.map((friend) => ({
        id: friend._id.toString(),
        username: friend.username,
        displayName: friend.displayName,
        avatarSeed: friend.avatarSeed,
        level: friend.level,
        xp: friend.xp,
        lastSeenAt: friend.lastSeenAt?.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
