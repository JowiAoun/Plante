/**
 * Farm Sensors API Route
 * POST /api/farms/[id]/sensors - Update sensor data (from Raspberry Pi)
 */

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getFarmsCollection } from '@/lib/db/collections';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Determine farm status based on sensor readings and thresholds
 */
function calculateStatus(
  sensors: { temperature?: number; humidity?: number; soilMoisture?: number },
  thresholds: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    soilMoisture: { min: number; max: number };
  }
): 'healthy' | 'warning' | 'critical' {
  let criticalCount = 0;
  let warningCount = 0;

  const checkValue = (
    value: number | undefined,
    threshold: { min: number; max: number }
  ) => {
    if (value === undefined) return;
    const deviation = Math.max(
      value < threshold.min ? threshold.min - value : 0,
      value > threshold.max ? value - threshold.max : 0
    );
    const range = threshold.max - threshold.min;
    const percentDeviation = (deviation / range) * 100;

    if (percentDeviation > 50) criticalCount++;
    else if (percentDeviation > 0) warningCount++;
  };

  checkValue(sensors.temperature, thresholds.temperature);
  checkValue(sensors.humidity, thresholds.humidity);
  checkValue(sensors.soilMoisture, thresholds.soilMoisture);

  if (criticalCount > 0) return 'critical';
  if (warningCount > 0) return 'warning';
  return 'healthy';
}

/**
 * POST /api/farms/[id]/sensors
 * Update sensor readings from IoT device
 * 
 * This endpoint is designed for Raspberry Pi or similar IoT devices.
 * Authentication is via deviceId header matching the farm's registered device.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deviceId = request.headers.get('x-device-id');

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid farm ID' }, { status: 400 });
    }

    const body = await request.json();
    const now = new Date();

    const farms = await getFarmsCollection();
    
    // Find farm by ID and optionally verify device ID
    const query: Record<string, unknown> = { _id: new ObjectId(id) };
    if (deviceId) {
      query.deviceId = deviceId;
    }

    const farm = await farms.findOne(query);
    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Build sensor update object
    const sensorUpdates: Record<string, unknown> = {};

    if (body.temperature !== undefined) {
      const prevValue = farm.sensors.temperature.value;
      const trend = body.temperature > prevValue ? 'up' : body.temperature < prevValue ? 'down' : 'stable';
      sensorUpdates['sensors.temperature'] = {
        value: body.temperature,
        unit: body.temperatureUnit || 'celsius',
        trend,
        updatedAt: now,
      };
    }

    if (body.humidity !== undefined) {
      const prevValue = farm.sensors.humidity.value;
      const trend = body.humidity > prevValue ? 'up' : body.humidity < prevValue ? 'down' : 'stable';
      sensorUpdates['sensors.humidity'] = {
        value: body.humidity,
        unit: 'percent',
        trend,
        updatedAt: now,
      };
    }

    if (body.soilMoisture !== undefined) {
      const prevValue = farm.sensors.soilMoisture.value;
      const trend = body.soilMoisture > prevValue ? 'up' : body.soilMoisture < prevValue ? 'down' : 'stable';
      sensorUpdates['sensors.soilMoisture'] = {
        value: body.soilMoisture,
        unit: 'percent',
        trend,
        updatedAt: now,
      };
    }

    if (body.light !== undefined) {
      const prevValue = farm.sensors.light?.value ?? 0;
      const trend = body.light > prevValue ? 'up' : body.light < prevValue ? 'down' : 'stable';
      sensorUpdates['sensors.light'] = {
        value: body.light,
        unit: 'lux',
        trend,
        updatedAt: now,
      };
    }

    // Calculate new status
    const newStatus = calculateStatus(
      {
        temperature: body.temperature ?? farm.sensors.temperature.value,
        humidity: body.humidity ?? farm.sensors.humidity.value,
        soilMoisture: body.soilMoisture ?? farm.sensors.soilMoisture.value,
      },
      farm.thresholds
    );

    // Update farm
    await farms.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...sensorUpdates,
          status: newStatus,
          lastSeen: now,
          updatedAt: now,
        },
      }
    );

    return NextResponse.json({
      success: true,
      status: newStatus,
      lastSeen: now.toISOString(),
    });
  } catch (error) {
    console.error('Error updating sensors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
