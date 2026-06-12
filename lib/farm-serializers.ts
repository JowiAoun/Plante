/**
 * Farm response serializers.
 * Map demo-store farms (DB-shaped, raw units) to the JSON shapes the
 * client expects. These shapes are unchanged from the MongoDB era.
 */

import type { DemoFarm } from './demo-store';

export function mapFarmSummary(farm: DemoFarm) {
  return {
    id: farm.id,
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
  };
}

export function mapFarmDetail(farm: DemoFarm) {
  return {
    id: farm.id,
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
    wateringCount: farm.wateringCount || 0,
    createdAt: farm.createdAt.toISOString(),
    updatedAt: farm.updatedAt.toISOString(),
  };
}

export function mapFarmSync(farm: DemoFarm) {
  return {
    id: farm.id,
    name: farm.name,
    status: farm.status,
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
      light: farm.sensors.light
        ? {
            value: farm.sensors.light.value,
            unit: 'lux',
            trend: farm.sensors.light.trend,
          }
        : undefined,
    },
    lastSeen: farm.lastSeen.toISOString(),
  };
}
