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

    // Build survey response payload (no custom_variables - they need pre-definition in SM)
    const payload = {
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

// Real question IDs and choice IDs from SurveyMonkey survey
const SURVEY_MAPPING = {
    pageId: '72733435',
    questions: {
        experienceLevel: {
            id: '275144457',
            choices: {
                beginner: '1930988898',
                intermediate: '1930988899',
                expert: '1930988900',
            },
        },
        primaryStruggle: {
            id: '275144472',
            choices: {
                watering: '1930988968',
                pests: '1930988969',
                light: '1930988970',
                temperature: '1930988971',
                humidity: '1930988972',
                other: '1930988973',
            },
        },
        sentiment: {
            id: '275144542',
            choices: {
                frustrated: '1930989253',
                anxious: '1930989254',
                curious: '1930989255',
                satisfied: '1930989256',
                proud: '1930989257',
            },
        },
        plantTypes: {
            id: '275144552', // Open text field
        },
        wasHelpful: {
            id: '275144582',
            choices: {
                yes: '1930989565',
                no: '1930989566',
                partially: '1930989567',
            },
        },
        conversationIntent: {
            id: '275144704',
            choices: {
                diagnosis: '1930990171',
                prevention: '1930990172',
                learning: '1930990173',
                emergency: '1930990174',
            },
        },
    },
};

/**
 * Build the pages payload for SurveyMonkey API
 * Uses actual question IDs and choice IDs for proper API submission
 */
function buildPagesPayload(feedback: ExtractedFeedback): object[] {
    const questions: { id: string; answers: { choice_id?: string; text?: string }[] }[] = [];

    // Experience level - single choice
    if (feedback.experienceLevel) {
        const choiceId = SURVEY_MAPPING.questions.experienceLevel.choices[feedback.experienceLevel];
        if (choiceId) {
            questions.push({
                id: SURVEY_MAPPING.questions.experienceLevel.id,
                answers: [{ choice_id: choiceId }],
            });
        }
    }

    // Primary struggle - single choice
    if (feedback.primaryStruggle) {
        const choiceId = SURVEY_MAPPING.questions.primaryStruggle.choices[feedback.primaryStruggle];
        if (choiceId) {
            questions.push({
                id: SURVEY_MAPPING.questions.primaryStruggle.id,
                answers: [{ choice_id: choiceId }],
            });
        }
    }

    // Sentiment - single choice
    if (feedback.sentiment) {
        const choiceId = SURVEY_MAPPING.questions.sentiment.choices[feedback.sentiment];
        if (choiceId) {
            questions.push({
                id: SURVEY_MAPPING.questions.sentiment.id,
                answers: [{ choice_id: choiceId }],
            });
        }
    }

    // Plant types - open text
    if (feedback.plantTypes && feedback.plantTypes.length > 0) {
        questions.push({
            id: SURVEY_MAPPING.questions.plantTypes.id,
            answers: [{ text: feedback.plantTypes.join(', ') }],
        });
    }

    // Was helpful - single choice
    if (feedback.wasHelpful) {
        const choiceId = SURVEY_MAPPING.questions.wasHelpful.choices[feedback.wasHelpful];
        if (choiceId) {
            questions.push({
                id: SURVEY_MAPPING.questions.wasHelpful.id,
                answers: [{ choice_id: choiceId }],
            });
        }
    }

    // Conversation intent - single choice
    if (feedback.conversationIntent) {
        const choiceId = SURVEY_MAPPING.questions.conversationIntent.choices[feedback.conversationIntent];
        if (choiceId) {
            questions.push({
                id: SURVEY_MAPPING.questions.conversationIntent.id,
                answers: [{ choice_id: choiceId }],
            });
        }
    }

    return [{ id: SURVEY_MAPPING.pageId, questions }];
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
