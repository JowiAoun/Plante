/**
 * SMS Send API Route
 * POST /api/notifications/sms/send
 * Trigger an SMS notification (for testing/internal use)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotificationSms } from '@/lib/twilio/sms';
import { getMessageByType } from '@/lib/twilio/templates';
import type { SmsNotificationType } from '@/lib/db/types';

/**
 * POST /api/notifications/sms/send
 * Send an SMS notification
 * 
 * Body:
 * - type: SmsNotificationType
 * - farmId?: string
 * - params: Record<string, unknown> (template parameters)
 * - message?: string (override template with custom message)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, farmId, params, message: customMessage } = body;

    // Validate type
    const validTypes: SmsNotificationType[] = [
      'watering',
      'maintenance',
      'tank_low',
      'tank_critical',
      'tank_empty',
      'temp_high',
      'temp_low',
      'humidity_alert',
    ];

    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate message from template or use custom
    let message: string;
    if (customMessage) {
      message = customMessage;
    } else if (params) {
      try {
        message = getMessageByType(type, params);
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to generate message: ${error instanceof Error ? error.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Either params or message must be provided' },
        { status: 400 }
      );
    }

    // Send the SMS
    const result = await sendNotificationSms(
      session.user.id,
      type,
      message,
      farmId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, sent: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      messageSid: result.messageSid,
    });
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
