/**
 * Farm Game Types
 * Type definitions for the interactive farm game
 */

import type { Farm } from '@/types';

/** 2D position on the game grid */
export interface Position {
  x: number;
  y: number;
}

/** Movement direction */
export type Direction = 'up' | 'down' | 'left' | 'right' | null;

/** Game entity base */
export interface GameEntity {
  id: string;
  position: Position;
  size: { width: number; height: number };
}

/** Player state */
export interface PlayerState extends GameEntity {
  direction: Direction;
  isMoving: boolean;
  avatarSeed: string;
}

/** Farm spot in the game */
export interface FarmSpot extends GameEntity {
  farm: Farm;
}

/** Farm game layout configuration */
export interface FarmLayout {
  /** Grid dimensions in tiles */
  gridWidth: number;
  gridHeight: number;
  /** Tile size in pixels */
  tileSize: number;
  /** Player spawn position */
  spawnPoint: Position;
  /** Farm spot positions */
  farmSpots: FarmSpot[];
}

/** Input state for controls */
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/** Game state */
export interface FarmGameState {
  player: PlayerState;
  activeFarm: string | null;
  isInitialized: boolean;
}
