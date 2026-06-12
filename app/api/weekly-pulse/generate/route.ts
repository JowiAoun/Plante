/**
 * Weekly Pulse Generation API
 * POST /api/weekly-pulse/generate - Generate and deliver weekly insight
 *
 * Demo mode: stats come from the demo store and the insight is built from
 * deterministic templates. No SMS is sent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWeeklyInsight, aggregateWeeklyStats } from '@/lib/weekly-pulse';
import { addNotification } from '@/lib/demo-store';

export async function POST(request: NextRequest) {
    try {
        // Authenticate
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const userId = body.userId || session.user.id;

        // Aggregate weekly stats
        const stats = await aggregateWeeklyStats(userId);

        // Generate insight
        const insight = await generateWeeklyInsight(stats);

        // Create pulse record
        const pulse = {
            id: `pulse-${Date.now().toString(36)}`,
            userId,
            createdAt: new Date().toISOString(),
            ...insight,
        };

        console.log('[WeeklyPulse] Generated pulse:', pulse.id);

        // Create in-app notification
        try {
            addNotification(userId, {
                type: 'weekly_pulse',
                severity: 'info',
                title: '📊 Your Weekly Plant Report',
                message: pulse.summary,
                link: '/weekly-pulse',
            });
        } catch (notifError) {
            console.error('[WeeklyPulse] Failed to create notification:', notifError);
        }

        return NextResponse.json({
            success: true,
            pulse,
        });
    } catch (error) {
        console.error('[WeeklyPulse] Generation failed:', error);
        return NextResponse.json(
            { error: 'Failed to generate weekly pulse' },
            { status: 500 }
        );
    }
}
