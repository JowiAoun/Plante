/**
 * Leaderboard API Route
 * GET /api/leaderboard - Get top users by level/XP
 *
 * Demo mode: fictional seed users, plus the current demo session user
 * once their profile is complete.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { leaderboardRows } from '@/lib/demo-store';

interface LeaderboardEntry {
  id: string;
  username?: string;
  displayName?: string;
  avatarSeed?: string;
  level: number;
  xp: number;
}

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

    const entries: LeaderboardEntry[] = leaderboardRows().map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarSeed: user.avatarSeed,
      level: user.level,
      xp: user.xp,
    }));

    // Include the current visitor if they completed their demo profile
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.profileCompletedAt) {
      entries.push({
        id: session.user.id,
        username: session.user.username,
        displayName: session.user.displayName,
        avatarSeed: session.user.avatarSeed,
        level: session.user.level ?? 1,
        xp: session.user.xp ?? 0,
      });
    }

    entries.sort((a, b) => b.level - a.level || b.xp - a.xp);

    return NextResponse.json(
      entries.slice(0, limit).map((user, index) => ({
        rank: index + 1,
        ...user,
      }))
    );
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
