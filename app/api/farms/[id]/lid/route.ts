/**
 * Lid Control API Route
 * POST /api/farms/[id]/lid - Control the greenhouse lid
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: farmId } = await params;

    try {
        const { action } = await request.json();

        if (!action || !['open', 'close', 'toggle'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Use: open, close, or toggle' },
                { status: 400 }
            );
        }

        // Get Pi API URL from environment (same as sensors/camera)
        const piApiUrl = process.env.NEXT_PUBLIC_PI_API_URL;
        if (!piApiUrl) {
            return NextResponse.json(
                { error: 'Raspberry Pi API not configured' },
                { status: 503 }
            );
        }

        // Prepare headers
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Add API key if configured
        const apiKey = process.env.PI_API_KEY;
        if (apiKey) {
            headers['X-API-Key'] = apiKey;
        }

        // Call the hardware API
        const response = await fetch(`${piApiUrl}/lid/control`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ action }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                {
                    error: errorData.detail || 'Failed to control lid',
                    success: false
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            success: true,
            isOpen: data.is_open,
            angle: data.angle,
            message: data.message,
            farmId,
        });
    } catch (error) {
        console.error('[LidControl] Error:', error);
        return NextResponse.json(
            { error: 'Failed to control lid', success: false },
            { status: 500 }
        );
    }
}

/**
 * GET /api/farms/[id]/lid - Get current lid status
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: farmId } = await params;

    try {
        const piApiUrl = process.env.NEXT_PUBLIC_PI_API_URL;
        if (!piApiUrl) {
            return NextResponse.json(
                { error: 'Raspberry Pi API not configured', isOpen: false },
                { status: 503 }
            );
        }

        const headers: HeadersInit = {};
        const apiKey = process.env.PI_API_KEY;
        if (apiKey) {
            headers['X-API-Key'] = apiKey;
        }

        const response = await fetch(`${piApiUrl}/lid/status`, { headers });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to get lid status', isOpen: false },
                { status: response.status }
            );
        }

        const data = await response.json();

        return NextResponse.json({
            isOpen: data.is_open,
            angle: data.angle,
            farmId,
        });
    } catch (error) {
        console.error('[LidStatus] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get lid status', isOpen: false },
            { status: 500 }
        );
    }
}
