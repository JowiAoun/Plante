/**
 * User Consent API
 * POST /api/user/consent - Update user's chat analytics consent preference
 *
 * Demo mode: validates and acknowledges; the client persists the flag into
 * the JWT session token via update() (there is no database).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
