/**
 * Chat API Route
 * POST /api/chat - Send message to the Plante assistant
 *
 * Demo mode: the AI was disabled after the hackathon, so replies come from
 * a canned keyword engine that uses the live demo-store sensor values.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listFarms } from '@/lib/demo-store';
import { generateDemoReply } from '@/lib/demo-chat';
import type { ChatRequest } from '@/types';

/** Small artificial delay so the typing indicator feels natural. */
function thinkingDelay(): Promise<void> {
    const ms = 300 + Math.random() * 500;
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /api/chat
 * Send a message to the assistant
 */
export async function POST(request: NextRequest) {
    try {
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

        const farms = listFarms(session.user.id);

        const { response, suggestedActions } = generateDemoReply(body.message, {
            user: {
                username: session.user.username || 'farmer',
                displayName: session.user.displayName || session.user.name || 'farmer',
                level: session.user.level ?? 1,
                xp: session.user.xp ?? 0,
            },
            farms,
        });

        await thinkingDelay();

        return NextResponse.json({
            response,
            suggestedActions,
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Connection issues, please try again', errorType: 'NETWORK_ERROR' },
            { status: 500 }
        );
    }
}
