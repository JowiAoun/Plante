/**
 * Farm Detail API Route
 * GET /api/farms/[id] - Get farm details
 * PATCH /api/farms/[id] - Update farm
 * DELETE /api/farms/[id] - Delete farm
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getFarmsCollection } from '@/lib/db/collections';

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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 });
    }

    const farms = await getFarmsCollection();
    const farm = await farms.findOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(session.user.id),
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: farm._id.toString(),
      name: farm.name,
      species: farm.species,
      status: farm.status,
      thumbnailUrl: farm.thumbnailUrl,
      sensors: {
        temp: {
          value: farm.sensors.temperature.value,
          unit: farm.sensors.temperature.unit === 'celsius' ? '°C' : '°F',
          trend: farm.sensors.temperature.trend,
          updatedAt: farm.sensors.temperature.updatedAt.toISOString(),
        },
        humidity: {
          value: farm.sensors.humidity.value,
          unit: '%',
          trend: farm.sensors.humidity.trend,
          updatedAt: farm.sensors.humidity.updatedAt.toISOString(),
        },
        soil: {
          value: farm.sensors.soilMoisture.value,
          unit: '%',
          trend: farm.sensors.soilMoisture.trend,
          updatedAt: farm.sensors.soilMoisture.updatedAt.toISOString(),
        },
        light: farm.sensors.light
          ? {
              value: farm.sensors.light.value,
              unit: 'lux',
              trend: farm.sensors.light.trend,
              updatedAt: farm.sensors.light.updatedAt.toISOString(),
            }
          : undefined,
      },
      thresholds: farm.thresholds,
      deviceId: farm.deviceId,
      lastSeen: farm.lastSeen.toISOString(),
      createdAt: farm.createdAt.toISOString(),
      updatedAt: farm.updatedAt.toISOString(),
    });
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedFields = ['name', 'species', 'thumbnailUrl', 'thresholds', 'deviceId'];
    const updateFields: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    updateFields.updatedAt = new Date();

    const farms = await getFarmsCollection();
    const result = await farms.findOneAndUpdate(
      {
        _id: new ObjectId(id),
        ownerId: new ObjectId(session.user.id),
      },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: result._id.toString(),
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

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 });
    }

    const farms = await getFarmsCollection();
    const result = await farms.deleteOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(session.user.id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting farm:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
