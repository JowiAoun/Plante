/**
 * Leaderboard API Route
 * GET /api/leaderboard - Get top users by level/XP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/db/collections';

/**
 * GET /api/leaderboard
 * Get top users sorted by level and XP
 * 
 * Query params:
 * - limit: number of users to return (default: 100, max: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    const users = await getUsersCollection();

    // Get users who have completed their profile, sorted by level and XP
    const leaderboard = await users
      .find({ profileCompletedAt: { $exists: true } })
      .sort({ level: -1, xp: -1 })
      .limit(limit)
      .project({
        _id: 1,
        username: 1,
        displayName: 1,
        avatarSeed: 1,
        level: 1,
        xp: 1,
      })
      .toArray();

    return NextResponse.json(
      leaderboard.map((user, index) => ({
        rank: index + 1,
        id: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        avatarSeed: user.avatarSeed,
        level: user.level,
        xp: user.xp,
      }))
    );
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
