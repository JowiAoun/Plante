/**
 * Mark Notification as Read API Route
 * POST/PATCH /api/notifications/[id]/read - Mark notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { markNotificationRead } from '@/lib/demo-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function handleMarkRead(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const marked = markNotificationRead(session.user.id, id);

    if (!marked) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/notifications/[id]/read
 * Mark a notification as read
 */
export async function POST(request: NextRequest, context: RouteParams) {
  return handleMarkRead(request, context);
}

/**
 * PATCH /api/notifications/[id]/read
 * Same as POST (the notifications hook uses PATCH)
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  return handleMarkRead(request, context);
}
