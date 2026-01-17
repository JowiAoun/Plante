/**
 * Twilio Delivery Status Webhook
 * POST /api/webhooks/twilio/status
 * Handle SMS delivery status callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSmsJobsCollection } from '@/lib/db/collections';
import type { SmsJobStatus } from '@/lib/db/types';

/**
 * Map Twilio status to our job status
 */
function mapTwilioStatus(twilioStatus: string): SmsJobStatus | null {
  switch (twilioStatus) {
    case 'delivered':
    case 'sent':
      return 'sent';
    case 'failed':
    case 'undelivered':
      return 'failed';
    case 'queued':
    case 'sending':
      return 'pending';
    default:
      return null;
  }
}

/**
 * POST /api/webhooks/twilio/status
 * Handle Twilio delivery status callbacks
 * 
 * Twilio sends these fields:
 * - MessageSid: Unique ID of the message
 * - MessageStatus: queued, sending, sent, delivered, failed, undelivered
 * - ErrorCode: Error code if failed
 * - ErrorMessage: Error message if failed
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string | null;
    const errorMessage = formData.get('ErrorMessage') as string | null;

    if (!messageSid || !messageStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`📱 Twilio status update: ${messageSid} -> ${messageStatus}`);

    const status = mapTwilioStatus(messageStatus);
    if (!status) {
      // Unknown status, just acknowledge
      return new NextResponse('OK', { status: 200 });
    }

    // Update job in database
    const smsJobs = await getSmsJobsCollection();
    const updateData: Record<string, unknown> = {
      status,
    };

    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'failed') {
      updateData.failedAt = new Date();
      if (errorCode || errorMessage) {
        updateData.errorMessage = `${errorCode || ''}: ${errorMessage || 'Unknown error'}`;
      }
    }

    await smsJobs.updateOne(
      { twilioMessageSid: messageSid },
      { $set: updateData }
    );

    // Twilio expects an empty response
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error processing Twilio status webhook:', error);
    // Still return 200 to prevent Twilio from retrying
    return new NextResponse('OK', { status: 200 });
  }
}
