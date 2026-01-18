/**
 * Weekly Pulse Generation API
 * POST /api/weekly-pulse/generate - Generate and deliver weekly insight
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWeeklyInsight, aggregateWeeklyStats } from '@/lib/weekly-pulse';
import { ObjectId } from 'mongodb';

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

        // Generate AI insight
        const insight = await generateWeeklyInsight(stats);

        // Create pulse record
        const pulse = {
            id: new ObjectId().toString(),
            userId,
            createdAt: new Date().toISOString(),
            ...insight,
        };

        // TODO: Store pulse in MongoDB
        // TODO: Send in-app notification
        // TODO: Send SMS if user has enabled smsWeeklyPulse

        console.log('[WeeklyPulse] Generated pulse:', pulse.id);
        console.log('[WeeklyPulse] Summary:', pulse.summary);

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
