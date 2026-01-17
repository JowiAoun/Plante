/**
 * Twilio Inbound SMS Webhook
 * POST /api/webhooks/twilio/inbound
 * Handle inbound SMS for opt-out (STOP/START)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUsersCollection } from '@/lib/db/collections';

/**
 * POST /api/webhooks/twilio/inbound
 * Handle inbound SMS from users
 * 
 * Twilio sends these fields:
 * - From: Sender phone number
 * - Body: Message body
 * 
 * We handle STOP/START keywords for opt-out compliance
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form data from Twilio
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;

    if (!from || !body) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const messageBody = body.trim().toUpperCase();
    console.log(`📱 Inbound SMS from ${from}: ${messageBody}`);

    // Handle opt-out keywords
    const stopKeywords = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
    const startKeywords = ['START', 'YES', 'UNSTOP'];

    const users = await getUsersCollection();

    if (stopKeywords.includes(messageBody)) {
      // User wants to opt out
      await users.updateOne(
        { 'settings.smsPreferences.phoneNumber': from },
        {
          $set: {
            'settings.smsPreferences.enabled': false,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`📱 User opted out: ${from}`);
      
      // Twilio auto-sends confirmation, we just need to update our records
    } else if (startKeywords.includes(messageBody)) {
      // User wants to opt back in
      await users.updateOne(
        { 'settings.smsPreferences.phoneNumber': from },
        {
          $set: {
            'settings.smsPreferences.enabled': true,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`📱 User opted in: ${from}`);
    }

    // Twilio expects TwiML response or empty 200
    // Return empty response - Twilio handles STOP/START auto-responses
    return new NextResponse('', { 
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error processing inbound SMS webhook:', error);
    // Still return 200 to prevent Twilio from retrying
    return new NextResponse('', { status: 200 });
  }
}
