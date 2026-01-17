/**
 * Pixel Animation Utilities
 * Helpers for pixel-friendly animations using CSS steps()
 */

/**
 * Generate CSS animation timing for pixel-style stepped animation
 * 
 * @param frames - Number of frames in the animation
 * @param fps - Frames per second (4-12 recommended for pixel art)
 * @returns CSS animation timing string
 * 
 * @example
 * ```tsx
 * const timing = pixelStepTiming(4, 8);
 * // Returns: "0.5s steps(4) infinite"
 * ```
 */
export function pixelStepTiming(frames: number, fps: number, loop: boolean = true): string {
  const duration = frames / fps;
  return `${duration}s steps(${frames}) ${loop ? 'infinite' : 'forwards'}`;
}

/**
 * Calculate sprite animation keyframes
 * 
 * @param frameCount - Total number of frames
 * @param frameWidth - Width of each frame in pixels
 * @returns CSS keyframes string for background-position animation
 */
export function spriteKeyframes(frameCount: number, frameWidth: number): string {
  const steps: string[] = [];
  
  for (let i = 0; i <= frameCount; i++) {
    const percent = (i / frameCount) * 100;
    const position = -i * frameWidth;
    steps.push(`${percent}% { background-position-x: ${position}px; }`);
  }
  
  return steps.join('\n');
}

/**
 * CSS class generator for pixel-safe transforms
 * Ensures transforms use integer pixel values
 * 
 * @param x - X translation in pixels
 * @param y - Y translation in pixels  
 * @param scale - Scale multiplier (1 or 2 recommended)
 * @returns CSS transform string with integer values
 */
export function pixelTransform(x: number, y: number, scale: number = 1): string {
  // Round to nearest pixel
  const px = Math.round(x);
  const py = Math.round(y);
  const s = Math.round(scale);
  
  return `translate(${px}px, ${py}px) scale(${s})`;
}

/**
 * Recommended frame rates for different animation types
 */
export const PIXEL_FRAME_RATES = {
  /** Idle loops, breathing, subtle movement */
  IDLE: 4,
  /** Walking, simple actions */
  NORMAL: 6,
  /** Running, quick actions */
  ACTION: 8,
  /** Fast effects, impacts */
  FAST: 12,
} as const;

/**
 * CSS custom properties for pixel animations
 * Use these in CSS files for consistent timing
 */
export const PIXEL_ANIMATION_VARS = `
  --anim-idle: 0.5s steps(4) infinite;
  --anim-normal: 0.33s steps(6) infinite;
  --anim-action: 0.25s steps(8) infinite;
  --anim-fast: 0.17s steps(12) infinite;
  --anim-once: forwards;
`;

export default {
  pixelStepTiming,
  spriteKeyframes,
  pixelTransform,
  PIXEL_FRAME_RATES,
};
