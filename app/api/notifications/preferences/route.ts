/**
 * Notification Preferences API Route
 * GET/PUT /api/notifications/preferences
 *
 * Demo mode: preferences live in the in-memory demo store; no SMS is
 * ever sent.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getSmsPreferences,
  updateSmsPreferences,
  type SmsPreferences,
} from '@/lib/demo-store';

/**
 * GET /api/notifications/preferences
 * Get current user's SMS notification preferences
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const smsPreferences = getSmsPreferences(session.user.id);

    return NextResponse.json({
      smsEnabled: smsPreferences.enabled,
      phoneNumber: smsPreferences.phoneNumber,
      phoneVerified: smsPreferences.phoneVerified,
      categories: smsPreferences.categories,
      quietHours: smsPreferences.quietHours,
      thresholds: smsPreferences.thresholds,
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's SMS notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const currentPrefs = getSmsPreferences(session.user.id);

    // Build update object
    const updates: Partial<SmsPreferences> = {};

    if (typeof body.smsEnabled === 'boolean') {
      updates.enabled = body.smsEnabled;
    }

    if (typeof body.phoneNumber === 'string') {
      // Validate E.164 format
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (body.phoneNumber && !phoneRegex.test(body.phoneNumber)) {
        return NextResponse.json(
          { error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' },
          { status: 400 }
        );
      }
      updates.phoneNumber = body.phoneNumber;
      // Reset verification if phone changed
      if (body.phoneNumber !== currentPrefs.phoneNumber) {
        updates.phoneVerified = false;
      }
    }

    if (body.categories && typeof body.categories === 'object') {
      updates.categories = body.categories;
    }

    if (body.quietHours && typeof body.quietHours === 'object') {
      updates.quietHours = body.quietHours;
    }

    if (body.thresholds && typeof body.thresholds === 'object') {
      updates.thresholds = body.thresholds;
    }

    const newPrefs = updateSmsPreferences(session.user.id, updates);

    return NextResponse.json({
      success: true,
      smsEnabled: newPrefs.enabled,
      phoneNumber: newPrefs.phoneNumber,
      phoneVerified: newPrefs.phoneVerified,
      categories: newPrefs.categories,
      quietHours: newPrefs.quietHours,
      thresholds: newPrefs.thresholds,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
