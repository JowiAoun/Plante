/**
 * Notifications API Route
 * GET /api/notifications - List user's notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getNotificationsCollection } from '@/lib/db/collections';

/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 * 
 * Query params:
 * - unreadOnly: 'true' to filter to unread only
 * - limit: number of notifications to return (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const notifications = await getNotificationsCollection();

    const query: Record<string, unknown> = {
      userId: new ObjectId(session.user.id),
    };

    if (unreadOnly) {
      query.read = false;
    }

    const results = await notifications
      .find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 100))
      .toArray();

    return NextResponse.json(
      results.map((notif) => ({
        id: notif._id.toString(),
        type: notif.type,
        severity: notif.severity,
        title: notif.title,
        message: notif.message,
        link: notif.link,
        read: notif.read,
        readAt: notif.readAt?.toISOString(),
        createdAt: notif.createdAt.toISOString(),
        farmId: notif.farmId?.toString(),
        achievementId: notif.achievementId,
        fromUserId: notif.fromUserId?.toString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
