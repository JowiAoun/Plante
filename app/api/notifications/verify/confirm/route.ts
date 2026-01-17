/**
 * Phone Verification Confirm API Route
 * POST /api/notifications/verify/confirm
 * Confirm the verification code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/db/collections';
import type { SmsPreferences } from '@/lib/db/types';

/**
 * Hash a verification code for comparison
 */
function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

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

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get SMS preferences
    const settings = user.settings as { smsPreferences?: SmsPreferences } | undefined;
    const smsPrefs = settings?.smsPreferences;

    if (!smsPrefs?.verificationCode || !smsPrefs?.verificationExpires) {
      return NextResponse.json(
        { error: 'No verification pending. Request a new code.' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (new Date() > new Date(smsPrefs.verificationExpires)) {
      return NextResponse.json(
        { error: 'Verification code has expired. Request a new code.' },
        { status: 400 }
      );
    }

    // Verify the code
    const hashedInput = hashCode(code);
    if (hashedInput !== smsPrefs.verificationCode) {
      return NextResponse.json(
        { error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    // Mark phone as verified
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          'settings.smsPreferences.phoneVerified': true,
          updatedAt: new Date(),
        },
        $unset: {
          'settings.smsPreferences.verificationCode': '',
          'settings.smsPreferences.verificationExpires': '',
        },
      }
    );

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
