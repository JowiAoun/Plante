/**
 * Farm Detail API Route
 * GET /api/farms/[id] - Get farm details
 * PATCH /api/farms/[id] - Update farm
 * DELETE /api/farms/[id] - Delete farm
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFarm, updateFarm, deleteFarm } from '@/lib/demo-store';
import { mapFarmDetail } from '@/lib/farm-serializers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/farms/[id]
 * Get farm details (owner only)
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

    return NextResponse.json(mapFarmDetail(farm));
  } catch (error) {
    console.error('Error fetching farm:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/farms/[id]
 * Update farm details (owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const result = updateFarm(id, session.user.id, body);

    if (!result) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: result.id,
      name: result.name,
      species: result.species,
      status: result.status,
      updatedAt: result.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating farm:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/farms/[id]
 * Delete a farm (owner only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const deleted = deleteFarm(id, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting farm:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
