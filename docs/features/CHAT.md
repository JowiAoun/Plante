# Chat Feature Specification

> **AI-Powered Conversational Assistant with Voice Support**

This document specifies the `/chat` page feature that enables users to interact with a personalized AI chatbot powered by **Google Gemini** and **ElevenLabs** voice synthesis.

---

## Prerequisites

Before implementing this feature, ensure the following are completed:

### Required Infrastructure
- [ ] **User Authentication** — NextAuth setup with Google OAuth (existing)
- [ ] **User Profile System** — User entity with `level`, `xp`, `avatarSeed` (existing in `types/index.ts`)
- [ ] **Farm Data Model** — Farm entity with sensor data structure (existing in `types/index.ts`)
- [ ] **Achievement System** — Achievement tracking for context (existing in `types/index.ts`)

### API Keys Required
- [ ] **Gemini API Key** — Obtain from [Google AI Studio](https://aistudio.google.com/apikey)
- [ ] **ElevenLabs API Key** — Obtain from [ElevenLabs Settings](https://elevenlabs.io/app/settings/api-keys)

### Dependencies to Install
```bash
npm install @google/generative-ai elevenlabs
```

### Environment Configuration
- [ ] Add `GEMINI_API_KEY` to `.env`
- [ ] Add `ELEVENLABS_API_KEY` to `.env`
- [ ] Add `ELEVENLABS_VOICE_ID` to `.env` (optional, has default)

---

## Overview

The chat feature provides a conversational interface where users can:

- Ask plant care questions and receive personalized advice
- Get real-time updates about their farms and plant health
- Receive proactive alerts when issues are detected
- Interact via text or voice (text-to-speech responses)

### Key Integrations

| Service | Purpose | SDK |
|---------|---------|-----|
| **Google Gemini** | AI language model for understanding and generating responses | `@google/generative-ai` |
| **ElevenLabs** | Natural voice synthesis for spoken responses | `elevenlabs` (TypeScript SDK) |

---

## User Context

The AI has access to rich user context to provide personalized responses:

### User Profile Data

```typescript
interface ChatUserContext {
  user: {
    id: string;
    username: string;
    displayName: string;
    level: number;
    xp: number;
    avatarSeed: string;
  };
  farms: Farm[];              // All user's farms with sensor data
  achievements: Achievement[]; // Unlocked achievements
  recentActivity: ActivityEvent[];
}
```

### Farm Context (per farm)

| Data Point | Description | Example Use |
|------------|-------------|-------------|
| `name` | Farm identifier | "Your Tomato Garden has..." |
| `status` | Health status | Proactive alerts for critical/warning |
| `sensors.temp` | Temperature reading | Temperature advice |
| `sensors.humidity` | Humidity level | Watering recommendations |
| `sensors.soil` | Soil moisture | "Soil is dry, consider watering" |
| `lastSeen` | Last update time | Data freshness context |

---

## Gemini API Integration

### System Prompt Template

```text
You are Plante, a friendly and knowledgeable plant care assistant. You help users 
take care of their plants and farms.

USER CONTEXT:
- Username: {displayName}
- Level: {level} (XP: {xp})
- Number of farms: {farmCount}

FARM STATUS:
{farmsSummary}

ACHIEVEMENTS:
{achievementsList}

GUIDELINES:
1. Be friendly, encouraging, and use plant/gardening metaphors
2. Provide actionable, specific advice based on sensor data
3. Celebrate user achievements and progress
4. If a plant is in critical status, prioritize addressing that
5. Keep responses concise but helpful (2-3 sentences typical)
6. Use emojis sparingly for personality 🌱
```

### Proactive Conversation Starters

The AI can initiate conversations when:

| Condition | Example Message |
|-----------|-----------------|
| Plant critical status | "Hey! Your {farmName} needs urgent attention - the soil moisture is very low 🚨" |
| Achievement unlocked | "Congratulations on reaching Level {n}! 🎉 You've earned: {achievement}" |
| Sensor threshold exceeded | "Heads up! The temperature in {farmName} is getting quite high at {temp}°C" |
| Long inactivity | "It's been a while! Let's check on your plants together" |

### API Configuration

```typescript
// Recommended Gemini settings for chat
const generationConfig = {
  temperature: 0.7,        // Balanced creativity
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 512,    // Keep responses concise
};

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];
```

---

## ElevenLabs Voice Integration

### Voice Features

- **Text-to-Speech**: AI responses can be played as audio
- **Voice Selection**: Use a friendly, warm voice preset
- **Toggle**: Users can enable/disable voice responses

### Voice Configuration

```typescript
interface VoiceConfig {
  voiceId: string;          // ElevenLabs voice ID
  stability: number;        // 0.5 recommended
  similarityBoost: number;  // 0.75 recommended
  style: number;            // Optional style parameter
}

// Recommended default voice settings
const defaultVoice = {
  voiceId: "EXAVITQu4vr4xnSDxMaL", // Sarah - friendly, warm
  stability: 0.5,
  similarityBoost: 0.75,
};
```

### Audio Playback

| Feature | Description |
|---------|-------------|
| Auto-play | Optional: play voice immediately on response |
| Play button | Manual trigger for voice playback |
| Loading state | Show audio buffering indicator |
| Mute toggle | Global voice enable/disable |

---

## UI Components

### Page Structure: `/chat`

```
┌─────────────────────────────────────────┐
│  TopBar (with back navigation)          │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  AI Avatar / Status Indicator   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │       Chat Message Area         │   │
│  │    (scrollable history)         │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔊  Voice Toggle    Settings   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ [  Type a message...        ] 📤│   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### New Components Required

| Component | Purpose | Props |
|-----------|---------|-------|
| `ChatPage` | Page container | - |
| `ChatMessageList` | Scrollable message history | `messages[]` |
| `ChatMessage` | Individual message bubble | `sender`, `content`, `timestamp`, `isAI` |
| `ChatInput` | Text input with send button | `onSend`, `disabled`, `placeholder` |
| `VoiceToggle` | Enable/disable voice output | `enabled`, `onToggle` |
| `AIAvatar` | Animated AI character | `speaking`, `emotion` |
| `AudioPlayer` | Hidden audio element for TTS | `audioUrl`, `autoPlay` |

### Message Types

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioUrl?: string;    // ElevenLabs audio if generated
  isLoading?: boolean;  // While AI is generating
}
```

---

## Environment Variables

### Required Keys

Add to `.env` and `.env.example`:

```bash
# Gemini API Configuration
# Get your API key from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ElevenLabs Configuration  
# Get your API key from: https://elevenlabs.io/app/settings/api-keys
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
```

### Environment Validation

Update `lib/env.ts` to include:

```typescript
export const env = {
  // ... existing vars
  
  // Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  
  // ElevenLabs
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL',
} as const;
```

---

## API Routes

### Chat Endpoint

```
POST /api/chat
```

**Request Body:**
```typescript
{
  message: string;
  conversationHistory?: ChatMessage[];
  voiceEnabled?: boolean;
}
```

**Response:**
```typescript
{
  response: string;
  audioUrl?: string;  // If voiceEnabled is true
  suggestedActions?: string[];  // Quick reply suggestions
}
```

### Streaming Support (Optional Enhancement)

For real-time response streaming:

```
POST /api/chat/stream
Content-Type: text/event-stream
```

---

## Example Conversations

### Plant Care Question

> **User**: How do I keep my tomatoes healthy?

> **Plante**: Great question! 🍅 Based on your Tomato Garden's current readings (23°C, 65% humidity), your plants are in good shape. Keep the soil consistently moist but not waterlogged, and consider mulching to retain moisture. With your Level 5 experience, you're doing great!

### Proactive Alert

> **Plante**: Hey! 🚨 I noticed your Herb Corner is showing a critical status - the soil moisture dropped to 15%. Your herbs might need watering soon! Want me to explain the best watering technique for herbs?

### Profile-related Query

> **User**: What achievements am I close to unlocking?

> **Plante**: You're making excellent progress! 🌟 With 850 XP, you're just 150 XP away from Level 6! You've unlocked 5 achievements so far. Your next goal could be the "Green Thumb" badge - try maintaining healthy status on all farms for 7 consecutive days!

---

## Technical Considerations

### Rate Limiting

| Service | Free Tier Limit | Recommendation |
|---------|-----------------|----------------|
| Gemini | Varies by tier | Implement client-side debounce (500ms) |
| ElevenLabs | ~10k chars/month | Cache audio, make voice optional |

### Error Handling

```typescript
enum ChatError {
  GEMINI_RATE_LIMIT = 'AI is thinking too hard, please wait a moment',
  ELEVENLABS_QUOTA = 'Voice is resting, text response only',
  NETWORK_ERROR = 'Connection issues, please try again',
  CONTEXT_TOO_LONG = 'Starting a fresh conversation',
}
```

### Performance

- Cache user context to avoid repeated fetches
- Lazy-load audio only when voice is enabled
- Limit conversation history to last 20 messages
- Use streaming for faster perceived response time

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Screen readers | ARIA labels on all controls |
| Keyboard navigation | Tab through messages, Enter to send |
| Reduced motion | Disable AI avatar animations |
| Voice alternative | Always provide text alongside audio |

---

## Future Enhancements

- [ ] **Voice Input**: Speech-to-text for hands-free interaction
- [ ] **Image Analysis**: Share plant photos for AI diagnosis (Gemini Vision)
- [ ] **Scheduled Check-ins**: Daily plant health summaries
- [ ] **Multi-language Support**: Localized responses
- [ ] **Conversation Export**: Save helpful advice

---

## Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",
  "elevenlabs": "^1.0.0"
}
```

Install with:
```bash
npm install @google/generative-ai elevenlabs
```
