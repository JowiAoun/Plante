/**
 * useGameLoop Hook
 * Manages game loop, input handling, and player movement
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Position, Direction, InputState, GameState, MuseumLayout, AchievementPedestal } from './types';

const PLAYER_SPEED = 4; // pixels per frame
const INTERACTION_DISTANCE = 48; // pixels

interface UseGameLoopProps {
  layout: MuseumLayout;
  avatarSeed: string;
  onAchievementInteract?: (achievementId: string | null) => void;
}

interface UseGameLoopReturn {
  gameState: GameState;
  gameContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Check if player can move to a position (collision detection)
 */
const canMoveTo = (
  position: Position,
  layout: MuseumLayout,
  playerSize: number
): boolean => {
  const halfSize = playerSize / 2;
  const gameWidth = layout.gridWidth * layout.tileSize;
  const gameHeight = layout.gridHeight * layout.tileSize;
  
  // Wall boundaries (with some padding for the top bar)
  const wallPadding = layout.tileSize;
  
  if (position.x - halfSize < wallPadding) return false;
  if (position.x + halfSize > gameWidth - wallPadding) return false;
  if (position.y - halfSize < wallPadding * 1.5) return false;
  if (position.y + halfSize > gameHeight - wallPadding) return false;
  
  return true;
};

/**
 * Find nearby achievement pedestal
 */
const findNearbyAchievement = (
  playerPos: Position,
  pedestals: AchievementPedestal[]
): string | null => {
  for (const pedestal of pedestals) {
    const dx = playerPos.x - (pedestal.position.x + pedestal.size.width / 2);
    const dy = playerPos.y - (pedestal.position.y + pedestal.size.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < INTERACTION_DISTANCE) {
      return pedestal.achievementId;
    }
  }
  return null;
};

/**
 * Get direction from input state
 */
const getDirection = (input: InputState): Direction => {
  if (input.up) return 'up';
  if (input.down) return 'down';
  if (input.left) return 'left';
  if (input.right) return 'right';
  return null;
};

export function useGameLoop({
  layout,
  avatarSeed,
  onAchievementInteract,
}: UseGameLoopProps): UseGameLoopReturn {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputState>({ up: false, down: false, left: false, right: false });
  const animationFrameRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    player: {
      id: 'player',
      position: { ...layout.spawnPoint },
      size: { width: 48, height: 48 },
      direction: null,
      isMoving: false,
      avatarSeed,
    },
    activeAchievement: null,
    isInitialized: false,
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.up = true;
          e.preventDefault();
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.down = true;
          e.preventDefault();
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = true;
          e.preventDefault();
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = true;
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.up = false;
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.down = false;
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const input = inputRef.current;
      const isMoving = input.up || input.down || input.left || input.right;
      const direction = getDirection(input);

      setGameState((prev) => {
        let newX = prev.player.position.x;
        let newY = prev.player.position.y;

        if (input.up) newY -= PLAYER_SPEED;
        if (input.down) newY += PLAYER_SPEED;
        if (input.left) newX -= PLAYER_SPEED;
        if (input.right) newX += PLAYER_SPEED;

        const newPosition = { x: newX, y: newY };

        // Check collision
        if (!canMoveTo(newPosition, layout, prev.player.size.width)) {
          newPosition.x = prev.player.position.x;
          newPosition.y = prev.player.position.y;
        }

        // Check nearby achievements
        const nearbyAchievement = findNearbyAchievement(newPosition, layout.pedestals);
        
        if (nearbyAchievement !== prev.activeAchievement) {
          onAchievementInteract?.(nearbyAchievement);
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            position: newPosition,
            direction: direction || prev.player.direction,
            isMoving,
          },
          activeAchievement: nearbyAchievement,
          isInitialized: true,
        };
      });

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [layout, onAchievementInteract]);

  // Set touch input from D-pad
  const setTouchInput = useCallback((direction: Direction, pressed: boolean) => {
    if (direction === 'up') inputRef.current.up = pressed;
    if (direction === 'down') inputRef.current.down = pressed;
    if (direction === 'left') inputRef.current.left = pressed;
    if (direction === 'right') inputRef.current.right = pressed;
  }, []);

  // Attach touch handler to ref
  useEffect(() => {
    const container = gameContainerRef.current;
    if (!container) return;

    // Store setTouchInput on the container for D-pad access
    (container as unknown as { setTouchInput: typeof setTouchInput }).setTouchInput = setTouchInput;
  }, [setTouchInput]);

  return {
    gameState,
    gameContainerRef,
  };
}

export default useGameLoop;
