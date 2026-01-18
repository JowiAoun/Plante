'use client';

/**
 * useNotifications Hook
 * Fetches user notifications from the database
 */

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types';

export interface UseNotificationsOptions {
    /** Only fetch unread notifications */
    unreadOnly?: boolean;
    /** Maximum number of notifications to fetch */
    limit?: number;
    /** Auto-refresh interval in milliseconds (0 to disable) */
    refreshInterval?: number;
}

export interface UseNotificationsResult {
    notifications: Notification[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
}

/**
 * Hook to fetch and manage notifications
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsResult {
    const { unreadOnly = false, limit = 20, refreshInterval = 0 } = options;

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (unreadOnly) params.set('unreadOnly', 'true');
            if (limit) params.set('limit', String(limit));

            const response = await fetch(`/api/notifications?${params}`);

            if (!response.ok) {
                if (response.status === 401) {
                    // User not authenticated, return empty array
                    setNotifications([]);
                    return;
                }
                throw new Error('Failed to fetch notifications');
            }

            const data = await response.json();
            setNotifications(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [unreadOnly, limit]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true }),
            });

            if (response.ok) {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
            }
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        if (refreshInterval > 0) {
            const interval = setInterval(fetchNotifications, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchNotifications, refreshInterval]);

    return {
        notifications,
        loading,
        error,
        refetch: fetchNotifications,
        markAsRead,
    };
}

export default useNotifications;
