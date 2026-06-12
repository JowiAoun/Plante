/**
 * Farms List API Route
 * GET /api/farms - List user's farms
 * POST /api/farms - Create new farm
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listFarms, createFarm } from '@/lib/demo-store';
import { mapFarmSummary } from '@/lib/farm-serializers';

/**
 * GET /api/farms
 * List all farms for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userFarms = listFarms(session.user.id);

    return NextResponse.json(userFarms.map(mapFarmSummary));
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/farms
 * Create a new farm (in-memory; demo data resets periodically)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Farm name is required' }, { status: 400 });
    }

    const newFarm = createFarm(session.user.id, {
      name: body.name,
      species: body.species,
      thumbnailUrl: body.thumbnailUrl,
      deviceId: body.deviceId,
    });

    return NextResponse.json(
      {
        id: newFarm.id,
        name: newFarm.name,
        species: newFarm.species,
        status: newFarm.status,
        createdAt: newFarm.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating farm:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
