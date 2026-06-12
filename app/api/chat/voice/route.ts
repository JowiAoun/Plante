/**
 * Voice Synthesis API Route
 * POST /api/chat/voice
 *
 * Demo mode: voice synthesis was disabled after the hackathon. The client
 * degrades gracefully to text-only when this returns 503.
 */

import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json(
        { error: 'Voice is resting, text response only', errorType: 'ELEVENLABS_QUOTA' },
        { status: 503 }
    );
}
