/**
 * useFarmGameLoop Hook
 * Manages game loop, input handling, and player movement for farm game
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Position, Direction, InputState, FarmGameState, FarmLayout, FarmSpot } from './types';

const BASE_PLAYER_SPEED = 4;
const MAX_PLAYER_SPEED = 6;
const INTERACTION_DISTANCE = 60;

interface JoystickInput {
  x: number;  // -1 to 1
  y: number;  // -1 to 1
  magnitude: number;  // 0 to 1
}

interface UseFarmGameLoopProps {
  layout: FarmLayout;
  avatarSeed: string;
  onFarmInteract?: (farmId: string | null) => void;
}

interface UseFarmGameLoopReturn {
  gameState: FarmGameState;
  gameContainerRef: React.RefObject<HTMLDivElement | null>;
}

const canMoveTo = (
  position: Position,
  layout: FarmLayout,
  playerSize: number
): boolean => {
  const halfSize = playerSize / 2;
  const gameWidth = layout.gridWidth * layout.tileSize;
  const gameHeight = layout.gridHeight * layout.tileSize;
  
  const wallPadding = 20;
  
  if (position.x - halfSize < wallPadding) return false;
  if (position.x + halfSize > gameWidth - wallPadding) return false;
  if (position.y - halfSize < wallPadding) return false;
  if (position.y + halfSize > gameHeight - wallPadding) return false;
  
  return true;
};

const findNearbyFarm = (
  playerPos: Position,
  farmSpots: FarmSpot[]
): string | null => {
  for (const spot of farmSpots) {
    const dx = playerPos.x - (spot.position.x + spot.size.width / 2);
    const dy = playerPos.y - (spot.position.y + spot.size.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < INTERACTION_DISTANCE) {
      return spot.farm.id;
    }
  }
  return null;
};

const getDirection = (input: InputState): Direction => {
  if (input.up) return 'up';
  if (input.down) return 'down';
  if (input.left) return 'left';
  if (input.right) return 'right';
  return null;
};

export function useFarmGameLoop({
  layout,
  avatarSeed,
  onFarmInteract,
}: UseFarmGameLoopProps): UseFarmGameLoopReturn {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputState>({ up: false, down: false, left: false, right: false });
  const joystickRef = useRef<JoystickInput>({ x: 0, y: 0, magnitude: 0 });
  const animationFrameRef = useRef<number | null>(null);
  
  const [gameState, setGameState] = useState<FarmGameState>({
    player: {
      id: 'player',
      position: { ...layout.spawnPoint },
      size: { width: 48, height: 48 },
      direction: null,
      isMoving: false,
      avatarSeed,
    },
    activeFarm: null,
    isInitialized: false,
  });

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

  useEffect(() => {
    const gameLoop = () => {
      const input = inputRef.current;
      const isMoving = input.up || input.down || input.left || input.right;
      const direction = getDirection(input);

      setGameState((prev) => {
        let newX = prev.player.position.x;
        let newY = prev.player.position.y;
        
        const joystick = joystickRef.current;
        const hasJoystickInput = joystick.magnitude > 0.1;
        
        if (hasJoystickInput) {
          // Variable speed based on joystick magnitude
          const speed = BASE_PLAYER_SPEED + (MAX_PLAYER_SPEED - BASE_PLAYER_SPEED) * joystick.magnitude;
          newX += joystick.x * speed;
          newY += joystick.y * speed;
        } else {
          // D-pad/keyboard input
          if (input.up) newY -= BASE_PLAYER_SPEED;
          if (input.down) newY += BASE_PLAYER_SPEED;
          if (input.left) newX -= BASE_PLAYER_SPEED;
          if (input.right) newX += BASE_PLAYER_SPEED;
        }

        const newPosition = { x: newX, y: newY };

        if (!canMoveTo(newPosition, layout, prev.player.size.width)) {
          newPosition.x = prev.player.position.x;
          newPosition.y = prev.player.position.y;
        }

        const nearbyFarm = findNearbyFarm(newPosition, layout.farmSpots);
        
        if (nearbyFarm !== prev.activeFarm) {
          onFarmInteract?.(nearbyFarm);
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            position: newPosition,
            direction: direction || prev.player.direction,
            isMoving,
          },
          activeFarm: nearbyFarm,
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
  }, [layout, onFarmInteract]);

  const setTouchInput = useCallback((direction: Direction, pressed: boolean) => {
    if (direction === 'up') inputRef.current.up = pressed;
    if (direction === 'down') inputRef.current.down = pressed;
    if (direction === 'left') inputRef.current.left = pressed;
    if (direction === 'right') inputRef.current.right = pressed;
  }, []);

  const setJoystickInput = useCallback((x: number, y: number, magnitude: number) => {
    joystickRef.current = { x, y, magnitude };
  }, []);

  useEffect(() => {
    const container = gameContainerRef.current;
    if (!container) return;
    (container as unknown as { setTouchInput: typeof setTouchInput; setJoystickInput: typeof setJoystickInput }).setTouchInput = setTouchInput;
    (container as unknown as { setTouchInput: typeof setTouchInput; setJoystickInput: typeof setJoystickInput }).setJoystickInput = setJoystickInput;
  }, [setTouchInput, setJoystickInput]);

  return {
    gameState,
    gameContainerRef,
  };
}

export default useFarmGameLoop;
