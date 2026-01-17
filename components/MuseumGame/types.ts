/**
 * Museum Game Types
 * Type definitions for the interactive museum game
 */

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

/** Achievement pedestal in the museum */
export interface AchievementPedestal extends GameEntity {
  achievementId: string;
  unlocked: boolean;
}

/** Museum layout configuration */
export interface MuseumLayout {
  /** Grid dimensions in tiles */
  gridWidth: number;
  gridHeight: number;
  /** Tile size in pixels */
  tileSize: number;
  /** Player spawn position */
  spawnPoint: Position;
  /** Achievement pedestal positions */
  pedestals: AchievementPedestal[];
  /** Decorative elements */
  decorations: Array<{
    type: 'plant' | 'rug' | 'statue';
    position: Position;
  }>;
}

/** Input state for controls */
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/** Game state */
export interface GameState {
  player: PlayerState;
  activeAchievement: string | null;
  isInitialized: boolean;
}
