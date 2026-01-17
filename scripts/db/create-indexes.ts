/**
 * MongoDB Index Creation Script
 * Run with: npx tsx scripts/db/create-indexes.ts
 */

import clientPromise from '../../lib/mongodb';

async function createIndexes() {
  console.log('🔗 Connecting to MongoDB...');
  const client = await clientPromise;
  const db = client.db('plante');

  console.log('📇 Creating indexes...\n');

  // Users collection indexes
  console.log('Creating users indexes...');
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true, sparse: true });
  await db.collection('users').createIndex({ level: -1, xp: -1 }); // Leaderboard queries
  console.log('  ✓ users.email (unique)');
  console.log('  ✓ users.username (unique, sparse)');
  console.log('  ✓ users.level, xp (compound, descending)');

  // Accounts collection indexes (NextAuth)
  console.log('\nCreating accounts indexes...');
  await db.collection('accounts').createIndex(
    { provider: 1, providerAccountId: 1 },
    { unique: true }
  );
  await db.collection('accounts').createIndex({ userId: 1 });
  console.log('  ✓ accounts.provider, providerAccountId (unique)');
  console.log('  ✓ accounts.userId');

  // Sessions collection indexes (NextAuth)
  console.log('\nCreating sessions indexes...');
  await db.collection('sessions').createIndex({ sessionToken: 1 }, { unique: true });
  await db.collection('sessions').createIndex({ userId: 1 });
  await db.collection('sessions').createIndex({ expires: 1 }, { expireAfterSeconds: 0 }); // TTL
  console.log('  ✓ sessions.sessionToken (unique)');
  console.log('  ✓ sessions.userId');
  console.log('  ✓ sessions.expires (TTL)');

  // Farms collection indexes
  console.log('\nCreating farms indexes...');
  await db.collection('farms').createIndex({ ownerId: 1 });
  await db.collection('farms').createIndex({ deviceId: 1 }, { unique: true, sparse: true });
  await db.collection('farms').createIndex({ status: 1, ownerId: 1 });
  console.log('  ✓ farms.ownerId');
  console.log('  ✓ farms.deviceId (unique, sparse)');
  console.log('  ✓ farms.status, ownerId (compound)');

  // User achievements collection indexes
  console.log('\nCreating user_achievements indexes...');
  await db.collection('user_achievements').createIndex(
    { userId: 1, achievementId: 1 },
    { unique: true }
  );
  await db.collection('user_achievements').createIndex({ unlockedAt: -1 });
  console.log('  ✓ user_achievements.userId, achievementId (unique)');
  console.log('  ✓ user_achievements.unlockedAt (descending)');

  // Friendships collection indexes
  console.log('\nCreating friendships indexes...');
  await db.collection('friendships').createIndex({ users: 1 }, { unique: true });
  await db.collection('friendships').createIndex({ users: 1, status: 1 });
  console.log('  ✓ friendships.users (unique)');
  console.log('  ✓ friendships.users, status (compound)');

  // Notifications collection indexes
  console.log('\nCreating notifications indexes...');
  await db.collection('notifications').createIndex({ userId: 1, read: 1, createdAt: -1 });
  await db.collection('notifications').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
  console.log('  ✓ notifications.userId, read, createdAt (compound)');
  console.log('  ✓ notifications.expiresAt (TTL)');

  console.log('\n✅ All indexes created successfully!');
  process.exit(0);
}

createIndexes().catch((error) => {
  console.error('❌ Error creating indexes:', error);
  process.exit(1);
});
