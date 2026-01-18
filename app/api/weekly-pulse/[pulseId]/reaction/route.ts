/**
 * Weekly Pulse Reaction API
 * POST /api/weekly-pulse/[pulseId]/reaction - Record user reaction (👍/👎)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { recordPulseReaction } from '@/lib/weekly-pulse';

interface RouteParams {
    params: Promise<{ pulseId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        // Authenticate
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { pulseId } = await params;
        const body = await request.json();
        const { reaction } = body;

        // Validate reaction
        if (!['helpful', 'not_helpful'].includes(reaction)) {
            return NextResponse.json(
                { error: 'Invalid reaction. Must be "helpful" or "not_helpful"' },
                { status: 400 }
            );
        }

        // Record reaction
        await recordPulseReaction(pulseId, session.user.id, reaction);

        return NextResponse.json({
            success: true,
            message: `Recorded reaction: ${reaction}`,
        });
    } catch (error) {
        console.error('[WeeklyPulse] Reaction recording failed:', error);
        return NextResponse.json(
            { error: 'Failed to record reaction' },
            { status: 500 }
        );
    }
}
