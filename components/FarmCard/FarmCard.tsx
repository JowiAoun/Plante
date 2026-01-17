/**
 * FarmCard Component
 * Tile representing a farm unit on dashboard
 */

import React from 'react';
import type { Farm } from '@/types';
import './FarmCard.css';

export interface FarmCardProps {
  /** Farm data */
  farm: Farm;
  /** Click handler for selecting the farm */
  onSelect?: (farm: Farm) => void;
  /** Whether this card is currently selected */
  selected?: boolean;
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
 * FarmCard displays a farm tile with status, sensors, and actions
 */
export const FarmCard: React.FC<FarmCardProps> = ({
  farm,
  onSelect,
  selected = false,
}) => {
  const handleClick = () => {
    onSelect?.(farm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(farm);
    }
  };

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
        <div className="farm-card__sensor" title="Temperature">
          <span className="farm-card__sensor-icon">🌡️</span>
          <span className="farm-card__sensor-value">
            {farm.sensors.temp.value}{farm.sensors.temp.unit}
          </span>
        </div>
        <div className="farm-card__sensor" title="Humidity">
          <span className="farm-card__sensor-icon">💧</span>
          <span className="farm-card__sensor-value">
            {farm.sensors.humidity.value}{farm.sensors.humidity.unit}
          </span>
        </div>
        <div className="farm-card__sensor" title="Soil Moisture">
          <span className="farm-card__sensor-icon">🌍</span>
          <span className="farm-card__sensor-value">
            {farm.sensors.soil.value}{farm.sensors.soil.unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FarmCard;
