# SurveyMonkey Integration

> **Invisible AI-Powered Feedback Collection for Plant Care Insights**

Two frictionless feedback features that gather insights without interrupting the plant care experience.

| Feature | Description | User Friction |
|---------|-------------|---------------|
| **AI Chat Micro-Surveys** | Extract insights from natural conversation | Zero |
| **Weekly AI Insight Pulse** | Sensor-driven insights delivered to users | Zero |

---

## Prerequisites

- [x] AI Chat System (see [CHAT.md](./CHAT.md))
- [x] Farm Sensor Data (temperature, humidity, soil)
- [x] SurveyMonkey API Key from [Developer Portal](https://developer.surveymonkey.com/)

```bash
npm install axios
```

```bash
# .env additions
SURVEYMONKEY_ACCESS_TOKEN=your_access_token
SURVEYMONKEY_COLLECTOR_ID=your_collector_id
SURVEYMONKEY_SURVEY_ID=your_survey_id
```

---

# Feature 1: AI Chat Micro-Surveys

## How It Works

```
User: "Why are my tomato leaves yellow?"
    ↓
AI: Responds helpfully + natural follow-up: "Have you dealt with plant diseases before?"
    ↓
User: "I had aphids last summer"
    ↓
Gemini extracts: { experience: "intermediate", past_issues: ["pests"], sentiment: "frustrated" }
    ↓
POST to SurveyMonkey API (invisible to user)
```

## Extraction Schema (6 Core Insights)

We extract exactly **6 high-value data points** from conversations:

| # | Extraction | Type | Why It Matters |
|---|------------|------|----------------|
| 1 | **Experience Level** | `beginner` / `intermediate` / `expert` | Adjust AI explanation complexity |
| 2 | **Primary Struggle** | `watering` / `pests` / `light` / `temperature` / `humidity` / `other` | Personalize tips & Weekly Pulse |
| 3 | **Sentiment** | `frustrated` / `anxious` / `curious` / `satisfied` / `proud` | Track satisfaction over time |
| 4 | **Plant Types** | Array of plant names/categories | Content & product recommendations |
| 5 | **Advice Helpful** | `yes` / `no` / `partially` | AI quality feedback loop |
| 6 | **Conversation Intent** | `diagnosis` / `prevention` / `learning` / `emergency` | Understand user needs |

### Detection Triggers

| Extraction | User Says | AI Infers |
|------------|-----------|-----------|
| Experience | "I've never grown anything" | `beginner` |
| Experience | "I've been gardening for years" | `expert` |
| Struggle | "I always overwater" / "leaves are yellow" | `watering` |
| Struggle | "Found bugs on my plant" | `pests` |
| Sentiment | "So frustrating!" / "Help!" | `frustrated` |
| Sentiment | "It worked! Thank you!" | `proud` |
| Intent | "Why is my plant dying?" | `diagnosis` |
| Intent | "How do I prevent root rot?" | `prevention` |
| Intent | "HELP it's wilting fast" | `emergency` |

### TypeScript Interface

```typescript
interface ExtractedFeedback {
  // Core 6 extractions
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  primaryStruggle?: 'watering' | 'pests' | 'light' | 'temperature' | 'humidity' | 'other';
  sentiment?: 'frustrated' | 'anxious' | 'curious' | 'satisfied' | 'proud';
  plantTypes?: string[];
  wasHelpful?: 'yes' | 'no' | 'partially';
  conversationIntent?: 'diagnosis' | 'prevention' | 'learning' | 'emergency';
  
  // Meta
  confidence: number;  // 0-1, only submit if > 0.7
  extractedAt: string; // ISO timestamp
}
```

### Survey Template (SurveyMonkey Dashboard)

Create a survey with these 6 questions:

| Question ID | Question Text | Answer Type |
|-------------|---------------|-------------|
| `exp_level` | "User's gardening experience" | Single choice: beginner/intermediate/expert |
| `struggle` | "Primary plant care struggle" | Single choice: watering/pests/light/temperature/humidity/other |
| `sentiment` | "Emotional state during conversation" | Single choice: frustrated/anxious/curious/satisfied/proud |
| `plants` | "Plant types discussed" | Open text |
| `helpful` | "Was AI advice helpful?" | Single choice: yes/no/partially |
| `intent` | "Conversation purpose" | Single choice: diagnosis/prevention/learning/emergency |

### Example User Questions (For Testing)

```text
1. "Why are my tomato leaves yellow?"
2. "I had aphids last summer"
3. "I've never grown anything"
4. "I've been gardening for years"
5. "I always overwater"
6. "Found bugs on my plant"
7. "So frustrating!"
8. "It worked! Thank you!"
9. "Why is my plant dying?"
10. "How do I prevent root rot?"
11. "HELP it's wilting fast"
```

### System Prompt Addition

```text
## SILENT FEEDBACK EXTRACTION

While helping users, naturally infer these 6 insights (DO NOT ask survey-style questions):

1. EXPERIENCE: Are they a beginner, intermediate, or expert gardener?
2. STRUGGLE: What's their main challenge? (watering, pests, light, temperature, humidity)
3. SENTIMENT: How are they feeling? (frustrated, anxious, curious, satisfied, proud)
4. PLANTS: What plants are they discussing?
5. HELPFUL: Did your advice seem to help them?
6. INTENT: Are they diagnosing a problem, preventing issues, learning, or in an emergency?

NATURAL FOLLOW-UPS (pick one if context allows):
- "Is this your first time growing [plant]?"
- "How long have you been dealing with this?"
- "Does that help clarify things?"

After EACH response, output a JSON extraction (only fields you're confident about):
{"experienceLevel": "...", "primaryStruggle": "...", "sentiment": "...", ...}
```

## SurveyMonkey Submission

```typescript
// lib/surveymonkey.ts
export async function submitMicroSurveyResponse(
  userId: string,
  feedback: ExtractedFeedback
): Promise<void> {
  if (feedback.confidence < 0.7) return;  // Skip low-confidence extractions

  await axios.post(
    `https://api.surveymonkey.com/v3/collectors/${process.env.SURVEYMONKEY_COLLECTOR_ID}/responses`,
    {
      custom_variables: { user_id: userId, source: 'ai_chat' },
      response_status: 'completed',
      pages: [{ id: PAGE_ID, questions: buildQuestions(feedback) }],
    },
    { headers: { Authorization: `Bearer ${process.env.SURVEYMONKEY_ACCESS_TOKEN}` } }
  );
}
```

## Natural Follow-Up Examples

| Context | Question | Extracted |
|---------|----------|-----------|
| Basic question | "First plant, or green thumb already?" | `experienceLevel` |
| Problem described | "How long dealing with this?" | `sentiment`, `painPoints` |
| After advice | "Does that make sense?" | `wasHelpful` |

---

# Feature 2: Weekly AI Insight Pulse

## How It Works

```
Sensor Data (7 days) → Aggregate Analysis → Gemini Summary → Notification + SMS
        ↓
"Your plants struggled with humidity (87% of alerts). Try misting!"
        ↓
User taps 👍/👎 → Recorded to SurveyMonkey
```

## Weekly Stats Schema

```typescript
interface WeeklyPlantStats {
  userId: string;
  weekStartDate: string;
  alerts: {
    total: number;
    byType: { temperature: number; humidity: number; soilMoisture: number; };
    criticalCount: number;
  };
  averageResponseTimeMinutes: number;
  healthTrend: 'improving' | 'stable' | 'declining';
}

interface WeeklyInsightPulse {
  stats: WeeklyPlantStats;
  summary: string;           // AI-generated message
  primaryIssue: string;      // "humidity" | "temperature" | etc.
  suggestions: string[];
  userReaction?: 'helpful' | 'not_helpful';
}
```

## Gemini Prompt

```typescript
const prompt = `
Generate a friendly weekly plant summary from this data:
${JSON.stringify(stats)}

Return JSON:
{
  "summary": "2-3 sentences, under 280 chars (SMS-friendly)",
  "primaryIssue": "temperature" | "humidity" | "soilMoisture" | "none",
  "suggestions": ["One actionable tip"],
  "encouragement": "Short positive note"
}

Tone: Friendly plant enthusiast. Use 1-2 emojis.
`;
```

## Example Outputs

**Humidity issues:**
> 🌿 Humidity challenged your plants this week (87% of alerts). Try misting tropicals each morning!

**User doing well:**
> 🎉 Stellar week! Zero critical alerts. Whatever you're doing, keep it up!

## API Routes

```typescript
// POST /api/weekly-pulse/generate
export async function POST(req: Request) {
  const { userId } = await req.json();
  const stats = await aggregateWeeklyStats(userId);
  const insight = await generateWithGemini(stats);
  
  // Deliver notifications
  await createInAppNotification(userId, insight);
  if (userPrefs.smsEnabled) await sendSMS(userId, insight.summary);
  
  return NextResponse.json({ success: true });
}

// POST /api/weekly-pulse/[pulseId]/reaction
export async function POST(req: Request, { params }) {
  const { reaction } = await req.json();  // 'helpful' | 'not_helpful'
  
  await updatePulseReaction(params.pulseId, reaction);
  await submitMicroSurveyResponse(userId, {
    wasHelpful: reaction === 'helpful',
    confidence: 1.0,
  });
}
```

## Notification UI

```
┌────────────────────────────────────────┐
│  📊 Your Weekly Plant Report           │
├────────────────────────────────────────┤
│  🌿 Humidity was your biggest         │
│     challenge (87% of alerts).        │
│                                        │
│  Was this helpful?  [ 👍 ]  [ 👎 ]     │
└────────────────────────────────────────┘
```

## User Settings

```typescript
interface NotificationSettings {
  weeklyPulseEnabled: boolean;
  weeklyPulseDay: 'sunday' | 'monday';
  smsWeeklyPulse: boolean;
}
```

---

## File Structure

```
/app/api
  /chat/route.ts                  # Add feedback extraction
  /weekly-pulse/generate/route.ts
  /weekly-pulse/[pulseId]/reaction/route.ts
/lib
  surveymonkey.ts                 # API client
  weekly-pulse.ts                 # Generation logic
/components
  WeeklyPulseCard.tsx
```

---

## Implementation Phases

### Phase 1: Setup
- [ ] Create SurveyMonkey account + survey template
- [ ] Add environment variables

### Phase 2: AI Chat Micro-Surveys
- [ ] Extend chat prompt with extraction guidelines
- [ ] Add extraction to chat response processing
- [ ] Implement `submitMicroSurveyResponse()`

### Phase 3: Weekly Pulse
- [ ] Create stats aggregation query
- [ ] Implement Gemini summary generation
- [ ] Create notification delivery
- [ ] Add reaction recording endpoint

### Phase 4: Analytics
- [ ] Use `GET /surveys/{id}/rollups` for helpfulness rates
- [ ] Use `GET /surveys/{id}/trends` for issue patterns

---

## Privacy

- Terms of Service must disclose conversation analysis
- Settings toggle to opt-out of analysis
- Never send PII to SurveyMonkey (sanitize before submission)
