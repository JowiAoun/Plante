'use client';

/**
 * FarmGame Component
 * Interactive pixel-art farm where players explore user's farms
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { PixelAvatar } from '@/components/PixelAvatar';
import { Joystick, type JoystickOutput } from '@/components/Joystick';
import type { Farm, User } from '@/types';
import { useFarmGameLoop } from './useFarmGameLoop';
import type { FarmLayout, FarmSpot } from './types';
import './FarmGame.css';

export interface FarmGameProps {
  /** User's avatar seed */
  avatarSeed: string;
  /** Owner of the farm */
  owner: User;
  /** User's farms */
  farms: Farm[];
  /** Whether viewing own farms */
  isOwnFarm?: boolean;
}

// Farm icons based on name
const getFarmIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('herb')) return '🌿';
  if (lower.includes('pepper')) return '🌶️';
  if (lower.includes('succulent')) return '🌵';
  return '🌱';
};

// Status colors
const getStatusColor = (status: Farm['status']): string => {
  switch (status) {
    case 'healthy': return 'var(--color-healthy)';
    case 'warning': return 'var(--color-warning)';
    case 'critical': return 'var(--color-critical)';
    default: return 'var(--color-text-muted)';
  }
};

// Game dimensions
const GAME_WIDTH = 768;
const GAME_HEIGHT = 480;

// Create farm layout based on farms (centered to avoid barn)
const createFarmLayout = (farms: Farm[]): FarmLayout => {
  const GRID_WIDTH = 16;
  const GRID_HEIGHT = 10;
  const TILE_SIZE = 48;
  
  // Game area is 768x480, barn is on left side
  // Position farms in center-right area (2 rows of 4)
  const farmSpots: FarmSpot[] = farms.slice(0, 8).map((farm, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    
    // Shifted right to avoid barn - start at x=280, spacing of 110
    const x = 280 + col * 110;
    // Row 0 at y=200, row 1 at y=340
    const y = row === 0 ? 200 : 340;
    
    return {
      id: `farm-${farm.id}`,
      farm,
      position: { x, y },
      size: { width: 64, height: 80 },
    };
  });

  return {
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    tileSize: TILE_SIZE,
    spawnPoint: { x: 150, y: 250 }, // Start at barn entrance
    farmSpots,
  };
};

/**
 * FarmGame - Interactive farm exploration
 */
export const FarmGame: React.FC<FarmGameProps> = ({
  avatarSeed,
  owner,
  farms,
  isOwnFarm = true,
}) => {
  const [activeFarmId, setActiveFarmId] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState(GAME_WIDTH); // Default to full width for SSR

  // Update viewport width on client
  useEffect(() => {
    const updateWidth = () => setViewportWidth(Math.min(window.innerWidth, GAME_WIDTH));
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const layout = useMemo(() => createFarmLayout(farms), [farms]);

  const { gameState, gameContainerRef } = useFarmGameLoop({
    layout,
    avatarSeed,
    onFarmInteract: setActiveFarmId,
  });

  const activeFarm = useMemo(() => {
    if (!activeFarmId) return null;
    return farms.find((f) => f.id === activeFarmId) || null;
  }, [activeFarmId, farms]);

  // Joystick handlers
  const handleJoystickMove = useCallback((output: JoystickOutput) => {
    const container = gameContainerRef.current;
    if (container && 'setJoystickInput' in container) {
      (container as unknown as { setJoystickInput: (x: number, y: number, m: number) => void })
        .setJoystickInput(output.x, output.y, output.magnitude);
    }
  }, [gameContainerRef]);

  const handleJoystickStop = useCallback(() => {
    const container = gameContainerRef.current;
    if (container && 'setJoystickInput' in container) {
      (container as unknown as { setJoystickInput: (x: number, y: number, m: number) => void })
        .setJoystickInput(0, 0, 0);
    }
  }, [gameContainerRef]);

  // Calculate camera offset for mobile (center on player)
  const cameraOffset = useMemo(() => {
    const playerX = gameState.player.position.x;
    const playerY = gameState.player.position.y;
    const viewportHeight = 280;
    
    // Center the viewport on the player
    let offsetX = viewportWidth / 2 - playerX;
    let offsetY = viewportHeight / 2 - playerY;
    
    // Clamp to prevent showing outside game bounds
    offsetX = Math.min(0, Math.max(offsetX, viewportWidth - GAME_WIDTH));
    offsetY = Math.min(0, Math.max(offsetY, viewportHeight - GAME_HEIGHT));
    
    return { x: offsetX, y: offsetY };
  }, [gameState.player.position, viewportWidth]);

  return (
    <div className="farm-game">
      {/* Navigation header */}
      <div className="farm-game__nav">
        <button 
          className="farm-game__nav-btn"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          ← Back
        </button>
        <button 
          className="farm-game__nav-btn farm-game__nav-btn--switch"
          onClick={() => window.location.href = `/museums/explore/${owner.id}`}
          aria-label="Go to museum"
        >
          🏛️ Visit Museum →
        </button>
      </div>

      {/* Title banner */}
      <div className="farm-game__banner">
        <span className="farm-game__title">{isOwnFarm ? 'YOUR FARM' : `${owner.displayName.toUpperCase()}'S FARM`}</span>
      </div>

      <div 
        ref={gameContainerRef}
        className="farm-game__container"
        tabIndex={0}
        role="application"
        aria-label="Farm exploration game. Use arrow keys or WASD to move."
      >
        {/* Camera wrapper for mobile */}
        <div 
          className="farm-game__camera"
          style={{
            '--camera-x': `${cameraOffset.x}px`,
            '--camera-y': `${cameraOffset.y}px`,
          } as React.CSSProperties}
        >
          {/* Background */}
          <div className="farm-game__background" />

          {/* Farm spots */}
          {layout.farmSpots.map((spot) => {
            const isActive = activeFarmId === spot.farm.id;
            const icon = getFarmIcon(spot.farm.name);

            return (
              <div
                key={spot.id}
                className={`farm-game__farm-spot farm-game__farm-spot--${spot.farm.status} ${isActive ? 'farm-game__farm-spot--active' : ''}`}
                style={{
                  left: spot.position.x,
                  top: spot.position.y,
                }}
              >
                <div className="farm-game__farm-icon">{icon}</div>
                <span className="farm-game__farm-label">{spot.farm.name}</span>
              </div>
            );
          })}

          {/* Player */}
          <div
            className={`farm-game__player ${gameState.player.isMoving ? 'farm-game__player--moving' : ''}`}
            style={{
              left: gameState.player.position.x - gameState.player.size.width / 2,
              top: gameState.player.position.y - gameState.player.size.height / 2,
            }}
          >
            <div className="farm-game__player-avatar">
              <PixelAvatar
                username={avatarSeed}
                seed={avatarSeed}
                size="medium"
              />
            </div>
          </div>
        </div>

        {/* Mobile Joystick */}
        <div className="farm-game__joystick">
          <Joystick
            onMove={handleJoystickMove}
            onStop={handleJoystickStop}
            size={100}
          />
        </div>
      </div>

      {/* Farm info popup - outside container for mobile */}
      {activeFarm && (
        <div className="farm-game__popup">
          <div className="farm-game__popup-header">
            <span className="farm-game__popup-icon">{getFarmIcon(activeFarm.name)}</span>
            <h3 className="farm-game__popup-title">{activeFarm.name}</h3>
          </div>
          <p 
            className="farm-game__popup-status"
            style={{ color: getStatusColor(activeFarm.status) }}
          >
            {activeFarm.status === 'healthy' ? '✓ Healthy' : 
             activeFarm.status === 'warning' ? '⚠ Needs Attention' : 
             '⚠ Critical'}
          </p>
          <div className="farm-game__popup-sensors">
            <span className="farm-game__popup-sensor">
              <span className="farm-game__popup-sensor-icon">🌡️</span>
              {activeFarm.sensors.temp.value}{activeFarm.sensors.temp.unit}
            </span>
            <span className="farm-game__popup-sensor">
              <span className="farm-game__popup-sensor-icon">💧</span>
              {activeFarm.sensors.humidity.value}{activeFarm.sensors.humidity.unit}
            </span>
            <span className="farm-game__popup-sensor">
              <span className="farm-game__popup-sensor-icon">🌱</span>
              {activeFarm.sensors.soil.value}{activeFarm.sensors.soil.unit}
            </span>
          </div>
          {isOwnFarm && (
            <div className="farm-game__popup-action">
              <button
                className="farm-game__popup-btn"
                onClick={() => window.location.href = `/farms/${activeFarm.id}`}
              >
                Go to Farm →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="farm-game__instructions">
        Use <strong>WASD</strong> or <strong>Arrow keys</strong> to explore • Walk near plants to view details
      </div>
    </div>
  );
};

export default FarmGame;
