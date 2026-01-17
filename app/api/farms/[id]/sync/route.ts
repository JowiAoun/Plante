/**
 * Farm Sync API Route
 * POST /api/farms/[id]/sync - Fetch sensor data from Pi and update farm
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getFarmsCollection } from '@/lib/db/collections';
import { getPiClient, PiApiError } from '@/lib/pi-client';
import type { DbFarm, SensorReading } from '@/lib/db/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Calculate farm status based on sensor values and thresholds
 */
function calculateStatus(
  sensors: DbFarm['sensors'],
  thresholds: DbFarm['thresholds']
): 'healthy' | 'warning' | 'critical' {
  const checks: { value: number; min: number; max: number }[] = [];

  // Temperature
  if (sensors.temperature && thresholds.temperature) {
    checks.push({
      value: sensors.temperature.value,
      min: thresholds.temperature.min,
      max: thresholds.temperature.max,
    });
  }

  // Humidity
  if (sensors.humidity && thresholds.humidity) {
    checks.push({
      value: sensors.humidity.value,
      min: thresholds.humidity.min,
      max: thresholds.humidity.max,
    });
  }

  // Soil moisture
  if (sensors.soilMoisture && thresholds.soilMoisture) {
    checks.push({
      value: sensors.soilMoisture.value,
      min: thresholds.soilMoisture.min,
      max: thresholds.soilMoisture.max,
    });
  }

  let hasCritical = false;
  let hasWarning = false;

  for (const check of checks) {
    const range = check.max - check.min;
    const warningBuffer = range * 0.1; // 10% buffer for warning

    if (check.value < check.min || check.value > check.max) {
      hasCritical = true;
    } else if (
      check.value < check.min + warningBuffer ||
      check.value > check.max - warningBuffer
    ) {
      hasWarning = true;
    }
  }

  if (hasCritical) return 'critical';
  if (hasWarning) return 'warning';
  return 'healthy';
}

/**
 * Calculate trend based on previous and current values
 */
function calculateTrend(
  previousValue: number | undefined,
  currentValue: number
): 'up' | 'down' | 'stable' {
  if (previousValue === undefined) return 'stable';
  const diff = currentValue - previousValue;
  const threshold = Math.abs(previousValue) * 0.05; // 5% threshold
  if (diff > threshold) return 'up';
  if (diff < -threshold) return 'down';
  return 'stable';
}

/**
 * POST /api/farms/[id]/sync
 * Sync farm sensors with Raspberry Pi
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

    const farms = await getFarmsCollection();
    const farm = await farms.findOne({
      _id: new ObjectId(id),
      ownerId: new ObjectId(session.user.id),
    });

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Fetch sensor data from Pi
    const piClient = getPiClient();

    if (!piClient.isConfigured()) {
      return NextResponse.json(
        { error: 'Pi API not configured' },
        { status: 503 }
      );
    }

    let piData;
    try {
      piData = await piClient.getSensors(false); // Force fresh reading
    } catch (error) {
      if (error instanceof PiApiError) {
        return NextResponse.json(
          { error: `Pi API error: ${error.message}` },
          { status: 503 }
        );
      }
      throw error;
    }

    const now = new Date();

    // Build updated sensors object
    const updatedSensors: DbFarm['sensors'] = {
      temperature: farm.sensors.temperature,
      humidity: farm.sensors.humidity,
      soilMoisture: farm.sensors.soilMoisture,
      light: farm.sensors.light,
    };

    // Update temperature
    if (piData.temperature) {
      const reading: SensorReading = {
        value: piData.temperature.value,
        unit: piData.temperature.unit,
        trend: calculateTrend(
          farm.sensors.temperature?.value,
          piData.temperature.value
        ),
        updatedAt: now,
      };
      updatedSensors.temperature = reading;
    }

    // Update humidity
    if (piData.humidity) {
      const reading: SensorReading = {
        value: piData.humidity.value,
        unit: piData.humidity.unit,
        trend: calculateTrend(
          farm.sensors.humidity?.value,
          piData.humidity.value
        ),
        updatedAt: now,
      };
      updatedSensors.humidity = reading;
    }

    // Update soil moisture
    if (piData.soil_moisture) {
      const reading: SensorReading = {
        value: piData.soil_moisture.value,
        unit: piData.soil_moisture.unit,
        trend: calculateTrend(
          farm.sensors.soilMoisture?.value,
          piData.soil_moisture.value
        ),
        updatedAt: now,
      };
      updatedSensors.soilMoisture = reading;
    }

    // Update light
    if (piData.light) {
      const reading: SensorReading = {
        value: piData.light.value,
        unit: piData.light.unit,
        trend: calculateTrend(farm.sensors.light?.value, piData.light.value),
        updatedAt: now,
      };
      updatedSensors.light = reading;
    }

    // Calculate new status
    const newStatus = calculateStatus(updatedSensors, farm.thresholds);

    // Update farm in database
    const result = await farms.findOneAndUpdate(
      { _id: farm._id },
      {
        $set: {
          sensors: updatedSensors,
          status: newStatus,
          lastSeen: now,
          updatedAt: now,
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update farm' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      farm: {
        id: result._id.toString(),
        name: result.name,
        status: result.status,
        sensors: {
          temp: {
            value: result.sensors.temperature.value,
            unit: result.sensors.temperature.unit === 'celsius' ? '°C' : '°F',
            trend: result.sensors.temperature.trend,
          },
          humidity: {
            value: result.sensors.humidity.value,
            unit: '%',
            trend: result.sensors.humidity.trend,
          },
          soil: {
            value: result.sensors.soilMoisture.value,
            unit: '%',
            trend: result.sensors.soilMoisture.trend,
          },
          light: result.sensors.light
            ? {
                value: result.sensors.light.value,
                unit: 'lux',
                trend: result.sensors.light.trend,
              }
            : undefined,
        },
        lastSeen: result.lastSeen.toISOString(),
      },
      piStatus: piData.status,
      piErrors: piData.errors,
    });
  } catch (error) {
    console.error('Error syncing farm:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
