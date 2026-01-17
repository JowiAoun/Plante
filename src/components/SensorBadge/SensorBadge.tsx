/**
 * SensorBadge Component
 * Small HUD showing sensor readings (temperature, humidity, soil)
 */

import React from 'react';
import './SensorBadge.css';

export type SensorType = 'temp' | 'humidity' | 'soil' | 'light' | 'water';
export type TrendDirection = 'up' | 'down' | 'stable';

export interface SensorBadgeProps {
  /** Type of sensor */
  type: SensorType;
  /** Current value */
  value: number;
  /** Unit of measurement */
  unit: string;
  /** Trend direction */
  trend?: TrendDirection;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Show label */
  showLabel?: boolean;
}

// Sensor icons (emoji placeholders)
const sensorIcons: Record<SensorType, string> = {
  temp: '🌡️',
  humidity: '💧',
  soil: '🌍',
  light: '☀️',
  water: '🚿',
};

// Sensor labels
const sensorLabels: Record<SensorType, string> = {
  temp: 'Temperature',
  humidity: 'Humidity',
  soil: 'Soil Moisture',
  light: 'Light',
  water: 'Water Level',
};

// Trend indicators
const trendIndicators: Record<TrendDirection, string> = {
  up: '▲',
  down: '▼',
  stable: '●',
};

/**
 * Get status class based on sensor type and value
 */
const getStatusClass = (type: SensorType, value: number): string => {
  switch (type) {
    case 'temp':
      if (value < 15 || value > 35) return 'status-critical';
      if (value < 18 || value > 30) return 'status-warning';
      return 'status-healthy';
    case 'humidity':
      if (value < 30 || value > 80) return 'status-critical';
      if (value < 40 || value > 70) return 'status-warning';
      return 'status-healthy';
    case 'soil':
      if (value < 20) return 'status-critical';
      if (value < 30 || value > 70) return 'status-warning';
      return 'status-healthy';
    default:
      return 'status-healthy';
  }
};

/**
 * SensorBadge - Displays sensor reading with trend indicator
 */
export const SensorBadge: React.FC<SensorBadgeProps> = ({
  type,
  value,
  unit,
  trend = 'stable',
  size = 'medium',
  showLabel = false,
}) => {
  const statusClass = getStatusClass(type, value);
  const icon = sensorIcons[type];
  const label = sensorLabels[type];
  const trendIcon = trendIndicators[trend];

  return (
    <div
      className={`sensor-badge sensor-badge--${size} ${statusClass}`}
      title={`${label}: ${value}${unit}`}
      role="status"
      aria-label={`${label}: ${value}${unit}, trend ${trend}`}
    >
      <span className="sensor-badge__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="sensor-badge__content">
        {showLabel && (
          <span className="sensor-badge__label">{label}</span>
        )}
        <span className="sensor-badge__value">
          {value}
          <span className="sensor-badge__unit">{unit}</span>
        </span>
      </div>
      <span 
        className={`sensor-badge__trend sensor-badge__trend--${trend}`}
        aria-hidden="true"
      >
        {trendIcon}
      </span>
    </div>
  );
};

export default SensorBadge;
