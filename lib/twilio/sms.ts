/**
 * SMS Sending Service
 * Core SMS functionality with rate limiting and quiet hours
 */

import { ObjectId } from 'mongodb';
import { getTwilioClient, getSenderPhoneNumber, getRecipientOverride } from './client';
import { env, isDev } from '@/lib/env';
import { getUsersCollection, getSmsJobsCollection } from '@/lib/db/collections';
import type { SmsPreferences, SmsNotificationType, DbSmsJob } from '@/lib/db/types';

/**
 * SMS send result
 */
export interface SmsSendResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(prefs: SmsPreferences): boolean {
  if (!prefs.quietHours.enabled) return false;

  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: prefs.quietHours.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const currentTime = formatter.format(now);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = prefs.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = prefs.quietHours.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } catch {
    // If timezone parsing fails, don't block the message
    return false;
  }
}

/**
 * Check if user has exceeded daily SMS limit
 */
export async function isRateLimited(userId: string, prefs: SmsPreferences): Promise<boolean> {
  const now = new Date();
  const lastReset = prefs.lastCountReset ? new Date(prefs.lastCountReset) : null;

  // Reset counter if it's a new day
  if (!lastReset || now.toDateString() !== lastReset.toDateString()) {
    return false;
  }

  return prefs.dailySmsCount >= env.TWILIO_DAILY_LIMIT;
}

/**
 * Check if notification type is allowed by category settings
 */
export function isCategoryEnabled(prefs: SmsPreferences, type: SmsNotificationType): boolean {
  switch (type) {
    case 'watering':
    case 'farm_action':
      return prefs.categories.wateringConfirmation;
    case 'maintenance':
      return prefs.categories.maintenanceReminders;
    case 'tank_low':
    case 'tank_critical':
    case 'tank_empty':
      return prefs.categories.waterTankAlerts;
    case 'temp_high':
    case 'temp_low':
    case 'humidity_alert':
      return prefs.categories.environmentalAlerts;
    case 'weekly_pulse':
      return prefs.categories.weeklyPulse;
    case 'verification':
      return true; // Always allow verification codes
    default:
      return false;
  }
}

/**
 * Determine if this notification should bypass quiet hours
 */
export function isCriticalNotification(type: SmsNotificationType): boolean {
  return ['tank_empty', 'verification'].includes(type);
}

/**
 * Send an SMS message
 */
export async function sendSms(
  to: string,
  message: string
): Promise<SmsSendResult> {
  try {
    const client = getTwilioClient();
    const from = getSenderPhoneNumber();

    // Use recipient override for demo mode
    const recipient = getRecipientOverride() || to;

    if (isDev && getRecipientOverride()) {
      console.log(`📱 [DEMO] Redirecting SMS from ${to} to override: ${recipient}`);
    }

    const result = await client.messages.create({
      to: recipient,
      from,
      body: message,
    });

    return {
      success: true,
      messageSid: result.sid,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send SMS:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send a notification SMS with all checks
 */
export async function sendNotificationSms(
  userId: string,
  type: SmsNotificationType,
  message: string,
  farmId?: string
): Promise<SmsSendResult> {
  // Get user preferences
  const users = await getUsersCollection();
  const user = await users.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Check if SMS is enabled
  const smsPrefs = (user.settings as { smsPreferences?: SmsPreferences })?.smsPreferences;
  if (!smsPrefs?.enabled) {
    return { success: false, error: 'SMS notifications disabled' };
  }

  // Check phone verification
  if (!smsPrefs.phoneVerified && type !== 'verification') {
    return { success: false, error: 'Phone not verified' };
  }

  // Check category settings
  if (!isCategoryEnabled(smsPrefs, type)) {
    return { success: false, error: 'Category disabled by user' };
  }

  // Check quiet hours (skip for critical notifications)
  if (!isCriticalNotification(type) && isQuietHours(smsPrefs)) {
    return { success: false, error: 'Quiet hours active' };
  }

  // Check rate limiting
  if (await isRateLimited(userId, smsPrefs)) {
    return { success: false, error: 'Daily SMS limit reached' };
  }

  // Create job record
  const smsJobs = await getSmsJobsCollection();
  const job: Omit<DbSmsJob, '_id'> = {
    userId: new ObjectId(userId),
    farmId: farmId ? new ObjectId(farmId) : undefined,
    type,
    message,
    phoneNumber: smsPrefs.phoneNumber,
    status: 'pending',
    attempts: 0,
    maxAttempts: 3,
    scheduledFor: new Date(),
    createdAt: new Date(),
  };

  const insertResult = await smsJobs.insertOne(job as DbSmsJob);
  const jobId = insertResult.insertedId;

  // Send the SMS
  const result = await sendSms(smsPrefs.phoneNumber, message);

  // Update job status
  if (result.success) {
    await smsJobs.updateOne(
      { _id: jobId },
      {
        $set: {
          status: 'sent',
          sentAt: new Date(),
          twilioMessageSid: result.messageSid,
        },
      }
    );

    // Update user's daily count
    const now = new Date();
    await users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'settings.smsPreferences.lastSmsAt': now,
          'settings.smsPreferences.lastCountReset': now,
        },
        $inc: { 'settings.smsPreferences.dailySmsCount': 1 },
      }
    );
  } else {
    await smsJobs.updateOne(
      { _id: jobId },
      {
        $set: {
          status: 'failed',
          failedAt: new Date(),
          errorMessage: result.error,
        },
        $inc: { attempts: 1 },
      }
    );
  }

  return result;
}

/**
 * Send verification code SMS (bypasses most checks)
 */
export async function sendVerificationSms(
  phoneNumber: string,
  code: string
): Promise<SmsSendResult> {
  const message = `Your Plante verification code is: ${code}\n\nThis code expires in 10 minutes.`;
  return await sendSms(phoneNumber, message);
}
