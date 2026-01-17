/**
 * Farms List API Route
 * GET /api/farms - List user's farms
 * POST /api/farms - Create new farm
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getFarmsCollection } from '@/lib/db/collections';
import type { DbFarm } from '@/lib/db/types';

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

    const farms = await getFarmsCollection();
    const userFarms = await farms
      .find({ ownerId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      userFarms.map((farm) => ({
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
          },
          humidity: {
            value: farm.sensors.humidity.value,
            unit: '%',
            trend: farm.sensors.humidity.trend,
          },
          soil: {
            value: farm.sensors.soilMoisture.value,
            unit: '%',
            trend: farm.sensors.soilMoisture.trend,
          },
        },
        lastSeen: farm.lastSeen.toISOString(),
        createdAt: farm.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching farms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/farms
 * Create a new farm
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

    const now = new Date();
    const defaultSensorReading = {
      value: 0,
      trend: 'stable' as const,
      updatedAt: now,
    };

    const newFarm: Omit<DbFarm, '_id'> = {
      ownerId: new ObjectId(session.user.id),
      name: body.name.trim(),
      species: body.species || undefined,
      thumbnailUrl: body.thumbnailUrl || undefined,
      status: 'healthy',
      sensors: {
        temperature: { ...defaultSensorReading, unit: 'celsius' },
        humidity: { ...defaultSensorReading, unit: 'percent' },
        soilMoisture: { ...defaultSensorReading, unit: 'percent' },
      },
      thresholds: {
        temperature: { min: 15, max: 30 },
        humidity: { min: 40, max: 80 },
        soilMoisture: { min: 30, max: 70 },
        light: { min: 200, max: 10000 },
      },
      deviceId: body.deviceId || undefined,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    };

    const farms = await getFarmsCollection();
    const result = await farms.insertOne(newFarm as DbFarm);

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
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
