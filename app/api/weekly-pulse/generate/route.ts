/**
 * Weekly Pulse Generation API
 * POST /api/weekly-pulse/generate - Generate and deliver weekly insight
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateWeeklyInsight, aggregateWeeklyStats } from '@/lib/weekly-pulse';
import { getNotificationsCollection, getUsersCollection } from '@/lib/db/collections';
import { sendNotificationSms } from '@/lib/twilio/sms';
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
        const pulseId = new ObjectId();
        const pulse = {
            id: pulseId.toString(),
            userId,
            createdAt: new Date().toISOString(),
            ...insight,
        };

        console.log('[WeeklyPulse] Generated pulse:', pulse.id);
        console.log('[WeeklyPulse] Summary:', pulse.summary);

        // Create in-app notification
        try {
            const notifications = await getNotificationsCollection();
            await notifications.insertOne({
                _id: new ObjectId(),
                userId: new ObjectId(userId),
                type: 'weekly_pulse',
                severity: 'info',
                title: '📊 Your Weekly Plant Report',
                message: pulse.summary,
                link: '/weekly-pulse',
                read: false,
                createdAt: new Date(),
            });
            console.log('[WeeklyPulse] In-app notification created');
        } catch (notifError) {
            console.error('[WeeklyPulse] Failed to create notification:', notifError);
        }

        // Send SMS if user has it enabled
        try {
            const users = await getUsersCollection();
            const user = await users.findOne({ _id: new ObjectId(userId) });
            const smsPrefs = (user?.settings as { smsPreferences?: { enabled: boolean; phoneVerified: boolean; categories?: { weeklyPulse?: boolean } } })?.smsPreferences;

            if (smsPrefs?.enabled && smsPrefs?.phoneVerified && smsPrefs?.categories?.weeklyPulse) {
                const smsMessage = `📊 Weekly Plant Report\n\n${pulse.summary}\n\nTap here to see more: ${process.env.NEXTAUTH_URL || 'https://plante.app'}/weekly-pulse\n\n— Plante`;
                const result = await sendNotificationSms(userId, 'weekly_pulse', smsMessage);
                if (result.success) {
                    console.log('[WeeklyPulse] SMS sent successfully');
                } else {
                    console.log('[WeeklyPulse] SMS not sent:', result.error);
                }
            } else {
                console.log('[WeeklyPulse] SMS disabled or not configured for user');
            }
        } catch (smsError) {
            console.error('[WeeklyPulse] Failed to send SMS:', smsError);
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
