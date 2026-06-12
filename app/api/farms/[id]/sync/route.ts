/**
 * Farm Sync API Route
 * POST /api/farms/[id]/sync - Refresh farm sensor readings
 *
 * Demo mode: readings are simulated in the demo store (small bounded
 * drift around each farm's baseline), then trend and status are
 * recomputed exactly like the old Raspberry Pi sync did.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { syncFarm } from '@/lib/demo-store';
import { mapFarmSync } from '@/lib/farm-serializers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/farms/[id]/sync
 * Sync farm sensors (simulated readings)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const farm = syncFarm(id, session.user.id);

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      farm: mapFarmSync(farm),
      piStatus: 'ok',
      piErrors: [],
    });
  } catch (error) {
    console.error('Error syncing farm:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
