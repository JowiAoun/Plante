/**
 * Weekly AI Insight Pulse
 * Aggregates sensor data and generates AI-powered weekly summaries
 */

import { env } from '@/lib/env';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { WeeklyPlantStats, WeeklyInsightPulse, ExtractedFeedback } from '@/types';
import { submitMicroSurveyResponse } from './surveymonkey';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * Generate a weekly insight pulse for a user
 */
export async function generateWeeklyInsight(
    stats: WeeklyPlantStats
): Promise<Omit<WeeklyInsightPulse, 'id' | 'userId' | 'createdAt' | 'userReaction'>> {
    const prompt = `Generate a friendly weekly plant summary from this data:
${JSON.stringify(stats, null, 2)}

Return JSON only (no markdown, no explanation):
{
  "summary": "2-3 sentences, under 280 chars (SMS-friendly)",
  "primaryIssue": "temperature" | "humidity" | "soilMoisture" | "none",
  "suggestions": ["One actionable tip"],
  "encouragement": "Short positive note"
}

Tone: Friendly plant enthusiast. Use 1-2 emojis. Focus on the most common alert type.`;

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
        },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse weekly insight response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
        stats,
        summary: parsed.summary || 'Check on your plants this week!',
        primaryIssue: parsed.primaryIssue || 'none',
        suggestions: parsed.suggestions || [],
        encouragement: parsed.encouragement || 'Keep growing!',
    };
}

/**
 * Aggregate weekly stats from sensor/alert data
 * This is a placeholder - in production, query from MongoDB
 */
export async function aggregateWeeklyStats(userId: string): Promise<WeeklyPlantStats> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // TODO: Replace with actual MongoDB aggregation query
    // For hackathon demo, return mock data that showcases the feature
    return {
        userId,
        weekStartDate: weekAgo.toISOString(),
        weekEndDate: now.toISOString(),
        alerts: {
            total: 12,
            byType: {
                temperature: 2,
                humidity: 8,
                soilMoisture: 2,
            },
            criticalCount: 1,
        },
        averageResponseTimeMinutes: 45,
        healthTrend: 'stable',
    };
}

/**
 * Record user reaction to a weekly pulse
 */
export async function recordPulseReaction(
    pulseId: string,
    userId: string,
    reaction: 'helpful' | 'not_helpful'
): Promise<void> {
    // Submit reaction as feedback to SurveyMonkey
    const feedback: ExtractedFeedback = {
        wasHelpful: reaction === 'helpful' ? 'yes' : 'no',
        confidence: 1.0, // Direct user input
        extractedAt: new Date().toISOString(),
    };

    await submitMicroSurveyResponse(userId, feedback);

    // TODO: Also store in MongoDB for local analytics
    console.log(`[WeeklyPulse] Recorded reaction for pulse ${pulseId}: ${reaction}`);
}

/**
 * Determine the primary issue from alert breakdown
 */
export function getPrimaryIssue(
    byType: { temperature: number; humidity: number; soilMoisture: number }
): 'temperature' | 'humidity' | 'soilMoisture' | 'none' {
    const max = Math.max(byType.temperature, byType.humidity, byType.soilMoisture);
    if (max === 0) return 'none';
    if (byType.humidity === max) return 'humidity';
    if (byType.temperature === max) return 'temperature';
    return 'soilMoisture';
}
