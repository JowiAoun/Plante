/**
 * SurveyMonkey API Client
 * Invisible feedback collection from AI chat conversations
 */

import { env } from '@/lib/env';
import type { ExtractedFeedback } from '@/types';

const SURVEYMONKEY_BASE_URL = 'https://api.surveymonkey.com/v3';

/**
 * Submit extracted feedback to SurveyMonkey
 * Only submits if confidence threshold is met (> 0.7)
 */
export async function submitMicroSurveyResponse(
    userId: string,
    feedback: ExtractedFeedback
): Promise<{ success: boolean; error?: string }> {
    // Skip if no access token configured
    if (!env.SURVEYMONKEY_ACCESS_TOKEN || !env.SURVEYMONKEY_COLLECTOR_ID) {
        console.log('[SurveyMonkey] API not configured, skipping submission');
        return { success: false, error: 'API not configured' };
    }

    // Skip low-confidence extractions (lowered threshold to prefer false positives)
    if (feedback.confidence < 0.5) {
        console.log(`[SurveyMonkey] Confidence too low (${feedback.confidence}), skipping`);
        return { success: false, error: 'Confidence below threshold' };
    }

    // Build survey response payload
    const payload = {
        custom_variables: {
            user_id: userId,
            source: 'ai_chat',
            timestamp: feedback.extractedAt,
        },
        response_status: 'completed',
        pages: buildPagesPayload(feedback),
    };

    try {
        const response = await fetch(
            `${SURVEYMONKEY_BASE_URL}/collectors/${env.SURVEYMONKEY_COLLECTOR_ID}/responses`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.SURVEYMONKEY_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[SurveyMonkey] API error:', response.status, errorText);
            return { success: false, error: `API error: ${response.status}` };
        }

        const data = await response.json();
        console.log('[SurveyMonkey] Response submitted:', data.id);
        return { success: true };
    } catch (error) {
        console.error('[SurveyMonkey] Submission failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Build the pages payload for SurveyMonkey API
 * Converts ExtractedFeedback to survey question format
 */
function buildPagesPayload(feedback: ExtractedFeedback): object[] {
    const questions: { id: string; answers: { text: string }[] }[] = [];

    // Only include fields that were extracted
    if (feedback.experienceLevel) {
        questions.push({
            id: 'exp_level',
            answers: [{ text: feedback.experienceLevel }],
        });
    }

    if (feedback.primaryStruggle) {
        questions.push({
            id: 'struggle',
            answers: [{ text: feedback.primaryStruggle }],
        });
    }

    if (feedback.sentiment) {
        questions.push({
            id: 'sentiment',
            answers: [{ text: feedback.sentiment }],
        });
    }

    if (feedback.plantTypes && feedback.plantTypes.length > 0) {
        questions.push({
            id: 'plants',
            answers: [{ text: feedback.plantTypes.join(', ') }],
        });
    }

    if (feedback.wasHelpful) {
        questions.push({
            id: 'helpful',
            answers: [{ text: feedback.wasHelpful }],
        });
    }

    if (feedback.conversationIntent) {
        questions.push({
            id: 'intent',
            answers: [{ text: feedback.conversationIntent }],
        });
    }

    return [{ id: 'main_page', questions }];
}

/**
 * Parse Gemini extraction response into ExtractedFeedback
 * Handles malformed JSON gracefully
 */
export function parseExtractionResponse(text: string): ExtractedFeedback | null {
    try {
        // Strip markdown code blocks if present (```json ... ```)
        let cleanedText = text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        // Find JSON object in the response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('[SurveyMonkey] No JSON found in extraction response');
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log('[SurveyMonkey] Parsed extraction:', JSON.stringify(parsed));

        // Validate and map fields
        // Default confidence to 0.9 since we want to capture most extractions
        const feedback: ExtractedFeedback = {
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
            extractedAt: new Date().toISOString(),
        };

        // Map each field with validation
        if (['beginner', 'intermediate', 'expert'].includes(parsed.experienceLevel)) {
            feedback.experienceLevel = parsed.experienceLevel;
        }

        if (['watering', 'pests', 'light', 'temperature', 'humidity', 'other'].includes(parsed.primaryStruggle)) {
            feedback.primaryStruggle = parsed.primaryStruggle;
        }

        if (['frustrated', 'anxious', 'curious', 'satisfied', 'proud'].includes(parsed.sentiment)) {
            feedback.sentiment = parsed.sentiment;
        }

        if (Array.isArray(parsed.plantTypes)) {
            feedback.plantTypes = parsed.plantTypes.filter((p: unknown) => typeof p === 'string');
        }

        if (['yes', 'no', 'partially'].includes(parsed.wasHelpful)) {
            feedback.wasHelpful = parsed.wasHelpful;
        }

        if (['diagnosis', 'prevention', 'learning', 'emergency'].includes(parsed.conversationIntent)) {
            feedback.conversationIntent = parsed.conversationIntent;
        }

        return feedback;
    } catch (error) {
        console.error('[SurveyMonkey] Failed to parse extraction:', error);
        return null;
    }
}
