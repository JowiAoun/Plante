/**
 * Farm Photo API Route
 * POST /api/farms/[id]/photo - "Capture" a photo (demo: static asset)
 * GET /api/farms/[id]/photo - Get latest photo info
 *
 * Demo mode: the Pi camera is gone, so capture returns a bundled
 * pixel-art plant photo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFarm } from '@/lib/demo-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const DEMO_PHOTO_URL = '/images/demo-plant.png';

/**
 * POST /api/farms/[id]/photo
 * Capture a new photo (demo asset)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const farm = getFarm(id, session.user.id);

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      photoUrl: DEMO_PHOTO_URL,
      photo: {
        filename: 'demo-plant.png',
        filepath: DEMO_PHOTO_URL,
        timestamp: new Date().toISOString(),
      },
      message: 'Photo captured successfully',
    });
  } catch (error) {
    console.error('Error capturing photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/farms/[id]/photo
 * Get the latest photo info
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const farm = getFarm(id, session.user.id);

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({
      source: 'demo',
      photoUrl: DEMO_PHOTO_URL,
      photo: {
        filename: 'demo-plant.png',
        filepath: DEMO_PHOTO_URL,
        timestamp: farm.lastSeen.toISOString(),
      },
      thumbnailUrl: farm.thumbnailUrl || null,
    });
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
