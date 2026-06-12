/**
 * Lid Control API Route
 * POST /api/farms/[id]/lid - Control the greenhouse lid
 * GET /api/farms/[id]/lid - Get current lid status
 *
 * Demo mode: the lid is a simulated in-memory state per farm.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFarm, getLidState, setLid } from '@/lib/demo-store';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: farmId } = await params;

    try {
        const { action } = await request.json();

        if (!action || !['open', 'close', 'toggle'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Use: open, close, or toggle' },
                { status: 400 }
            );
        }

        const farm = getFarm(farmId, session.user.id);
        if (!farm) {
            return NextResponse.json(
                { error: 'Farm not found', success: false },
                { status: 404 }
            );
        }

        const lid = setLid(farmId, action as 'open' | 'close' | 'toggle');

        return NextResponse.json({
            success: true,
            isOpen: lid.isOpen,
            angle: lid.angle,
            message: `Lid ${lid.isOpen ? 'opened' : 'closed'} successfully`,
            farmId,
        });
    } catch (error) {
        console.error('[LidControl] Error:', error);
        return NextResponse.json(
            { error: 'Failed to control lid', success: false },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: farmId } = await params;

    try {
        const farm = getFarm(farmId, session.user.id);
        if (!farm) {
            return NextResponse.json(
                { error: 'Farm not found', isOpen: false },
                { status: 404 }
            );
        }

        const lid = getLidState(farmId);

        return NextResponse.json({
            isOpen: lid.isOpen,
            angle: lid.angle,
            farmId,
        });
    } catch (error) {
        console.error('[LidStatus] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get lid status', isOpen: false },
            { status: 500 }
        );
    }
}
