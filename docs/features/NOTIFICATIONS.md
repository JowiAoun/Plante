# Twilio SMS Notifications Specification

> **Real-Time Plant Care Alerts via SMS**

This document specifies how to implement SMS notifications in **Plante** using Twilio to keep users informed about their plants with actionable alerts.

---

## Prerequisites

Before implementing this feature, ensure the following are completed:

### Required Infrastructure
- [ ] **MongoDB Database** — User collection with phone numbers
- [ ] **Farm Sensor Pipeline** — Real-time sensor data for triggering alerts
- [ ] **User Authentication** — Ability to associate notifications with users

### Twilio Account Setup
- [ ] **Create Twilio Account** — Sign up at [twilio.com](https://www.twilio.com)
- [ ] **Get Account SID** — Copy from Twilio Console dashboard
- [ ] **Get Auth Token** — Copy from Twilio Console dashboard
- [ ] **Get Phone Number** — Purchase or use trial number from Twilio
- [ ] **Verify Sender ID** — Complete verification for production sending

### Dependencies to Install
```bash
npm install twilio
```

### Environment Configuration
- [ ] Add `TWILIO_ACCOUNT_SID` to `.env`
- [ ] Add `TWILIO_AUTH_TOKEN` to `.env`
- [ ] Add `TWILIO_PHONE_NUMBER` to `.env`

### Recommended Order
1. **After Auth & MongoDB** — Requires user phone numbers stored
2. **After Farm Sensors** — Notifications are triggered by sensor data
3. **Before Production Deploy** — Users expect timely alerts

---

## Overview

Twilio SMS notifications provide immediate, attention-grabbing alerts for time-sensitive plant care actions. Unlike in-app notifications, SMS ensures users receive critical alerts even when not actively using the app.

### Notification Categories

| Category | Trigger | Priority | Example Message |
|----------|---------|----------|-----------------|
| **Watering Confirmation** | Successful watering action | Low | "Your plant was watered! 🌱💧" |
| **Maintenance Reminder** | Scheduled care tasks due | Medium | "Time to fertilize your Monstera!" |
| **Water Tank Alert** | Tank level ≤ threshold | High | "Your water tank is at 10%" |
| **Refill Urgent** | Tank critically low | Critical | "Please refill your water tank" |
| **Environmental Alert** | Temp/humidity out of range | Critical | "It's too hot, move the plant" |

---

## Settings Page Integration

SMS notifications can be **enabled or disabled** from the user's Settings page:

### User-Facing Settings

| Setting | Description |
|---------|-------------|
| **Enable SMS Notifications** | Master toggle to turn all SMS alerts on/off |
| **Phone Number** | Input field for user to enter their phone number |
| **Notification Categories** | Per-category toggles (watering, maintenance, alerts) |
| **Quiet Hours** | Time range when non-critical alerts are silenced |

> [!IMPORTANT]
> **Phone Number Limitation:** While the Settings UI allows users to enter/change their phone number, **the actual recipient number is hardcoded in the `.env` file**. This is because Twilio requires phone number verification before sending to arbitrary numbers. In production, only verified numbers can receive SMS.
>
> For a hackathon/demo environment, set `TWILIO_RECIPIENT_OVERRIDE` to a verified phone number that will receive all notifications regardless of user settings.

### Settings UI Behavior

1. User enters phone number in Settings → stores to database
2. System ignores stored number and uses `TWILIO_RECIPIENT_OVERRIDE` from `.env`
3. This allows demo functionality without Twilio's full verification flow
4. For production: Remove override and implement proper phone verification

---

## Environment Variables

Add to `.env` and `.env.example`:

```bash
# Twilio SMS Configuration
# Get credentials from: https://console.twilio.com/
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Optional: Rate limiting
TWILIO_DAILY_LIMIT=50
TWILIO_COOLDOWN_MINUTES=15

# REQUIRED for demo/hackathon: Override recipient phone
# All SMS will be sent to this verified number regardless of user settings
TWILIO_RECIPIENT_OVERRIDE=+1234567890
```

Update `lib/env.ts`:

```typescript
export const env = {
  // ... existing vars
  
  // Twilio
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  TWILIO_DAILY_LIMIT: parseInt(process.env.TWILIO_DAILY_LIMIT || '50'),
  TWILIO_COOLDOWN_MINUTES: parseInt(process.env.TWILIO_COOLDOWN_MINUTES || '15'),
} as const;
```

---

## Notification Types

### 1. Watering Confirmation

**Trigger:** Plant watering action completed successfully

**Message Template:**
```
🌱 Your {plantName} was just watered!

Next watering: {nextWateringDate}

— Plante
```

**Behavior:**
- Sent immediately after watering action
- Include next scheduled watering if available
- Optional — users can disable confirmations

---

### 2. Maintenance Reminder

**Trigger:** Scheduled maintenance task is due

**Message Template:**
```
🔔 Maintenance reminder for {farmName}

Task: {taskDescription}
Due: {dueDate}

Open Plante to mark as complete.

— Plante
```

**Behavior:**
- Sent at user's preferred notification time
- Batched if multiple tasks due same day
- Respects quiet hours settings

---

### 3. Water Tank Level Alert

**Trigger:** Water tank sensor reads ≤ user-defined threshold

**Message Templates:**

**Low (≤ 25%):**
```
⚠️ Water tank at {percentage}%

Your {farmName} has about {estimatedDays} days of water remaining.

— Plante
```

**Critical (≤ 10%):**
```
🚨 Water tank critically low at {percentage}%

Please refill your water tank soon to keep your plants healthy.

— Plante
```

**Empty (≤ 5%):**
```
🚨 URGENT: Water tank nearly empty!

{farmName} needs water immediately. Your plants may be at risk.

— Plante
```

**Behavior:**
- Progressive urgency based on level
- Cooldown between repeated alerts (configurable)
- Stop sending once refilled

---

### 4. Environmental Alerts

**Trigger:** Temperature or humidity outside safe range

**Message Templates:**

**Temperature Too High:**
```
🌡️ Temperature alert for {farmName}

Current: {temperature}°F — Too hot for {plantNames}
Recommended: {minTemp}°F - {maxTemp}°F

Consider moving to a cooler location or increasing airflow.

— Plante
```

**Temperature Too Low:**
```
🌡️ Temperature alert for {farmName}

Current: {temperature}°F — Too cold for {plantNames}
Recommended: {minTemp}°F - {maxTemp}°F

Move away from cold drafts or windows.

— Plante
```

**Humidity Alert:**
```
💧 Humidity alert for {farmName}

Current: {humidity}% — {status} for {plantNames}
Recommended: {minHumidity}% - {maxHumidity}%

{actionSuggestion}

— Plante
```

**Behavior:**
- Threshold values per plant type
- Aggregate multiple plants in same location
- Cooldown to prevent spam during fluctuations

---

## User Preferences (Database Schema)

Store notification preferences in the user document:

```typescript
interface NotificationPreferences {
  smsEnabled: boolean;
  phoneNumber: string;         // E.164 format: +1234567890
  phoneVerified: boolean;
  
  // Per-category toggles
  categories: {
    wateringConfirmation: boolean;
    maintenanceReminders: boolean;
    waterTankAlerts: boolean;
    environmentalAlerts: boolean;
  };
  
  // Timing preferences
  quietHours: {
    enabled: boolean;
    start: string;             // "22:00" (10 PM)
    end: string;               // "08:00" (8 AM)
    timezone: string;          // "America/New_York"
  };
  
  // Thresholds
  thresholds: {
    tankLowPercent: number;    // Default: 25
    tankCriticalPercent: number; // Default: 10
  };
  
  // Rate limiting state
  lastNotificationAt: Date;
  dailyCount: number;
  lastCountReset: Date;
}
```

---

## Rate Limiting & Cooldowns

Prevent notification fatigue and control costs:

| Limit Type | Default Value | Purpose |
|------------|---------------|---------|
| **Daily Limit** | 50 messages/user/day | Cost control |
| **Same-Alert Cooldown** | 15 minutes | Prevent spam for fluctuating sensors |
| **Quiet Hours** | 10 PM - 8 AM | Respect user sleep |
| **Critical Override** | Always send | Tank empty, extreme temps |

**Cooldown Logic:**
- Track last send time per notification type per farm
- Skip if within cooldown unless condition worsens
- Critical alerts bypass cooldown but not quiet hours
- Emergency alerts (tank empty) bypass all limits

---

## Phone Number Verification Flow

Before sending SMS, verify user's phone number:

1. **User enters phone number** — Format to E.164
2. **Send verification code** — 6-digit code via SMS
3. **User confirms code** — Mark as verified
4. **Enable notifications** — Only send to verified numbers

**Verification Message:**
```
Your Plante verification code is: {code}

This code expires in 10 minutes.
```

---

## Notification Queue System

For reliable delivery and retry handling:

### Queue Document Schema
```typescript
interface NotificationJob {
  id: string;
  userId: string;
  farmId: string;
  type: NotificationType;
  message: string;
  phoneNumber: string;
  
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  maxAttempts: number;        // Default: 3
  
  scheduledFor: Date;
  createdAt: Date;
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  
  twilioMessageSid?: string;
}
```

### Retry Strategy
- **Attempt 1:** Immediate
- **Attempt 2:** After 5 minutes
- **Attempt 3:** After 30 minutes
- **After max attempts:** Mark failed, log error

---

## Message Formatting Guidelines

### Character Limits
- **SMS segment:** 160 characters (GSM-7) or 70 (Unicode)
- **Target:** Keep under 160 chars when possible
- **Multi-segment ok:** For critical alerts with actions

### Formatting Rules
1. **Lead with emoji** — Visual category indicator
2. **Key info first** — Most important detail upfront
3. **Action if needed** — What user should do
4. **Sign off** — "— Plante" for branding
5. **No links** — Use app deep links sparingly

### Personalization Tokens
| Token | Description | Example |
|-------|-------------|---------|
| `{plantName}` | Individual plant name | "Monstera" |
| `{plantNames}` | List of plants | "Monstera, Pothos" |
| `{farmName}` | Farm/garden name | "Living Room" |
| `{percentage}` | Tank level | "15" |
| `{temperature}` | Current temp | "85" |
| `{humidity}` | Current humidity | "30" |
| `{nextWateringDate}` | Next scheduled water | "Tomorrow at 9 AM" |

---

## Opt-Out Handling

Users must be able to stop receiving SMS:

### In-App Opt-Out
- Toggle in Settings → Notifications
- Per-category granular control
- Immediate effect

### SMS Opt-Out (Required by Law)
- Support STOP keyword replies
- Twilio handles automatically
- Sync opt-out status to database
- Send confirmation: "You've been unsubscribed from Plante alerts. Reply START to re-subscribe."

### Webhook for Opt-Out Events
Listen for Twilio opt-out callbacks and update user preferences.

---

## Analytics & Monitoring

Track notification effectiveness:

### Metrics to Capture
| Metric | Description |
|--------|-------------|
| `notifications.sent` | Total messages sent |
| `notifications.delivered` | Confirmed delivery |
| `notifications.failed` | Failed attempts |
| `notifications.opted_out` | Unsubscribe events |
| `notifications.by_type` | Breakdown by category |
| `notifications.latency` | Time from trigger to send |

### Sentry Integration
- Log all notification attempts
- Alert on delivery failure spikes
- Track Twilio API latency

---

## Cost Considerations

### Twilio Pricing (Approximate)
| Type | Cost |
|------|------|
| Outbound SMS (US) | ~$0.0079/message |
| Inbound SMS | ~$0.0079/message |
| Phone Number | ~$1.15/month |

### Cost Control Strategies
1. **Daily limits** — Cap messages per user
2. **Batching** — Combine multiple alerts when possible
3. **Smart thresholds** — Avoid alerts for minor fluctuations
4. **User preferences** — Let users disable non-critical alerts
5. **Segment monitoring** — Track multi-segment message usage

---

## Security Considerations

### Data Protection
- Store phone numbers encrypted at rest
- Never log full phone numbers (mask: +1***567890)
- Verify phone ownership before enabling

### API Security
- Store Twilio credentials in environment variables only
- Use webhook signature validation for inbound
- Rate limit the verification endpoint

### Compliance
- **TCPA (US):** Obtain consent before texting
- **GDPR (EU):** Phone numbers are PII
- **CTIA Guidelines:** Include opt-out instructions

---

## API Endpoints

### User-Facing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications/preferences` | GET | Get user notification preferences |
| `/api/notifications/preferences` | PUT | Update notification preferences |
| `/api/notifications/verify/send` | POST | Send phone verification code |
| `/api/notifications/verify/confirm` | POST | Confirm verification code |
| `/api/notifications/history` | GET | Get notification history |

### Webhook Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/twilio/status` | POST | Delivery status callbacks |
| `/api/webhooks/twilio/inbound` | POST | Inbound SMS (opt-out handling) |

---

## Testing Strategy

### Development
- Use Twilio Test Credentials (no real SMS sent)
- Log messages to console instead
- Mock delivery status callbacks

### Staging
- Use real Twilio with verified test numbers only
- Test all notification types end-to-end
- Verify rate limiting works

### Production Checklist
- [ ] Phone number verified with Twilio
- [ ] Opt-out handling working
- [ ] Rate limits configured
- [ ] Monitoring dashboards set up
- [ ] Alerting for high failure rates
- [ ] Cost alerts configured

---

## Dependencies

```json
{
  "twilio": "^4.0.0"
}
```

Install with:
```bash
npm install twilio
```
