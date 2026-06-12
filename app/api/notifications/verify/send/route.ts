/**
 * Phone Verification Send API Route
 * POST /api/notifications/verify/send
 *
 * Demo mode: no SMS is sent. The phone number is stored as pending and
 * any 6-digit code will be accepted by the confirm endpoint.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setPhonePendingVerification } from '@/lib/demo-store';

/**
 * POST /api/notifications/verify/send
 * "Send" a verification code to the user's phone
 *
 * Body:
 * - phoneNumber: string (E.164 format)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber } = body;

    // Validate phone number
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' },
        { status: 400 }
      );
    }

    setPhonePendingVerification(session.user.id, phoneNumber);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return NextResponse.json({
      success: true,
      message: 'Verification code sent (demo: any 6-digit code works)',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
