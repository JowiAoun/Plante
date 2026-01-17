'use client';

/**
 * MuseumGame Component
 * Interactive pixel-art museum where players explore their achievements
 */

import React, { useState, useCallback, useMemo } from 'react';
import { PixelAvatar } from '@/components/PixelAvatar';
import { mockAchievements } from '@/mocks/data';
import { achievementIcons, rarityColors } from '@/data/achievements';
import type { Achievement } from '@/types';
import { useGameLoop } from './useGameLoop';
import type { MuseumLayout, AchievementPedestal, Direction } from './types';
import './MuseumGame.css';

export interface MuseumGameProps {
  /** User's avatar seed */
  avatarSeed: string;
  /** User ID for checking unlocked achievements */
  userId: string;
  /** Optional achievements (defaults to mock data) */
  achievements?: Achievement[];
  /** Owner name (for viewing other users' museums) */
  ownerName?: string;
}

// Museum layout configuration
const createMuseumLayout = (achievements: Achievement[], userId: string): MuseumLayout => {
  const GRID_WIDTH = 16;
  const GRID_HEIGHT = 10;
  const TILE_SIZE = 48;
  
  // Create pedestals for achievements (2 rows of 4)
  const pedestals: AchievementPedestal[] = achievements.slice(0, 8).map((ach, index) => {
    const row = Math.floor(index / 4);
    const col = index % 4;
    
    // Position: row 0 at y=2, row 1 at y=6
    const x = (col + 2) * TILE_SIZE * 1.5 + TILE_SIZE;
    const y = (row === 0 ? 2 : 6) * TILE_SIZE;
    
    return {
      id: `pedestal-${ach.id}`,
      achievementId: ach.id,
      position: { x, y },
      size: { width: 64, height: 80 },
      unlocked: ach.unlockedBy?.includes(userId) ?? false,
    };
  });

  return {
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    tileSize: TILE_SIZE,
    spawnPoint: { x: GRID_WIDTH * TILE_SIZE / 2, y: GRID_HEIGHT * TILE_SIZE / 2 },
    pedestals,
    decorations: [],
  };
};

/**
 * MuseumGame - Interactive museum exploration
 */
export const MuseumGame: React.FC<MuseumGameProps> = ({
  avatarSeed,
  userId,
  achievements = mockAchievements,
  ownerName,
}) => {
  const [activeAchievementId, setActiveAchievementId] = useState<string | null>(null);

  const layout = useMemo(
    () => createMuseumLayout(achievements, userId),
    [achievements, userId]
  );

  const { gameState, gameContainerRef } = useGameLoop({
    layout,
    avatarSeed,
    onAchievementInteract: setActiveAchievementId,
  });

  const activeAchievement = useMemo(() => {
    if (!activeAchievementId) return null;
    return achievements.find((a) => a.id === activeAchievementId) || null;
  }, [activeAchievementId, achievements]);

  const handleTouchStart = useCallback((direction: Direction) => {
    const container = gameContainerRef.current;
    if (container && 'setTouchInput' in container) {
      (container as unknown as { setTouchInput: (d: Direction, p: boolean) => void }).setTouchInput(direction, true);
    }
  }, [gameContainerRef]);

  const handleTouchEnd = useCallback((direction: Direction) => {
    const container = gameContainerRef.current;
    if (container && 'setTouchInput' in container) {
      (container as unknown as { setTouchInput: (d: Direction, p: boolean) => void }).setTouchInput(direction, false);
    }
  }, [gameContainerRef]);

  return (
    <div className="museum-game">
      {/* Navigation header */}
      <div className="museum-game__nav">
        <button 
          className="museum-game__nav-btn"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          ← Back
        </button>
        <button 
          className="museum-game__nav-btn museum-game__nav-btn--switch"
          onClick={() => window.location.href = `/farms/explore/${userId}`}
          aria-label="Go to farm"
        >
          🌾 Visit Farm →
        </button>
      </div>

      {/* Title banner */}
      <div className="museum-game__banner">
        <span className="museum-game__title">🏛️ {ownerName ? `${ownerName.toUpperCase()}'S MUSEUM` : 'YOUR MUSEUM'} 🏛️</span>
      </div>

      <div 
        ref={gameContainerRef}
        className="museum-game__container"
        tabIndex={0}
        role="application"
        aria-label="Museum exploration game. Use arrow keys or WASD to move."
      >
        {/* Background */}
        <div className="museum-game__background" />

        {/* Achievement Pedestals */}
        {layout.pedestals.map((pedestal) => {
          const achievement = achievements.find((a) => a.id === pedestal.achievementId);
          if (!achievement) return null;

          const icon = achievementIcons[achievement.icon as keyof typeof achievementIcons] || '🏆';
          const rarityColor = rarityColors[achievement.rarity];
          const isActive = activeAchievementId === pedestal.achievementId;

          return (
            <div
              key={pedestal.id}
              className={`museum-game__pedestal ${pedestal.unlocked ? 'museum-game__pedestal--unlocked' : 'museum-game__pedestal--locked'} ${isActive ? 'museum-game__pedestal--active' : ''}`}
              style={{
                left: pedestal.position.x,
                top: pedestal.position.y,
                '--rarity-color': rarityColor,
              } as React.CSSProperties}
            >
              <div className="museum-game__pedestal-icon">
                {pedestal.unlocked ? icon : '🔒'}
              </div>
              <div className="museum-game__pedestal-base" />
            </div>
          );
        })}

        {/* Player */}
        <div
          className={`museum-game__player ${gameState.player.isMoving ? 'museum-game__player--moving' : ''}`}
          style={{
            left: gameState.player.position.x - gameState.player.size.width / 2,
            top: gameState.player.position.y - gameState.player.size.height / 2,
          }}
        >
          <div className="museum-game__player-avatar">
            <PixelAvatar
              username={avatarSeed}
              seed={avatarSeed}
              size="medium"
            />
          </div>
        </div>

        {/* Achievement Popup */}
        {activeAchievement && (
          <div className="museum-game__popup">
            <h3 className="museum-game__popup-title">{activeAchievement.title}</h3>
            <p
              className="museum-game__popup-rarity"
              style={{ color: rarityColors[activeAchievement.rarity] }}
            >
              {activeAchievement.rarity}
            </p>
            <p className="museum-game__popup-desc">{activeAchievement.description}</p>
            {!layout.pedestals.find((p) => p.achievementId === activeAchievement.id)?.unlocked && (
              <p className="museum-game__popup-locked">🔒 Not yet unlocked</p>
            )}
          </div>
        )}

        {/* Mobile D-pad */}
        <div className="museum-game__dpad">
          <button
            className="museum-game__dpad-btn museum-game__dpad-btn--up"
            onTouchStart={() => handleTouchStart('up')}
            onTouchEnd={() => handleTouchEnd('up')}
            onMouseDown={() => handleTouchStart('up')}
            onMouseUp={() => handleTouchEnd('up')}
            aria-label="Move up"
          >▲</button>
          <button
            className="museum-game__dpad-btn museum-game__dpad-btn--down"
            onTouchStart={() => handleTouchStart('down')}
            onTouchEnd={() => handleTouchEnd('down')}
            onMouseDown={() => handleTouchStart('down')}
            onMouseUp={() => handleTouchEnd('down')}
            aria-label="Move down"
          >▼</button>
          <button
            className="museum-game__dpad-btn museum-game__dpad-btn--left"
            onTouchStart={() => handleTouchStart('left')}
            onTouchEnd={() => handleTouchEnd('left')}
            onMouseDown={() => handleTouchStart('left')}
            onMouseUp={() => handleTouchEnd('left')}
            aria-label="Move left"
          >◀</button>
          <button
            className="museum-game__dpad-btn museum-game__dpad-btn--right"
            onTouchStart={() => handleTouchStart('right')}
            onTouchEnd={() => handleTouchEnd('right')}
            onMouseDown={() => handleTouchStart('right')}
            onMouseUp={() => handleTouchEnd('right')}
            aria-label="Move right"
          >▶</button>
        </div>
      </div>

      <div className="museum-game__instructions">
        Use <strong>WASD</strong> or <strong>Arrow keys</strong> to move • Walk near achievements to view details
      </div>
    </div>
  );
};

export default MuseumGame;
