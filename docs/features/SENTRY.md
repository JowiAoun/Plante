# Sentry Integration Specification

> **All-in-One Debugging Platform with AI-Powered Insights**

This document specifies how to instrument **Plante** with Sentry for comprehensive error tracking, performance monitoring, and AI-assisted debugging.

---

## Prerequisites

Before implementing this feature, ensure the following are completed:

### Required Infrastructure
- [ ] **Next.js App Router** — Project using Next.js with App Router (existing)
- [ ] **Core Features Working** — Basic app functionality to monitor (farms, auth, etc.)

### Sentry Account Setup
- [ ] **Create Sentry Project** — Create a new project at [sentry.io](https://sentry.io)
- [ ] **Get DSN** — Copy from Project Settings → Client Keys
- [ ] **Get Auth Token** — Generate at Settings → Auth Tokens (for source maps)

### Dependencies to Install
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Environment Configuration
- [ ] Add `SENTRY_DSN` to `.env`
- [ ] Add `SENTRY_AUTH_TOKEN` to `.env`
- [ ] Add `SENTRY_ENVIRONMENT` to `.env` (optional, defaults to `development`)

### Recommended Order
1. **Install first** — Sentry should be one of the first integrations added
2. **Before Chat Feature** — Enables monitoring of AI API calls from day one
3. **Before Production Deploy** — Ensures error visibility from launch

---

## Overview

Sentry provides connected telemetry (errors, logs, traces) combined with **Seer AI** for intelligent debugging. For Plante, we focus on monitoring **critical user experiences** rather than just collecting data.

### Critical Experiences to Monitor

| Experience | Why It's Critical | What to Track |
|------------|-------------------|---------------|
| **Farm Sensor Updates** | Core app functionality | Real-time data flow, sensor errors |
| **AI Chat Interactions** | User engagement | Gemini API latency, failures |
| **Voice Synthesis** | Premium feature | ElevenLabs API health |
| **User Authentication** | Access control | OAuth flow, session errors |
| **Level-Up/Achievements** | Gamification engagement | XP calculations, unlock events |

---

## SDK Installation

### Dependencies

```bash
npm install @sentry/nextjs
```

### Initialization

Run the Sentry wizard for Next.js setup:

```bash
npx @sentry/wizard@latest -i nextjs
```

This creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `instrumentation.ts`

---

## Environment Variables

Add to `.env` and `.env.example`:

```bash
# Sentry Configuration
# Get your DSN from: https://sentry.io/settings/projects/{project}/keys/
SENTRY_DSN=your_sentry_dsn_here
SENTRY_AUTH_TOKEN=your_sentry_auth_token_here

# Optional: Environment tagging
SENTRY_ENVIRONMENT=development
```

Update `lib/env.ts`:

```typescript
export const env = {
  // ... existing vars
  
  // Sentry
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || 'development',
} as const;
```

---

## Structured Logging

### Log Levels Strategy

| Level | Use Case | Example |
|-------|----------|---------|
| `debug` | Development tracing | Sensor data parsing steps |
| `info` | Normal operations | User login, farm created |
| `warning` | Recoverable issues | API retry, stale sensor data |
| `error` | Failures needing attention | Gemini API error, auth failure |
| `fatal` | Critical system failures | Database connection lost |

### Implementation

```typescript
import * as Sentry from '@sentry/nextjs';

// Structured logging with context
Sentry.logger.info('Farm sensor update received', {
  farmId: farm.id,
  sensorType: 'temperature',
  value: sensor.value,
  status: farm.status,
});

// Warning with actionable context
Sentry.logger.warning('Sensor data stale', {
  farmId: farm.id,
  lastSeen: farm.lastSeen,
  staleDuration: Date.now() - new Date(farm.lastSeen).getTime(),
});
```

---

## Tracing Critical Flows

### Farm Data Pipeline

```typescript
import * as Sentry from '@sentry/nextjs';

async function updateFarmSensors(farmId: string, data: SensorData) {
  return Sentry.startSpan(
    {
      name: 'farm.sensors.update',
      op: 'farm.pipeline',
      attributes: {
        'farm.id': farmId,
        'sensor.count': Object.keys(data).length,
      },
    },
    async (span) => {
      // Validate sensor data
      const validated = await Sentry.startSpan(
        { name: 'validate_sensors', op: 'validation' },
        () => validateSensorData(data)
      );

      // Update database
      const result = await Sentry.startSpan(
        { name: 'persist_sensors', op: 'db.write' },
        () => persistSensorData(farmId, validated)
      );

      // Check thresholds and alert
      await Sentry.startSpan(
        { name: 'check_thresholds', op: 'business_logic' },
        () => checkAlertThresholds(farmId, validated)
      );

      span.setStatus({ code: 1, message: 'ok' });
      return result;
    }
  );
}
```

### AI Chat Flow

```typescript
async function handleChatMessage(userId: string, message: string) {
  return Sentry.startSpan(
    {
      name: 'chat.message',
      op: 'ai.chat',
      attributes: {
        'user.id': userId,
        'message.length': message.length,
      },
    },
    async (span) => {
      // Gather user context
      const context = await Sentry.startSpan(
        { name: 'gather_context', op: 'db.read' },
        () => getUserContext(userId)
      );

      // Call Gemini API
      const aiResponse = await Sentry.startSpan(
        { name: 'gemini.generate', op: 'ai.inference' },
        () => generateGeminiResponse(message, context)
      );

      // Generate voice (optional)
      let audioUrl: string | undefined;
      if (context.voiceEnabled) {
        audioUrl = await Sentry.startSpan(
          { name: 'elevenlabs.synthesize', op: 'ai.tts' },
          () => synthesizeVoice(aiResponse)
        );
      }

      span.setAttribute('response.length', aiResponse.length);
      span.setAttribute('voice.enabled', context.voiceEnabled);
      return { response: aiResponse, audioUrl };
    }
  );
}
```

---

## AI Agent Monitoring

For monitoring the Gemini and ElevenLabs AI integrations:

```typescript
import * as Sentry from '@sentry/nextjs';

// Track AI model usage and performance
async function callGeminiWithMonitoring(prompt: string) {
  return Sentry.startSpan(
    {
      name: 'gemini.chat.completion',
      op: 'ai.run',
      attributes: {
        'ai.model': 'gemini-1.5-flash',
        'ai.provider': 'google',
        'ai.prompt.tokens': estimateTokens(prompt),
      },
    },
    async (span) => {
      const startTime = Date.now();
      
      try {
        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();
        
        span.setAttributes({
          'ai.response.tokens': estimateTokens(response),
          'ai.latency_ms': Date.now() - startTime,
        });
        
        // Log successful generation
        Sentry.logger.info('Gemini response generated', {
          latency: Date.now() - startTime,
          promptTokens: estimateTokens(prompt),
          responseTokens: estimateTokens(response),
        });
        
        return response;
      } catch (error) {
        span.setStatus({ code: 2, message: 'error' });
        throw error;
      }
    }
  );
}
```

---

## Custom Metrics

### Key Metrics to Track

```typescript
import * as Sentry from '@sentry/nextjs';

// Sensor health distribution
Sentry.metrics.distribution('farm.sensor.value', sensor.value, {
  tags: { 
    farm_id: farmId,
    sensor_type: sensor.type,
    status: farm.status,
  },
  unit: sensor.unit,
});

// User engagement counters
Sentry.metrics.increment('chat.messages.sent', 1, {
  tags: { voice_enabled: String(voiceEnabled) },
});

// AI response latency
Sentry.metrics.timing('ai.gemini.latency', responseTimeMs, {
  tags: { model: 'gemini-1.5-flash' },
});

// Gamification events
Sentry.metrics.increment('achievement.unlocked', 1, {
  tags: { 
    achievement_id: achievement.id,
    rarity: achievement.rarity,
  },
});

// Level-up tracking
Sentry.metrics.gauge('user.level', user.level, {
  tags: { user_id: user.id },
});
```

---

## Error Boundaries

### React Error Boundary

```tsx
import * as Sentry from '@sentry/nextjs';

// Wrap critical components
export default function FarmPage() {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <PixelModal>
          <h2>Something went wrong with your farm 🌱</h2>
          <p>We're looking into it. Try refreshing!</p>
        </PixelModal>
      )}
      onError={(error, componentStack) => {
        Sentry.logger.error('Farm component crashed', {
          error: error.message,
          componentStack,
        });
      }}
    >
      <FarmDashboard />
    </Sentry.ErrorBoundary>
  );
}
```

### API Route Error Handling

```typescript
// app/api/chat/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const response = await handleChatMessage(message);
    return Response.json(response);
  } catch (error) {
    // Capture with full context
    Sentry.captureException(error, {
      tags: { 
        api_route: '/api/chat',
        error_type: error.name,
      },
      extra: {
        request_body: await req.text(),
      },
    });
    
    Sentry.logger.error('Chat API error', { error: error.message });
    
    return Response.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
```

---

## User Context & Feedback

### Set User Context on Auth

```typescript
import * as Sentry from '@sentry/nextjs';

// After successful authentication
function onUserLogin(user: User) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    email: user.email,
  });
  
  Sentry.setContext('user_profile', {
    level: user.level,
    xp: user.xp,
    farmCount: user.farms?.length ?? 0,
  });
  
  Sentry.logger.info('User logged in', {
    userId: user.id,
    level: user.level,
  });
}

// On logout
function onUserLogout() {
  Sentry.setUser(null);
}
```

### User Feedback Widget

```tsx
import * as Sentry from '@sentry/nextjs';

function FeedbackButton() {
  const handleFeedback = () => {
    Sentry.showReportDialog({
      title: 'Help us improve Plante! 🌱',
      subtitle: 'Tell us what happened',
      successMessage: 'Thanks for your feedback!',
    });
  };

  return (
    <ActionButton onClick={handleFeedback} variant="secondary">
      Report Issue
    </ActionButton>
  );
}
```

---

## Release Tracking

### Source Maps & Releases

```javascript
// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'plante',
  silent: true,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  automaticVercelMonitors: true,
});
```

### Deployment Tagging

```bash
# In CI/CD pipeline
sentry-cli releases new $VERSION
sentry-cli releases set-commits $VERSION --auto
sentry-cli releases finalize $VERSION
sentry-cli releases deploys $VERSION new -e production
```

---

## Seer AI Debugger

Sentry's AI debugger (Seer) works best with rich context. To maximize its effectiveness:

### Provide Actionable Context

```typescript
try {
  await updateFarmSensors(farmId, sensorData);
} catch (error) {
  Sentry.captureException(error, {
    contexts: {
      farm: {
        id: farmId,
        name: farm.name,
        status: farm.status,
        lastSeen: farm.lastSeen,
      },
      sensor_data: {
        raw: JSON.stringify(sensorData),
        validation_errors: validationErrors,
      },
    },
    tags: {
      error_category: 'sensor_update',
      farm_status: farm.status,
    },
    fingerprint: ['farm-sensor-update', farmId],
  });
  throw error;
}
```

### Breadcrumbs for Debugging

```typescript
// Add breadcrumbs for key user actions
Sentry.addBreadcrumb({
  category: 'user.action',
  message: 'User opened farm details',
  level: 'info',
  data: { farmId, farmName: farm.name },
});

Sentry.addBreadcrumb({
  category: 'ai.chat',
  message: 'User sent chat message',
  level: 'info',
  data: { messageLength: message.length },
});
```

---

## Dashboard Alerts

### Recommended Alert Rules

| Alert | Condition | Action |
|-------|-----------|--------|
| **Critical Farm Errors** | Error rate > 1% in farm.* | PagerDuty/Slack notify |
| **AI Latency Spike** | P95 latency > 5s for ai.* | Investigate Gemini/ElevenLabs |
| **Auth Failures** | > 10 auth errors in 5 min | Security review |
| **New Error Pattern** | New issue detected | Slack notification |

---

## Performance Monitoring Config

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance
  tracesSampleRate: 1.0,  // 100% in dev, lower in prod
  tracePropagationTargets: ['localhost', /^https:\/\/.*\.plante\.app/],
  
  // Session Replay (optional but valuable)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Environment
  environment: process.env.SENTRY_ENVIRONMENT,
});
```

---

## Testing Sentry Integration

### Verify Setup

```typescript
// Add a test button in dev mode
function DebugTools() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div>
      <button onClick={() => {
        throw new Error('Test Sentry Error');
      }}>
        Test Error
      </button>
      <button onClick={() => {
        Sentry.logger.info('Test log message', { test: true });
      }}>
        Test Log
      </button>
    </div>
  );
}
```

---

## Dependencies

```json
{
  "@sentry/nextjs": "^8.0.0"
}
```

Install with:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```
