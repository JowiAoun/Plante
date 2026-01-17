/**
 * Sprite Sheet Loader Hook
 * Loads and manages sprite sheet assets for the pixel-art UI
 */

import { useState, useEffect, useCallback } from 'react';

// Sprite frame definition
export interface SpriteFrame {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
}

// Animation definition
export interface SpriteAnimation {
  frames: string[];
  frameRate: number;
  loop: boolean;
}

// Sprite sheet metadata
export interface SpriteSheetMeta {
  name: string;
  category: string;
  tileSize?: number;
  frames: SpriteFrame[];
  anchor: { x: number; y: number };
  animations: Record<string, SpriteAnimation>;
}

// Hook state
interface UseSpriteSheetState {
  meta: SpriteSheetMeta | null;
  image: HTMLImageElement | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to load and use sprite sheets
 * 
 * @param sheetName - Name of the sprite sheet (without extension)
 * @returns Sprite sheet state and utility functions
 * 
 * @example
 * ```tsx
 * const { getFrame, drawFrame, loading } = useSpriteSheet('sheet_icons_16');
 * 
 * if (!loading) {
 *   const frame = getFrame('temp');
 *   // Use frame.x, frame.y, frame.width, frame.height
 * }
 * ```
 */
export function useSpriteSheet(sheetName: string) {
  const [state, setState] = useState<UseSpriteSheetState>({
    meta: null,
    image: null,
    loading: true,
    error: null,
  });

  // Load sprite sheet metadata and image
  useEffect(() => {
    let cancelled = false;

    async function loadSheet() {
      try {
        setState(s => ({ ...s, loading: true, error: null }));

        // Load metadata JSON
        const metaResponse = await fetch(`/assets/sheets/${sheetName}.json`);
        if (!metaResponse.ok) {
          throw new Error(`Failed to load sprite sheet metadata: ${sheetName}`);
        }
        const meta: SpriteSheetMeta = await metaResponse.json();

        // Load sprite sheet image
        const image = new Image();
        image.src = `/assets/sheets/${sheetName}.png`;
        
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error(`Failed to load sprite sheet image: ${sheetName}`));
        });

        if (!cancelled) {
          setState({ meta, image, loading: false, error: null });
        }
      } catch (error) {
        if (!cancelled) {
          setState(s => ({ 
            ...s, 
            loading: false, 
            error: error instanceof Error ? error : new Error('Unknown error') 
          }));
        }
      }
    }

    loadSheet();

    return () => {
      cancelled = true;
    };
  }, [sheetName]);

  // Get a specific frame by name
  const getFrame = useCallback((frameName: string): SpriteFrame | null => {
    if (!state.meta) return null;
    return state.meta.frames.find(f => f.name === frameName) || null;
  }, [state.meta]);

  // Get animation definition
  const getAnimation = useCallback((animationName: string): SpriteAnimation | null => {
    if (!state.meta) return null;
    return state.meta.animations[animationName] || null;
  }, [state.meta]);

  // Draw a frame to a canvas context
  const drawFrame = useCallback((
    ctx: CanvasRenderingContext2D,
    frameName: string,
    x: number,
    y: number,
    scale: number = 1
  ) => {
    const frame = getFrame(frameName);
    if (!frame || !state.image) return;

    ctx.imageSmoothingEnabled = false; // Pixel-perfect rendering
    ctx.drawImage(
      state.image,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      x,
      y,
      frame.width * scale,
      frame.height * scale
    );
  }, [state.image, getFrame]);

  // Get CSS background position for a frame (for CSS sprites)
  const getBackgroundPosition = useCallback((frameName: string): string | null => {
    const frame = getFrame(frameName);
    if (!frame) return null;
    return `-${frame.x}px -${frame.y}px`;
  }, [getFrame]);

  return {
    ...state,
    getFrame,
    getAnimation,
    drawFrame,
    getBackgroundPosition,
  };
}

export default useSpriteSheet;
