/**
 * Farm Live Sensors API Route
 * GET /api/farms/[id]/sensors/live - Get live sensor readings from Pi
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
 * GET /api/farms/[id]/sensors/live
 * Get live sensor readings directly from Pi (without updating database)
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

    // Check if Pi API is configured
    const piClient = getPiClient();

    if (!piClient.isConfigured()) {
      // Return cached data from database if Pi not configured
      return NextResponse.json({
        source: 'cache',
        timestamp: farm.lastSeen.toISOString(),
        sensors: {
          temperature: farm.sensors.temperature
            ? {
                value: farm.sensors.temperature.value,
                unit: farm.sensors.temperature.unit,
              }
            : null,
          humidity: farm.sensors.humidity
            ? {
                value: farm.sensors.humidity.value,
                unit: farm.sensors.humidity.unit,
              }
            : null,
          light: farm.sensors.light
            ? {
                value: farm.sensors.light.value,
                unit: farm.sensors.light.unit,
              }
            : null,
          soil_moisture: farm.sensors.soilMoisture
            ? {
                value: farm.sensors.soilMoisture.value,
                unit: farm.sensors.soilMoisture.unit,
              }
            : null,
        },
        status: 'cached',
        message: 'Pi API not configured, returning cached data',
      });
    }

    // Fetch live data from Pi
    try {
      const piData = await piClient.getSensors(true); // Use cache for faster response

      return NextResponse.json({
        source: 'live',
        timestamp: piData.timestamp,
        sensors: {
          temperature: piData.temperature,
          humidity: piData.humidity,
          light: piData.light,
          soil_moisture: piData.soil_moisture,
        },
        status: piData.status,
        errors: piData.errors,
      });
    } catch (error) {
      if (error instanceof PiApiError) {
        // Return cached data on Pi error
        return NextResponse.json({
          source: 'cache',
          timestamp: farm.lastSeen.toISOString(),
          sensors: {
            temperature: farm.sensors.temperature
              ? {
                  value: farm.sensors.temperature.value,
                  unit: farm.sensors.temperature.unit,
                }
              : null,
            humidity: farm.sensors.humidity
              ? {
                  value: farm.sensors.humidity.value,
                  unit: farm.sensors.humidity.unit,
                }
              : null,
            light: farm.sensors.light
              ? {
                  value: farm.sensors.light.value,
                  unit: farm.sensors.light.unit,
                }
              : null,
            soil_moisture: farm.sensors.soilMoisture
              ? {
                  value: farm.sensors.soilMoisture.value,
                  unit: farm.sensors.soilMoisture.unit,
                }
              : null,
          },
          status: 'error',
          message: `Pi API unavailable: ${error.message}`,
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching live sensors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
