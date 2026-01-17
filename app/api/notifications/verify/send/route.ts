/**
 * Phone Verification Send API Route
 * POST /api/notifications/verify/send
 * Send a verification code to the user's phone
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/db/collections';
import { sendVerificationSms } from '@/lib/twilio/sms';
import { defaultSmsPreferences, type SmsPreferences } from '@/lib/db/types';

/**
 * Generate a random 6-digit verification code
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash a verification code for storage
 */
function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

/**
 * POST /api/notifications/verify/send
 * Send verification code to user's phone
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

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate verification code
    const code = generateVerificationCode();
    const hashedCode = hashCode(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Get or create SMS preferences
    const currentSettings = user.settings as { smsPreferences?: SmsPreferences } | undefined;
    const currentPrefs = currentSettings?.smsPreferences || defaultSmsPreferences;

    // Update user with verification code and phone number
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          'settings.smsPreferences': {
            ...currentPrefs,
            phoneNumber,
            phoneVerified: false,
            verificationCode: hashedCode,
            verificationExpires: expiresAt,
          },
          updatedAt: new Date(),
        },
      }
    );

    // Send verification SMS
    const result = await sendVerificationSms(phoneNumber, code);

    if (!result.success) {
      return NextResponse.json(
        { error: `Failed to send verification code: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
