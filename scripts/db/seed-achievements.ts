/**
 * Achievement Seeding Script
 * Run with: npx tsx scripts/db/seed-achievements.ts
 */

import clientPromise from '../../lib/mongodb';
import type { DbAchievement } from '../../lib/db/types';

// Use DbAchievement type directly since _id is string type
const achievements: DbAchievement[] = [
  {
    _id: 'first_farm',
    title: 'Green Thumb',
    description: 'Create your first farm',
    icon: 'achievement_first_farm',
    rarity: 'common',
    xpReward: 50,
    criteria: { type: 'farms', value: 1 },
  },
  {
    _id: 'level_5',
    title: 'Growing Strong',
    description: 'Reach level 5',
    icon: 'achievement_level_5',
    rarity: 'common',
    xpReward: 100,
    criteria: { type: 'level', value: 5 },
  },
  {
    _id: 'level_10',
    title: 'Plant Master',
    description: 'Reach level 10',
    icon: 'achievement_level_10',
    rarity: 'rare',
    xpReward: 250,
    criteria: { type: 'level', value: 10 },
  },
  {
    _id: 'level_25',
    title: 'Garden Guru',
    description: 'Reach level 25',
    icon: 'achievement_level_25',
    rarity: 'epic',
    xpReward: 500,
    criteria: { type: 'level', value: 25 },
  },
  {
    _id: 'level_50',
    title: 'Legendary Farmer',
    description: 'Reach level 50',
    icon: 'achievement_level_50',
    rarity: 'legendary',
    xpReward: 1000,
    criteria: { type: 'level', value: 50 },
  },
  {
    _id: 'farms_5',
    title: 'Farm Collector',
    description: 'Own 5 farms',
    icon: 'achievement_farms_5',
    rarity: 'rare',
    xpReward: 200,
    criteria: { type: 'farms', value: 5 },
  },
  {
    _id: 'farms_10',
    title: 'Farm Empire',
    description: 'Own 10 farms',
    icon: 'achievement_farms_10',
    rarity: 'epic',
    xpReward: 500,
    criteria: { type: 'farms', value: 10 },
  },
  {
    _id: 'streak_7',
    title: 'Week Warrior',
    description: 'Maintain healthy plants for 7 days straight',
    icon: 'achievement_streak_7',
    rarity: 'common',
    xpReward: 75,
    criteria: { type: 'streak', value: 7 },
  },
  {
    _id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintain healthy plants for 30 days straight',
    icon: 'achievement_streak_30',
    rarity: 'rare',
    xpReward: 300,
    criteria: { type: 'streak', value: 30 },
  },
  {
    _id: 'streak_100',
    title: 'Century Keeper',
    description: 'Maintain healthy plants for 100 days straight',
    icon: 'achievement_streak_100',
    rarity: 'legendary',
    xpReward: 1000,
    criteria: { type: 'streak', value: 100 },
  },
];

async function seedAchievements() {
  console.log('🔗 Connecting to MongoDB...');
  const client = await clientPromise;
  const db = client.db('plante');
  const collection = db.collection<DbAchievement>('achievements');

  console.log('🏆 Seeding achievements...\n');

  for (const achievement of achievements) {
    await collection.updateOne(
      { _id: achievement._id as unknown as DbAchievement['_id'] },
      { $set: achievement },
      { upsert: true }
    );
    console.log(`  ✓ ${achievement._id}: ${achievement.title} (${achievement.rarity})`);
  }

  console.log(`\n✅ Seeded ${achievements.length} achievements successfully!`);
  process.exit(0);
}

seedAchievements().catch((error) => {
  console.error('❌ Error seeding achievements:', error);
  process.exit(1);
});
