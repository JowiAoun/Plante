/**
 * Friend Request API Route
 * POST /api/friends/request - Send or respond to friend request
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';
import { authOptions } from '@/lib/auth';
import { getFriendshipsCollection, getUsersCollection } from '@/lib/db/collections';
import type { DbFriendship } from '@/lib/db/types';

/**
 * POST /api/friends/request
 * Send a new friend request or respond to an existing one
 * 
 * Body:
 * - targetUserId: string - User to send request to
 * - action?: 'accept' | 'reject' - For responding to requests
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, action } = body;

    if (!targetUserId || !ObjectId.isValid(targetUserId)) {
      return NextResponse.json({ error: 'Invalid target user ID' }, { status: 400 });
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    const userId = new ObjectId(session.user.id);
    const targetId = new ObjectId(targetUserId);

    // Sort IDs for consistent storage (smaller first)
    const sortedUsers: [ObjectId, ObjectId] = userId.toString() < targetId.toString()
      ? [userId, targetId]
      : [targetId, userId];

    const friendships = await getFriendshipsCollection();
    const users = await getUsersCollection();

    // Check if target user exists
    const targetUser = await users.findOne({ _id: targetId });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing friendship
    const existing = await friendships.findOne({ users: sortedUsers });

    if (action === 'accept' || action === 'reject') {
      // Handle response to existing request
      if (!existing) {
        return NextResponse.json({ error: 'No pending request found' }, { status: 404 });
      }

      if (existing.status !== 'pending') {
        return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
      }

      // Only the recipient can accept/reject
      if (existing.initiatedBy.equals(userId)) {
        return NextResponse.json({ error: 'Cannot respond to your own request' }, { status: 400 });
      }

      if (action === 'accept') {
        await friendships.updateOne(
          { _id: existing._id },
          {
            $set: {
              status: 'accepted',
              acceptedAt: new Date(),
            },
          }
        );
        return NextResponse.json({ success: true, status: 'accepted' });
      } else {
        // Reject - delete the friendship record
        await friendships.deleteOne({ _id: existing._id });
        return NextResponse.json({ success: true, status: 'rejected' });
      }
    }

    // Handle new friend request
    if (existing) {
      if (existing.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }
      if (existing.status === 'pending') {
        // If target already sent us a request, auto-accept
        if (!existing.initiatedBy.equals(userId)) {
          await friendships.updateOne(
            { _id: existing._id },
            {
              $set: {
                status: 'accepted',
                acceptedAt: new Date(),
              },
            }
          );
          return NextResponse.json({ success: true, status: 'accepted', message: 'Mutual request accepted' });
        }
        return NextResponse.json({ error: 'Request already pending' }, { status: 400 });
      }
      if (existing.status === 'blocked') {
        return NextResponse.json({ error: 'Cannot send request' }, { status: 400 });
      }
    }

    // Create new friendship request
    const newFriendship: Omit<DbFriendship, '_id'> = {
      users: sortedUsers,
      status: 'pending',
      initiatedBy: userId,
      createdAt: new Date(),
    };

    await friendships.insertOne(newFriendship as DbFriendship);

    return NextResponse.json(
      { success: true, status: 'pending' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
