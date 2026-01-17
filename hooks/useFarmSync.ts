/**
 * useFarmSync Hook
 * 
 * Hook for syncing farm sensor data with the Raspberry Pi
 */

import { useState, useCallback } from 'react';
import type { Farm } from '@/types';

interface SyncResult {
  success: boolean;
  farm?: Farm;
  piStatus?: string;
  piErrors?: Array<{ sensor: string; error: string }>;
  error?: string;
}

interface UseFarmSyncOptions {
  /** Callback when sync completes successfully */
  onSuccess?: (farm: Farm) => void;
  /** Callback when sync fails */
  onError?: (error: string) => void;
}

interface UseFarmSyncReturn {
  /** Sync a specific farm */
  syncFarm: (farmId: string) => Promise<SyncResult>;
  /** Whether any sync is in progress */
  isSyncing: boolean;
  /** Map of farm IDs currently syncing */
  syncingFarms: Set<string>;
  /** Last sync error */
  lastError: string | null;
}

/**
 * Hook for syncing farm sensors with Raspberry Pi
 */
export function useFarmSync(options: UseFarmSyncOptions = {}): UseFarmSyncReturn {
  const { onSuccess, onError } = options;
  
  const [syncingFarms, setSyncingFarms] = useState<Set<string>>(new Set());
  const [lastError, setLastError] = useState<string | null>(null);

  const syncFarm = useCallback(
    async (farmId: string): Promise<SyncResult> => {
      // Mark farm as syncing
      setSyncingFarms((prev) => new Set(prev).add(farmId));
      setLastError(null);

      try {
        const response = await fetch(`/api/farms/${farmId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || 'Sync failed';
          setLastError(errorMessage);
          onError?.(errorMessage);
          return { success: false, error: errorMessage };
        }

        // Transform API response to Farm type
        const updatedFarm: Farm = {
          id: data.farm.id,
          name: data.farm.name,
          ownerId: '', // Not returned from sync
          status: data.farm.status,
          thumbnailUrl: '',
          sensors: data.farm.sensors,
          lastSeen: data.farm.lastSeen,
        };

        onSuccess?.(updatedFarm);

        return {
          success: true,
          farm: updatedFarm,
          piStatus: data.piStatus,
          piErrors: data.piErrors,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Network error';
        setLastError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        // Remove farm from syncing set
        setSyncingFarms((prev) => {
          const next = new Set(prev);
          next.delete(farmId);
          return next;
        });
      }
    },
    [onSuccess, onError]
  );

  return {
    syncFarm,
    isSyncing: syncingFarms.size > 0,
    syncingFarms,
    lastError,
  };
}

export default useFarmSync;
