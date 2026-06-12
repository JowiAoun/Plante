/**
 * Farm Action Notification API
 * POST /api/farms/[id]/notify - Acknowledge farm actions like "Water Now"
 *
 * Demo mode: no SMS is sent; the action is recorded in the demo store
 * (watering count) and a friendly success is returned.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFarm, incrementWatering } from '@/lib/demo-store';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        const { action } = await request.json();

        if (!action) {
            return NextResponse.json({ error: 'Action required' }, { status: 400 });
        }

        const farm = getFarm(id, session.user.id);
        const farmName = farm?.name || 'Your farm';

        // Increment watering count if this is a water action
        if (action === 'water') {
            incrementWatering(id, session.user.id);
        }

        console.log(`[FarmAction] Demo notification for ${farmName}: ${action}`);

        return NextResponse.json({
            success: true,
            message: 'Notification sent!',
        });
    } catch (error) {
        console.error('[FarmAction] Error:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
