# MongoDB Database Specification

> **Cloud Database for User Data, Farms, and Application State**

This document specifies the MongoDB Atlas setup and schema design for storing all persistent application data including users, farms, achievements, friends, and settings.

---

## Prerequisites

Before implementing this feature, ensure the following are completed:

### MongoDB Atlas Setup
- [ ] **Create MongoDB Atlas Account** — Sign up at [cloud.mongodb.com](https://cloud.mongodb.com)
- [ ] **Create a Cluster** — Free tier (M0) is sufficient for development
- [ ] **Create Database User** — Database Access → Add New Database User
- [ ] **Whitelist IP Addresses** — Network Access → Add IP Address (0.0.0.0/0 for dev)
- [ ] **Get Connection String** — Clusters → Connect → Drivers → Copy connection string

### Dependencies to Install
```bash
npm install mongodb @auth/mongodb-adapter
```

### Environment Configuration
- [ ] Add `MONGODB_URI` to `.env`

```bash
# MongoDB Configuration
# Get connection string from MongoDB Atlas: https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/plante?retryWrites=true&w=majority
```

---

## Database Architecture

### Database Name
```
plante
```

### Collections Overview

| Collection | Purpose | Primary Key |
|------------|---------|-------------|
| `users` | User profiles, auth, gamification | `_id` (ObjectId) |
| `accounts` | OAuth account links (NextAuth) | `_id` (ObjectId) |
| `sessions` | Active sessions (NextAuth) | `_id` (ObjectId) |
| `farms` | User farms with sensor data | `_id` (ObjectId) |
| `achievements` | Achievement definitions | `_id` (string) |
| `user_achievements` | User unlock records | `_id` (ObjectId) |
| `friendships` | Friend relationships | `_id` (ObjectId) |
| `notifications` | User notifications | `_id` (ObjectId) |

---

## Collection Schemas

### `users` Collection

Stores user profiles, authentication state, and gamification data.

```typescript
interface User {
  _id: ObjectId;
  
  // NextAuth managed fields
  email: string;                    // From Google OAuth
  emailVerified: Date | null;
  image?: string;                   // Google profile picture
  
  // Profile fields
  username: string;                 // Unique, lowercase, 3-20 chars
  displayName: string;              // 1-50 chars
  avatarSeed: string;               // DiceBear seed
  
  // Gamification
  level: number;                    // Default: 1
  xp: number;                       // Default: 0
  
  // Settings (embedded document)
  settings: {
    theme: 'default' | 'spring' | 'night' | 'neon';
    voiceEnabled: boolean;          // ElevenLabs TTS
    notificationsEnabled: boolean;
    pixelScale: '1x' | '2x';
  };
  
  // Status
  profileCompletedAt?: Date;        // Set when profile-setup finished
  lastSeenAt: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
```javascript
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "level": -1, "xp": -1 });  // Leaderboard queries
```

---

### `accounts` Collection (NextAuth Managed)

Links OAuth providers to users. Managed automatically by NextAuth.

```typescript
interface Account {
  _id: ObjectId;
  userId: ObjectId;                 // Reference to users._id
  type: 'oauth';
  provider: 'google';
  providerAccountId: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}
```

**Indexes:**
```javascript
db.accounts.createIndex({ "provider": 1, "providerAccountId": 1 }, { unique: true });
db.accounts.createIndex({ "userId": 1 });
```

---

### `sessions` Collection (NextAuth Managed)

Active user sessions. Managed automatically by NextAuth.

```typescript
interface Session {
  _id: ObjectId;
  sessionToken: string;
  userId: ObjectId;
  expires: Date;
}
```

**Indexes:**
```javascript
db.sessions.createIndex({ "sessionToken": 1 }, { unique: true });
db.sessions.createIndex({ "userId": 1 });
db.sessions.createIndex({ "expires": 1 }, { expireAfterSeconds: 0 });  // TTL
```

---

### `farms` Collection

Stores user farms with sensor data and configuration.

```typescript
interface Farm {
  _id: ObjectId;
  ownerId: ObjectId;                // Reference to users._id
  
  // Basic info
  name: string;                     // User-defined name
  species?: string;                 // Plant species
  thumbnailUrl?: string;            // Latest camera image
  
  // Status
  status: 'healthy' | 'warning' | 'critical';
  
  // Sensor readings (updated from Raspberry Pi)
  sensors: {
    temperature: {
      value: number;
      unit: 'celsius' | 'fahrenheit';
      trend: 'up' | 'down' | 'stable';
      updatedAt: Date;
    };
    humidity: {
      value: number;
      unit: 'percent';
      trend: 'up' | 'down' | 'stable';
      updatedAt: Date;
    };
    soilMoisture: {
      value: number;
      unit: 'percent';
      trend: 'up' | 'down' | 'stable';
      updatedAt: Date;
    };
    light?: {
      value: number;
      unit: 'lux';
      trend: 'up' | 'down' | 'stable';
      updatedAt: Date;
    };
  };
  
  // Thresholds for alerts
  thresholds: {
    temperature: { min: number; max: number };
    humidity: { min: number; max: number };
    soilMoisture: { min: number; max: number };
  };
  
  // Device info
  deviceId?: string;                // Raspberry Pi identifier
  lastSeen: Date;                   // Last sensor update
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
```javascript
db.farms.createIndex({ "ownerId": 1 });
db.farms.createIndex({ "deviceId": 1 }, { unique: true, sparse: true });
db.farms.createIndex({ "status": 1, "ownerId": 1 });
```

---

### `achievements` Collection

Achievement definitions (seeded, rarely changes).

```typescript
interface Achievement {
  _id: string;                      // e.g., "first_farm", "level_10"
  title: string;
  description: string;
  icon: string;                     // Sprite name or URL
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  
  // Unlock criteria
  criteria: {
    type: 'level' | 'farms' | 'streak' | 'event';
    value: number;
  };
}
```

---

### `user_achievements` Collection

Tracks which users have unlocked which achievements.

```typescript
interface UserAchievement {
  _id: ObjectId;
  userId: ObjectId;
  achievementId: string;            // Reference to achievements._id
  unlockedAt: Date;
}
```

**Indexes:**
```javascript
db.user_achievements.createIndex({ "userId": 1, "achievementId": 1 }, { unique: true });
db.user_achievements.createIndex({ "unlockedAt": -1 });
```

---

### `friendships` Collection

Bidirectional friend relationships.

```typescript
interface Friendship {
  _id: ObjectId;
  
  // Users involved (sorted order for uniqueness)
  users: [ObjectId, ObjectId];      // [smaller_id, larger_id]
  
  // Status
  status: 'pending' | 'accepted' | 'blocked';
  initiatedBy: ObjectId;            // Who sent the request
  
  // Timestamps
  createdAt: Date;
  acceptedAt?: Date;
}
```

**Indexes:**
```javascript
db.friendships.createIndex({ "users": 1 }, { unique: true });
db.friendships.createIndex({ "users": 1, "status": 1 });
```

---

### `notifications` Collection

User notifications for alerts, achievements, social events.

```typescript
interface Notification {
  _id: ObjectId;
  userId: ObjectId;
  
  type: 'alert' | 'achievement' | 'social' | 'system';
  severity: 'info' | 'warning' | 'critical';
  
  title: string;
  message: string;
  link?: string;                    // Deep link within app
  
  // Related entities
  farmId?: ObjectId;
  achievementId?: string;
  fromUserId?: ObjectId;            // For social notifications
  
  // Status
  read: boolean;
  readAt?: Date;
  
  // Timestamps
  createdAt: Date;
  expiresAt?: Date;                 // Optional TTL
}
```

**Indexes:**
```javascript
db.notifications.createIndex({ "userId": 1, "read": 1, "createdAt": -1 });
db.notifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });  // TTL
```

---

## Connection Setup

### MongoDB Client Helper

```typescript
// lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // Preserve connection across hot reloads in development
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Create new connection in production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Helper to get database instance
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db('plante');
}
```

### Collection Type Helpers

```typescript
// lib/db/collections.ts
import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../mongodb';

// Type-safe collection accessors
export async function getUsersCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>('users');
}

export async function getFarmsCollection(): Promise<Collection<Farm>> {
  const db = await getDb();
  return db.collection<Farm>('farms');
}

export async function getNotificationsCollection(): Promise<Collection<Notification>> {
  const db = await getDb();
  return db.collection<Notification>('notifications');
}

// Add more as needed...
```

---

## Common Queries

### User Queries

```typescript
// Get user by ID
const user = await users.findOne({ _id: new ObjectId(userId) });

// Get user by username
const user = await users.findOne({ username: username.toLowerCase() });

// Check username availability
const exists = await users.findOne({ username }, { projection: { _id: 1 } });

// Update user XP and check level up
const result = await users.findOneAndUpdate(
  { _id: new ObjectId(userId) },
  { 
    $inc: { xp: xpAmount },
    $set: { updatedAt: new Date() }
  },
  { returnDocument: 'after' }
);
```

### Farm Queries

```typescript
// Get all farms for user
const farms = await farmsCollection
  .find({ ownerId: new ObjectId(userId) })
  .sort({ createdAt: -1 })
  .toArray();

// Get farms needing attention
const criticalFarms = await farmsCollection
  .find({ 
    ownerId: new ObjectId(userId),
    status: { $in: ['warning', 'critical'] }
  })
  .toArray();

// Update sensor data
await farmsCollection.updateOne(
  { deviceId: deviceId },
  {
    $set: {
      'sensors.temperature': { value, unit: 'celsius', trend, updatedAt: new Date() },
      lastSeen: new Date(),
      updatedAt: new Date()
    }
  }
);
```

### Leaderboard Query

```typescript
// Get top users by level/XP
const leaderboard = await users
  .find({ profileCompletedAt: { $exists: true } })
  .sort({ level: -1, xp: -1 })
  .limit(100)
  .project({ username: 1, displayName: 1, avatarSeed: 1, level: 1, xp: 1 })
  .toArray();
```

### Friends Query

```typescript
// Get user's friends
const friendships = await friendshipsCollection
  .find({
    users: new ObjectId(userId),
    status: 'accepted'
  })
  .toArray();

const friendIds = friendships.map(f => 
  f.users.find(id => !id.equals(new ObjectId(userId)))
);
const friends = await users.find({ _id: { $in: friendIds } }).toArray();
```

---

## Data Seeding

### Initial Achievements

```typescript
// scripts/seed-achievements.ts
const achievements = [
  {
    _id: 'first_farm',
    title: 'Green Thumb',
    description: 'Create your first farm',
    icon: 'achievement_first_farm',
    rarity: 'common',
    xpReward: 50,
    criteria: { type: 'farms', value: 1 }
  },
  {
    _id: 'level_5',
    title: 'Growing Strong',
    description: 'Reach level 5',
    icon: 'achievement_level_5',
    rarity: 'common',
    xpReward: 100,
    criteria: { type: 'level', value: 5 }
  },
  {
    _id: 'level_10',
    title: 'Plant Master',
    description: 'Reach level 10',
    icon: 'achievement_level_10',
    rarity: 'rare',
    xpReward: 250,
    criteria: { type: 'level', value: 10 }
  },
  // Add more...
];
```

---

## API Routes

### Database-backed Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/users/[id]` | GET | Get user profile |
| `/api/users/[id]` | PATCH | Update user profile |
| `/api/farms` | GET | List user's farms |
| `/api/farms` | POST | Create new farm |
| `/api/farms/[id]` | GET, PATCH, DELETE | Farm CRUD |
| `/api/farms/[id]/sensors` | POST | Update sensor data (from Pi) |
| `/api/friends` | GET | List friends |
| `/api/friends/request` | POST | Send friend request |
| `/api/notifications` | GET | List notifications |
| `/api/notifications/[id]/read` | POST | Mark as read |
| `/api/leaderboard` | GET | Get leaderboard |

---

## Migration from Mock Data

### Step-by-Step Migration

1. **Set up MongoDB connection** — Create `lib/mongodb.ts`
2. **Create indexes** — Run index creation script
3. **Seed achievements** — Run seed script
4. **Update NextAuth** — Add MongoDB adapter
5. **Create API routes** — Replace mock handlers
6. **Update components** — Fetch from real APIs

### Replacing Mock Services

```typescript
// Before (mock)
import { mockUsers, mockFarms } from '@/mocks';
const user = mockUsers.find(u => u.id === userId);

// After (MongoDB)
import { getUsersCollection } from '@/lib/db/collections';
const users = await getUsersCollection();
const user = await users.findOne({ _id: new ObjectId(userId) });
```

---

## Security Best Practices

| Concern | Implementation |
|---------|----------------|
| **Connection String** | Never commit to git; use env vars |
| **IP Whitelist** | Restrict to known IPs in production |
| **User Permissions** | Create read-only users for analytics |
| **Field Projection** | Never return password hashes or tokens |
| **Input Validation** | Validate ObjectIds before queries |
| **Rate Limiting** | Limit API calls to prevent abuse |

---

## Monitoring

### Recommended Atlas Alerts

- Connections > 80% of limit
- Query targeting ratio > 1000
- Disk usage > 80%
- Replication lag > 10s

### Sentry Integration

See [SENTRY.md](./SENTRY.md) for database query tracing.

---

## Dependencies

```json
{
  "mongodb": "^6.0.0",
  "@auth/mongodb-adapter": "^2.0.0"
}
```

Install with:
```bash
npm install mongodb @auth/mongodb-adapter
```
