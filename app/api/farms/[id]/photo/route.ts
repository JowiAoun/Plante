/**
 * Farm Photo API Route
 * POST /api/farms/[id]/photo - Request photo from Pi camera
 * GET /api/farms/[id]/photo - Get latest photo info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getFarmsCollection } from '@/lib/db/collections';
import { getPiClient, PiApiError } from '@/lib/pi-client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/farms/[id]/photo
 * Capture a new photo from the Pi camera
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 });
    }

    // Verify farm ownership
    const farms = await getFarmsCollection();
    const farm = await farms.findOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(session.user.id),
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const piClient = getPiClient();

    if (!piClient.isConfigured()) {
      return NextResponse.json(
        { error: 'Pi API not configured' },
        { status: 503 }
      );
    }

    try {
      const photoResult = await piClient.capturePhoto();

      if (!photoResult.success) {
        return NextResponse.json(
          { error: photoResult.error || 'Failed to capture photo' },
          { status: 500 }
        );
      }

      // Optionally update farm thumbnail
      // For now, just return the photo info
      // In the future, we could upload to cloud storage and update thumbnailUrl

      return NextResponse.json({
        success: true,
        photo: {
          filename: photoResult.filename,
          filepath: photoResult.filepath,
          timestamp: photoResult.timestamp,
        },
        message: 'Photo captured successfully',
      });
    } catch (error) {
      if (error instanceof PiApiError) {
        return NextResponse.json(
          { error: `Pi API error: ${error.message}` },
          { status: 503 }
        );
      }
      throw error;
    }
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 });
    }

    // Verify farm ownership
    const farms = await getFarmsCollection();
    const farm = await farms.findOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(session.user.id),
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    const piClient = getPiClient();

    if (!piClient.isConfigured()) {
      // Return farm thumbnail if Pi not configured
      return NextResponse.json({
        source: 'database',
        thumbnailUrl: farm.thumbnailUrl || null,
        message: 'Pi API not configured',
      });
    }

    try {
      const photoResult = await piClient.getLatestPhoto();

      if (!photoResult.success) {
        return NextResponse.json({
          source: 'database',
          thumbnailUrl: farm.thumbnailUrl || null,
          message: photoResult.error || 'No photos available from Pi',
        });
      }

      return NextResponse.json({
        source: 'pi',
        photo: {
          filename: photoResult.filename,
          filepath: photoResult.filepath,
          timestamp: photoResult.timestamp,
        },
        thumbnailUrl: farm.thumbnailUrl || null,
      });
    } catch (error) {
      if (error instanceof PiApiError) {
        return NextResponse.json({
          source: 'database',
          thumbnailUrl: farm.thumbnailUrl || null,
          message: `Pi API unavailable: ${error.message}`,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
