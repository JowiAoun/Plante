/**
 * Farm Live Sensors API Route
 * GET /api/farms/[id]/sensors/live - Get current sensor readings
 *
 * Demo mode: readings come straight from the demo store.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFarm } from '@/lib/demo-store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/farms/[id]/sensors/live
 * Get the farm's current sensor readings
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
      timestamp: farm.lastSeen.toISOString(),
      sensors: {
        temperature: {
          value: farm.sensors.temperature.value,
          unit: farm.sensors.temperature.unit,
        },
        humidity: {
          value: farm.sensors.humidity.value,
          unit: farm.sensors.humidity.unit,
        },
        light: farm.sensors.light
          ? {
              value: farm.sensors.light.value,
              unit: farm.sensors.light.unit,
            }
          : null,
        soil_moisture: {
          value: farm.sensors.soilMoisture.value,
          unit: farm.sensors.soilMoisture.unit,
        },
      },
      status: 'ok',
      errors: [],
    });
  } catch (error) {
    console.error('Error fetching live sensors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
