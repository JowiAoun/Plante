/**
 * Farm Action Notification API
 * Sends SMS notification when user triggers farm actions like "Water Now"
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotificationSms } from '@/lib/twilio/sms';
import { getFarmsCollection } from '@/lib/db/collections';
import { ObjectId } from 'mongodb';

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

        // Get farm name for the notification
        const farms = await getFarmsCollection();
        const farm = await farms.findOne({ _id: new ObjectId(id) });
        const farmName = farm?.name || 'Your farm';

        // Build notification message
        const messages: Record<string, string> = {
            water: `💧 Water reminder for ${farmName}! Time to check the soil moisture and water your plants.`,
            hatch: `🚪 Hatch action requested for ${farmName}. Check your greenhouse ventilation.`,
        };

        const message = messages[action] || `🌱 Action "${action}" requested for ${farmName}.`;

        // Increment watering count if this is a water action
        if (action === 'water') {
            await farms.updateOne(
                { _id: new ObjectId(id) },
                { $inc: { wateringCount: 1 } }
            );
        }

        // Send SMS notification
        const result = await sendNotificationSms(
            session.user.id,
            'farm_action',
            message,
            id
        );

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Notification sent!'
            });
        } else {
            return NextResponse.json({
                success: false,
                message: result.error || 'SMS not sent',
                reason: result.error
            });
        }
    } catch (error) {
        console.error('[FarmAction] Error:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}
