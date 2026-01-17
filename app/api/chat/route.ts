/**
 * Chat API Route
 * POST /api/chat - Send message to Gemini AI and get response
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { getUsersCollection, getFarmsCollection, getAchievementsCollection } from '@/lib/db/collections';
import { ObjectId } from 'mongodb';
import type { ChatMessage, ChatRequest } from '@/types';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// System prompt for Plante AI assistant
const SYSTEM_PROMPT = `You are Plante, a friendly and knowledgeable plant care assistant. You help users take care of their plants and farms.

GUIDELINES:
1. Be friendly, encouraging, and use plant/gardening metaphors
2. Provide actionable, specific advice based on sensor data
3. Celebrate user achievements and progress
4. If a plant is in critical status, prioritize addressing that
5. Keep responses concise but helpful (2-3 sentences typical)
6. Use emojis sparingly for personality 🌱
7. NEVER use markdown formatting like **bold** or *italics* - respond in plain text only
8. The user's "username" is their login name, and "display name" is what they want to be called - these are different values`;

/**
 * Build context string from user data
 */
function buildUserContext(
    user: { username: string; displayName: string; level: number; xp: number },
    farms: unknown[],
    achievements: unknown[]
): string {
    // Build farms summary - note that Kalanchoe Farm is the only real IoT-connected farm
    const farmsSummary = farms.length > 0
        ? farms.map((farm: unknown) => {
            const f = farm as { name: string; status: string; sensors?: { temperature?: { value: number }; humidity?: { value: number }; soilMoisture?: { value: number } } };
            const isRealFarm = f.name.toLowerCase().includes('kalanchoe');
            return `- ${f.name}${isRealFarm ? ' (REAL IoT-connected farm)' : ''}: ${f.status} status (Temp: ${f.sensors?.temperature?.value ?? 'N/A'}°C, Humidity: ${f.sensors?.humidity?.value ?? 'N/A'}%, Soil: ${f.sensors?.soilMoisture?.value ?? 'N/A'}%)`;
        }).join('\n')
        : 'No farms registered yet.';

    const achievementsList = achievements.length > 0
        ? achievements.map((a: unknown) => `- ${(a as { title: string }).title}`).join('\n')
        : 'No achievements unlocked yet.';

    return `
USER CONTEXT:
- Username (login name): ${user.username}
- Display Name (what to call them): ${user.displayName}
- Level: ${user.level} (XP: ${user.xp})
- Number of farms: ${farms.length}

FARM STATUS:
${farmsSummary}

ACHIEVEMENTS:
${achievementsList}`;
}

/**
 * Convert conversation history to Gemini format
 */
function convertHistory(history: ChatMessage[]): { role: 'user' | 'model'; parts: { text: string }[] }[] {
    return history
        .filter(msg => !msg.isLoading)
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
            parts: [{ text: msg.content }],
        }));
}

/**
 * POST /api/chat
 * Send a message to the AI assistant
 */
export async function POST(request: NextRequest) {
    try {
        // Check for API key
        if (!env.GEMINI_API_KEY) {
            return NextResponse.json(
                { error: 'Gemini API key not configured' },
                { status: 500 }
            );
        }

        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request
        const body: ChatRequest = await request.json();
        if (!body.message || typeof body.message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Fetch user context
        const usersCollection = await getUsersCollection();
        const farmsCollection = await getFarmsCollection();
        const achievementsCollection = await getAchievementsCollection();

        const [user, userFarms, kalanchoeFarm, achievements] = await Promise.all([
            usersCollection.findOne({ _id: new ObjectId(session.user.id) }),
            farmsCollection.find({ ownerId: new ObjectId(session.user.id) }).toArray(),
            farmsCollection.findOne({ deviceId: 'kalanchoe-farm' }), // Shared real IoT farm
            achievementsCollection.find({ unlockedBy: session.user.id }).toArray(),
        ]);

        // Combine user farms with the shared Kalanchoe farm
        const farms = [...userFarms];
        if (kalanchoeFarm) {
            // Add Kalanchoe farm if not already in user's farms
            const hasKalanchoe = farms.some(f => f.deviceId === 'kalanchoe-farm');
            if (!hasKalanchoe) {
                farms.push(kalanchoeFarm);
            }
        }

        // Build context
        const userContext = buildUserContext(
            {
                username: user?.username || session.user.username || 'unknown',
                displayName: user?.displayName || session.user.name || 'User',
                level: user?.level || 1,
                xp: user?.xp || 0,
            },
            farms,
            achievements
        );

        // Initialize chat
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 512,
            },
        });

        // Build conversation
        const systemMessage = `${SYSTEM_PROMPT}\n\n${userContext}`;
        const history = body.conversationHistory
            ? convertHistory(body.conversationHistory.slice(-20)) // Limit to last 20 messages
            : [];

        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: 'Hello, I need help with my plants.' }] },
                { role: 'model', parts: [{ text: `Hello! I'm Plante, your plant care assistant 🌱 I'm here to help you with all your gardening needs. ${userContext ? "I can see your farms and achievements - let me know how I can help!" : "What can I help you with today?"}` }] },
                ...history,
            ],
        });

        // Send message
        const result = await chat.sendMessage(`${systemMessage}\n\nUser message: ${body.message}`);
        const response = result.response.text();

        // Generate suggested actions based on response
        const suggestedActions: string[] = [];
        if (response.toLowerCase().includes('water')) {
            suggestedActions.push('How often should I water?');
        }
        if (response.toLowerCase().includes('temperature') || response.toLowerCase().includes('temp')) {
            suggestedActions.push('What temperature is best?');
        }
        if (farms.some((f) => f.status === 'critical' || f.status === 'warning')) {
            suggestedActions.push('Check my farm status');
        }

        // Return response
        return NextResponse.json({
            response,
            suggestedActions: suggestedActions.slice(0, 3),
        });
    } catch (error) {
        console.error('Chat API error:', error);

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message.includes('quota') || error.message.includes('rate')) {
                return NextResponse.json(
                    { error: 'AI is thinking too hard, please wait a moment', errorType: 'GEMINI_RATE_LIMIT' },
                    { status: 429 }
                );
            }
            if (error.message.includes('context') || error.message.includes('token')) {
                return NextResponse.json(
                    { error: 'Starting a fresh conversation', errorType: 'CONTEXT_TOO_LONG' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Connection issues, please try again', errorType: 'NETWORK_ERROR' },
            { status: 500 }
        );
    }
}
