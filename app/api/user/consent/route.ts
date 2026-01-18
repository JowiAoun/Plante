/**
 * User Consent API
 * POST /api/user/consent - Update user's chat analytics consent preference
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/db/collections';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { chatAnalyticsConsent } = body;

        if (typeof chatAnalyticsConsent !== 'boolean') {
            return NextResponse.json(
                { error: 'Invalid consent value' },
                { status: 400 }
            );
        }

        const users = await getUsersCollection();
        await users.updateOne(
            { _id: new ObjectId(session.user.id) },
            {
                $set: {
                    'settings.chatAnalyticsConsent': chatAnalyticsConsent,
                    'settings.chatAnalyticsConsentAt': new Date(),
                    updatedAt: new Date(),
                },
            }
        );

        console.log(`[Consent] User ${session.user.id} set chatAnalyticsConsent to ${chatAnalyticsConsent}`);

        return NextResponse.json({
            success: true,
            chatAnalyticsConsent,
        });
    } catch (error) {
        console.error('[Consent] Failed to update consent:', error);
        return NextResponse.json(
            { error: 'Failed to update consent' },
            { status: 500 }
        );
    }
}
