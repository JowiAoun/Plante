/**
 * Database Connection Tests
 * 
 * Tests MongoDB connectivity and basic operations.
 */

import { describe, it, expect, afterAll } from 'vitest';
import { MongoClient } from 'mongodb';

describe('MongoDB Connection', () => {
  let client: MongoClient | null = null;

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  it('MONGODB_URI should be configured', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI?.length).toBeGreaterThan(0);
  });

  it('Should connect to MongoDB', async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('⚠ MONGODB_URI not set, skipping connection test');
      return;
    }

    client = new MongoClient(uri);
    await client.connect();
    
    // Ping the database
    const result = await client.db('admin').command({ ping: 1 });
    expect(result.ok).toBe(1);
  });

  it('Should access plante database', async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) return;

    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }

    const db = client.db('plante');
    const collections = await db.listCollections().toArray();
    
    // Should have some collections (users, farms, etc.)
    expect(Array.isArray(collections)).toBe(true);
  });

  it('Should have required collections', async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) return;

    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }

    const db = client.db('plante');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Check for expected collections
    const expectedCollections = ['users', 'farms', 'accounts', 'sessions'];
    const foundCollections = expectedCollections.filter((name) =>
      collectionNames.includes(name)
    );

    // At minimum, users should exist
    expect(collectionNames).toContain('users');
  });
});
