'use client';

/**
 * MuseumGame Component
 * Interactive pixel-art museum where players explore their achievements
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { PixelAvatar } from '@/components/PixelAvatar';
import { Joystick, type JoystickOutput } from '@/components/Joystick';
import { EmoteMenu, EMOTES, type EmoteType } from '@/components/EmoteMenu';
import { mockAchievements } from '@/mocks/data';
import { achievementIcons, rarityColors } from '@/data/achievements';
import type { Achievement } from '@/types';
import { useGameLoop } from './useGameLoop';
import type { MuseumLayout, AchievementPedestal } from './types';
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

// Game dimensions
const GAME_WIDTH = 768;
const GAME_HEIGHT = 480;

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
  const [viewportWidth, setViewportWidth] = useState(GAME_WIDTH); // Default to full width for SSR
  const [showEmoteMenu, setShowEmoteMenu] = useState(false);
  const [currentEmote, setCurrentEmote] = useState<EmoteType | null>(null);
  const [speechText, setSpeechText] = useState<string | null>(null);

  const WAVE_GREETINGS = ['Hi!', 'Hello!', 'Hey!'];

  // Update viewport width on client
  useEffect(() => {
    const updateWidth = () => setViewportWidth(Math.min(window.innerWidth, GAME_WIDTH));
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Emote keyboard handler
  useEffect(() => {
    const handleEmoteKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'g') {
        setShowEmoteMenu(prev => !prev);
        return;
      }
      if (showEmoteMenu && e.key >= '1' && e.key <= '6') {
        const index = parseInt(e.key) - 1;
        if (EMOTES[index]) {
          handleEmoteSelect(EMOTES[index].id);
        }
      }
    };
    window.addEventListener('keydown', handleEmoteKey);
    return () => window.removeEventListener('keydown', handleEmoteKey);
  }, [showEmoteMenu]);

  const handleEmoteSelect = useCallback((emote: EmoteType) => {
    setCurrentEmote(emote);
    setShowEmoteMenu(false);
    
    // Show speech bubble for wave emote
    if (emote === 'wave') {
      const greeting = WAVE_GREETINGS[Math.floor(Math.random() * WAVE_GREETINGS.length)];
      setSpeechText(greeting);
      setTimeout(() => setSpeechText(null), 2000);
    }
    
    setTimeout(() => setCurrentEmote(null), 1200);
  }, []);

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
        <span className="museum-game__title">{ownerName ? `${ownerName.toUpperCase()}'S MUSEUM` : 'YOUR MUSEUM'}</span>
      </div>

      <div 
        ref={gameContainerRef}
        className="museum-game__container"
        tabIndex={0}
        role="application"
        aria-label="Museum exploration game. Use arrow keys or WASD to move."
      >
        {/* Camera wrapper for mobile */}
        <div 
          className="museum-game__camera"
          style={{
            '--camera-x': `${cameraOffset.x}px`,
            '--camera-y': `${cameraOffset.y}px`,
          } as React.CSSProperties}
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
            {/* Speech bubble */}
            {speechText && (
              <div className="museum-game__speech-bubble">
                {speechText}
              </div>
            )}
            <div className="museum-game__player-avatar">
              <PixelAvatar
                username={avatarSeed}
                seed={avatarSeed}
                size="medium"
                emote={currentEmote}
              />
            </div>
          </div>

          {/* Emote Menu */}
          <EmoteMenu
            isOpen={showEmoteMenu}
            onSelect={handleEmoteSelect}
            onClose={() => setShowEmoteMenu(false)}
          />
        </div>

        {/* Mobile Joystick */}
        <div className="museum-game__joystick">
          <Joystick
            onMove={handleJoystickMove}
            onStop={handleJoystickStop}
            size={100}
          />
        </div>
      </div>

      {/* Achievement popup - outside container for mobile */}
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

      <div className="museum-game__instructions">
        Use <strong>WASD</strong> or <strong>Arrow keys</strong> to move • Walk near achievements to view details
      </div>
    </div>
  );
};

export default MuseumGame;
