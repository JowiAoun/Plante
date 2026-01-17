/**
 * FarmCard Component
 * Tile representing a farm unit on dashboard with live sensor data
 */

import React, { useState, useCallback } from 'react';
import type { Farm, SensorReading } from '@/types';
import './FarmCard.css';

export interface FarmCardProps {
  /** Farm data */
  farm: Farm;
  /** Click handler for selecting the farm */
  onSelect?: (farm: Farm) => void;
  /** Whether this card is currently selected */
  selected?: boolean;
  /** Handler for sync button click */
  onSync?: (farmId: string) => Promise<void>;
  /** Whether sync is in progress */
  isSyncing?: boolean;
}

/**
 * Get status indicator hearts based on farm status
 */
const getStatusHearts = (status: Farm['status']) => {
  switch (status) {
    case 'healthy':
      return '❤️❤️❤️';
    case 'warning':
      return '❤️❤️🖤';
    case 'critical':
      return '❤️🖤🖤';
    default:
      return '🖤🖤🖤';
  }
};

/**
 * Get health indicator class based on sensor value and thresholds
 */
const getSensorHealthClass = (
  value: number,
  threshold?: { min: number; max: number }
): string => {
  if (!threshold) return '';

  const range = threshold.max - threshold.min;
  const buffer = range * 0.1; // 10% buffer for warning

  if (value < threshold.min || value > threshold.max) {
    return 'sensor--critical';
  }
  if (value < threshold.min + buffer || value > threshold.max - buffer) {
    return 'sensor--warning';
  }
  return 'sensor--healthy';
};

/**
 * Format relative time from ISO string
 */
const formatLastSeen = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

/**
 * Get trend arrow indicator
 */
const getTrendIndicator = (trend: SensorReading['trend']) => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '';
  }
};

/**
 * FarmCard displays a farm tile with status, sensors, and actions
 */
export const FarmCard: React.FC<FarmCardProps> = ({
  farm,
  onSelect,
  selected = false,
  onSync,
  isSyncing = false,
}) => {
  const [syncing, setSyncing] = useState(false);

  const handleClick = () => {
    onSelect?.(farm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(farm);
    }
  };

  const handleSync = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card selection
      if (!onSync || syncing || isSyncing) return;

      setSyncing(true);
      try {
        await onSync(farm.id);
      } finally {
        setSyncing(false);
      }
    },
    [onSync, farm.id, syncing, isSyncing]
  );

  const isCurrentlySyncing = syncing || isSyncing;

  return (
    <div
      className={`farm-card nes-container is-dark ${selected ? 'farm-card--selected' : ''} status-${farm.status}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${farm.name} - Status: ${farm.status}`}
    >
      {/* Thumbnail */}
      <div className="farm-card__thumbnail">
        <div className="farm-card__placeholder-icon">🌱</div>
      </div>

      {/* Header with name and hearts */}
      <div className="farm-card__header">
        <h3 className="farm-card__title">{farm.name}</h3>
        <span className="farm-card__status" aria-label={`Health: ${farm.status}`}>
          {getStatusHearts(farm.status)}
        </span>
      </div>

      {/* Sensors */}
      <div className="farm-card__sensors">
        <div
          className={`farm-card__sensor ${getSensorHealthClass(
            farm.sensors.temp.value,
            farm.thresholds?.temperature
          )}`}
          title="Temperature"
        >
          <span className="farm-card__sensor-icon">🌡️</span>
          <span className="farm-card__sensor-value">
            {farm.sensors.temp.value}
            {farm.sensors.temp.unit}
            <span className="farm-card__sensor-trend">
              {getTrendIndicator(farm.sensors.temp.trend)}
            </span>
          </span>
        </div>
        <div
          className={`farm-card__sensor ${getSensorHealthClass(
            farm.sensors.humidity.value,
            farm.thresholds?.humidity
          )}`}
          title="Humidity"
        >
          <span className="farm-card__sensor-icon">💧</span>
          <span className="farm-card__sensor-value">
            {farm.sensors.humidity.value}
            {farm.sensors.humidity.unit}
            <span className="farm-card__sensor-trend">
              {getTrendIndicator(farm.sensors.humidity.trend)}
            </span>
          </span>
        </div>
        <div
          className={`farm-card__sensor ${getSensorHealthClass(
            farm.sensors.soil.value,
            farm.thresholds?.soilMoisture
          )}`}
          title="Soil Moisture"
        >
          <span className="farm-card__sensor-icon">🌍</span>
          <span className="farm-card__sensor-value">
            {farm.sensors.soil.value}
            {farm.sensors.soil.unit}
            <span className="farm-card__sensor-trend">
              {getTrendIndicator(farm.sensors.soil.trend)}
            </span>
          </span>
        </div>
        {farm.sensors.light && (
          <div
            className={`farm-card__sensor ${getSensorHealthClass(
              farm.sensors.light.value,
              farm.thresholds?.light
            )}`}
            title="Light"
          >
            <span className="farm-card__sensor-icon">☀️</span>
            <span className="farm-card__sensor-value">
              {Math.round(farm.sensors.light.value)}
              <span className="farm-card__sensor-unit">lux</span>
              <span className="farm-card__sensor-trend">
                {getTrendIndicator(farm.sensors.light.trend)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Footer with last synced and refresh */}
      <div className="farm-card__footer">
        <span className="farm-card__last-seen" title={`Last synced: ${farm.lastSeen}`}>
          {formatLastSeen(farm.lastSeen)}
        </span>
        {onSync && (
          <button
            className={`farm-card__sync-btn ${isCurrentlySyncing ? 'syncing' : ''}`}
            onClick={handleSync}
            disabled={isCurrentlySyncing}
            aria-label="Sync sensors"
            title="Sync sensors from device"
          >
            {isCurrentlySyncing ? '⟳' : '🔄'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FarmCard;
