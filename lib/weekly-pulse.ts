/**
 * Weekly AI Insight Pulse
 * Aggregates sensor data and generates AI-powered weekly summaries
 */

import { env } from '@/lib/env';
import type { WeeklyPlantStats, WeeklyInsightPulse, ExtractedFeedback } from '@/types';
import { submitMicroSurveyResponse } from './surveymonkey';

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
    error?: {
        message: string;
    };
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(prompt: string): Promise<string> {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': env.NEXTAUTH_URL,
            'X-Title': 'Plante',
        },
        body: JSON.stringify({
            model: env.OPENROUTER_MODEL,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 512,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.choices[0]?.message?.content || '';
}

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

    const text = await callOpenRouter(prompt);

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
 * Queries real farm data from MongoDB
 */
export async function aggregateWeeklyStats(userId: string): Promise<WeeklyPlantStats> {
    const { getFarmsCollection } = await import('@/lib/db/collections');
    const { ObjectId } = await import('mongodb');

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
        const farmsCollection = await getFarmsCollection();
        const farms = await farmsCollection.find({
            ownerId: new ObjectId(userId)
        }).toArray();

        if (farms.length === 0) {
            // No farms, return empty stats
            return {
                userId,
                weekStartDate: weekAgo.toISOString(),
                weekEndDate: now.toISOString(),
                alerts: {
                    total: 0,
                    byType: { temperature: 0, humidity: 0, soilMoisture: 0 },
                    criticalCount: 0,
                },
                averageResponseTimeMinutes: 0,
                healthTrend: 'stable',
            };
        }

        // Calculate alerts based on current sensor readings vs thresholds
        let tempAlerts = 0;
        let humidityAlerts = 0;
        let soilAlerts = 0;
        let criticalCount = 0;
        let warningCount = 0;
        let healthyCount = 0;

        for (const farm of farms) {
            const { sensors, thresholds, status } = farm;

            // Count status for health trend
            if (status === 'critical') criticalCount++;
            else if (status === 'warning') warningCount++;
            else healthyCount++;

            // Check temperature alerts
            if (sensors.temperature && thresholds.temperature) {
                const temp = sensors.temperature.value;
                if (temp < thresholds.temperature.min || temp > thresholds.temperature.max) {
                    tempAlerts++;
                }
            }

            // Check humidity alerts
            if (sensors.humidity && thresholds.humidity) {
                const humidity = sensors.humidity.value;
                if (humidity < thresholds.humidity.min || humidity > thresholds.humidity.max) {
                    humidityAlerts++;
                }
            }

            // Check soil moisture alerts
            if (sensors.soilMoisture && thresholds.soilMoisture) {
                const soil = sensors.soilMoisture.value;
                if (soil < thresholds.soilMoisture.min || soil > thresholds.soilMoisture.max) {
                    soilAlerts++;
                }
            }
        }

        const totalAlerts = tempAlerts + humidityAlerts + soilAlerts;

        // Determine health trend based on farm statuses
        let healthTrend: 'improving' | 'stable' | 'declining';
        if (criticalCount > 0 || warningCount > healthyCount) {
            healthTrend = 'declining';
        } else if (healthyCount > warningCount && criticalCount === 0) {
            healthTrend = 'improving';
        } else {
            healthTrend = 'stable';
        }

        return {
            userId,
            weekStartDate: weekAgo.toISOString(),
            weekEndDate: now.toISOString(),
            alerts: {
                total: totalAlerts,
                byType: {
                    temperature: tempAlerts,
                    humidity: humidityAlerts,
                    soilMoisture: soilAlerts,
                },
                criticalCount,
            },
            averageResponseTimeMinutes: 30, // Placeholder - would need alert history
            healthTrend,
        };
    } catch (error) {
        console.error('[WeeklyPulse] Failed to aggregate stats:', error);
        // Return empty stats on error
        return {
            userId,
            weekStartDate: weekAgo.toISOString(),
            weekEndDate: now.toISOString(),
            alerts: {
                total: 0,
                byType: { temperature: 0, humidity: 0, soilMoisture: 0 },
                criticalCount: 0,
            },
            averageResponseTimeMinutes: 0,
            healthTrend: 'stable',
        };
    }
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
