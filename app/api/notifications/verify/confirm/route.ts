/**
 * Phone Verification Confirm API Route
 * POST /api/notifications/verify/confirm
 *
 * Demo mode: any well-formed 6-digit code verifies the phone.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getSmsPreferences, setPhoneVerified } from '@/lib/demo-store';

/**
 * POST /api/notifications/verify/confirm
 * Confirm the verification code
 *
 * Body:
 * - code: string (6-digit code)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    // Validate code format
    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Must be 6 digits.' },
        { status: 400 }
      );
    }

    const prefs = getSmsPreferences(session.user.id);
    if (!prefs.phoneNumber) {
      return NextResponse.json(
        { error: 'No verification pending. Request a new code.' },
        { status: 400 }
      );
    }

    setPhoneVerified(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      phoneVerified: true,
    });
  } catch (error) {
    console.error('Error confirming verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
