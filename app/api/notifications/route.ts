/**
 * Notifications API Route
 * GET /api/notifications - List user's notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listNotifications } from '@/lib/demo-store';

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

    const results = listNotifications(session.user.id, {
      unreadOnly,
      limit: Math.min(limit, 100),
    });

    return NextResponse.json(
      results.map((notif) => ({
        id: notif.id,
        type: notif.type,
        severity: notif.severity,
        title: notif.title,
        message: notif.message,
        link: notif.link,
        read: notif.read,
        readAt: notif.readAt?.toISOString(),
        createdAt: notif.createdAt.toISOString(),
        farmId: notif.farmId,
      }))
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
