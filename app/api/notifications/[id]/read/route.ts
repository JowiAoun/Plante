/**
 * Mark Notification as Read API Route
 * POST /api/notifications/[id]/read - Mark notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getNotificationsCollection } from '@/lib/db/collections';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    const notifications = await getNotificationsCollection();
    const result = await notifications.updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(session.user.id),
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
