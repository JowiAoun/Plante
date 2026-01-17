/**
 * Voice Synthesis API Route
 * POST /api/chat/voice - Convert text to speech using ElevenLabs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ElevenLabsClient } from 'elevenlabs';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

// Initialize ElevenLabs client
const getElevenLabsClient = () => {
    if (!env.ELEVENLABS_API_KEY) {
        return null;
    }
    return new ElevenLabsClient({
        apiKey: env.ELEVENLABS_API_KEY,
    });
};

/**
 * POST /api/chat/voice
 * Convert text to speech
 */
export async function POST(request: NextRequest) {
    try {
        // Check for API key
        const client = getElevenLabsClient();
        if (!client) {
            return NextResponse.json(
                { error: 'Voice is resting, text response only', errorType: 'ELEVENLABS_QUOTA' },
                { status: 503 }
            );
        }

        // Authenticate user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request
        const body = await request.json();
        if (!body.text || typeof body.text !== 'string') {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Limit text length to preserve quota
        const text = body.text.slice(0, 500);

        // Generate audio
        const audioStream = await client.textToSpeech.convert(
            env.ELEVENLABS_VOICE_ID,
            {
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                },
            }
        );

        // Convert stream to buffer
        const chunks: Uint8Array[] = [];
        for await (const chunk of audioStream) {
            chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);

        // Return as audio response
        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length.toString(),
                'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error('Voice API error:', error);

        // Handle quota errors
        if (error instanceof Error && error.message.includes('quota')) {
            return NextResponse.json(
                { error: 'Voice is resting, text response only', errorType: 'ELEVENLABS_QUOTA' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: 'Voice synthesis failed', errorType: 'NETWORK_ERROR' },
            { status: 500 }
        );
    }
}
