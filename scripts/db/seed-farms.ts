/**
 * Farm Seeding Script
 * Run with: npx tsx scripts/db/seed-farms.ts
 */

import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import type { DbFarm, SensorReading } from '../../lib/db/types';

// Use 'kalanchoe-farm' as the device identifier
const KALANCHOE_FARM_ID = 'kalanchoe-farm';

async function seedFarms() {
  console.log('🌱 Connecting to MongoDB...');
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const client = await clientPromise;
  const db = client.db('plante');
  const farms = db.collection<DbFarm>('farms');

  // Default sensor reading factory
  const createReading = (value: number, unit: string): SensorReading => ({
    value,
    unit,
    trend: 'stable' as const,
    updatedAt: new Date(),
  });

  const now = new Date();

  // Create the shared Kalanchoe Farm data
  const KalanchoeFarmData = {
    ownerId: new ObjectId(), // Placeholder 'shared' owner ID
    name: 'Kalanchoe Farm',
    deviceId: KALANCHOE_FARM_ID,
    status: 'healthy' as const,
    thumbnailUrl: '/sprites/farm_succulent_32.png',
    sensors: {
      temperature: createReading(23, '°C'),
      humidity: createReading(55, '%'),
      soilMoisture: createReading(40, '%'),
      light: createReading(800, 'lux'),
    },
    thresholds: {
      temperature: { min: 18, max: 28 },
      humidity: { min: 40, max: 70 },
      soilMoisture: { min: 30, max: 80 },
    },
    lastSeen: now,
    updatedAt: now,
    // createdAt will be set on insert only
  };

  console.log(`🌾 Seeding farm: ${KalanchoeFarmData.name} (${KALANCHOE_FARM_ID})...`);

  // Upsert based on deviceId
  await farms.updateOne(
      { deviceId: KALANCHOE_FARM_ID },
      { 
        $set: KalanchoeFarmData,
        $setOnInsert: { createdAt: now, _id: new ObjectId() }
      },
      { upsert: true }
  );

  console.log('✅ Kalanchoe Farm seeded successfully');
  process.exit(0);
}

seedFarms().catch(err => {
    console.error('❌ Error seeding farms:', err);
    process.exit(1);
});
