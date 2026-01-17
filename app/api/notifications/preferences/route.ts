/**
 * Notification Preferences API Route
 * GET/PUT /api/notifications/preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getUsersCollection } from '@/lib/db/collections';
import { defaultSmsPreferences, type SmsPreferences } from '@/lib/db/types';

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

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: new ObjectId(session.user.id) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return SMS preferences or defaults
    const settings = user.settings as { smsPreferences?: SmsPreferences } | undefined;
    const smsPreferences = settings?.smsPreferences || defaultSmsPreferences;

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
    const users = await getUsersCollection();
    
    // Get current preferences
    const user = await users.findOne({ _id: new ObjectId(session.user.id) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSettings = user.settings as { smsPreferences?: SmsPreferences } | undefined;
    const currentPrefs = currentSettings?.smsPreferences || defaultSmsPreferences;

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
      updates.categories = {
        ...currentPrefs.categories,
        ...body.categories,
      };
    }

    if (body.quietHours && typeof body.quietHours === 'object') {
      updates.quietHours = {
        ...currentPrefs.quietHours,
        ...body.quietHours,
      };
    }

    if (body.thresholds && typeof body.thresholds === 'object') {
      updates.thresholds = {
        ...currentPrefs.thresholds,
        ...body.thresholds,
      };
    }

    // Merge with current preferences
    const newPrefs: SmsPreferences = {
      ...currentPrefs,
      ...updates,
    };

    // Update user document
    await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          'settings.smsPreferences': newPrefs,
          updatedAt: new Date(),
        },
      }
    );

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
