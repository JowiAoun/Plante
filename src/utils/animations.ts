/**
 * Pixel Animation Library
 * Utilities and presets for pixel-friendly animations
 */

import type { Variants, Transition } from 'framer-motion';

// ============================================
// PIXEL STEP TIMING
// ============================================

/**
 * CSS steps() timing function for frame-based animations
 * @param frames - Number of frames
 * @param fps - Frames per second
 */
export function pixelStepTiming(frames: number, fps: number = 8): string {
  const duration = frames / fps;
  return `${duration.toFixed(2)}s steps(${frames})`;
}

/**
 * Framer Motion transition with linear timing
 * Note: Framer Motion doesn't support CSS steps() directly
 */
export function pixelStepTransition(frames: number, fps: number = 8): Transition {
  return {
    duration: frames / fps,
    ease: 'linear',
  };
}

// ============================================
// BUTTON ANIMATIONS
// ============================================

/**
 * 2-frame button press animation
 */
export const buttonPressVariants: Variants = {
  idle: { scale: 1, y: 0 },
  pressed: { scale: 0.95, y: 2 },
};

export const buttonPressTransition: Transition = {
  type: 'tween',
  duration: 0.05,
  ease: 'easeOut',
};

// ============================================
// NOTIFICATION ANIMATIONS
// ============================================

/**
 * Pixel slide down for dropdowns
 */
export const slideDownVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -8,
    scaleY: 0.9,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scaleY: 1,
  },
  exit: { 
    opacity: 0, 
    y: -4,
    scaleY: 0.95,
  },
};

export const slideDownTransition: Transition = {
  type: 'tween',
  duration: 0.15,
  ease: 'easeOut',
};

// ============================================
// MODAL ANIMATIONS
// ============================================

/**
 * Level-up modal pop animation
 */
export const modalPopVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
  },
};

export const modalPopTransition: Transition = {
  type: 'spring',
  damping: 20,
  stiffness: 300,
};

/**
 * Score pop animation for level up
 */
export const scorePopVariants: Variants = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 12,
      stiffness: 200,
    }
  },
};

// ============================================
// ACHIEVEMENT ANIMATIONS
// ============================================

/**
 * Badge spin animation (step-based)
 */
export const badgeSpinVariants: Variants = {
  idle: { rotate: 0 },
  spin: { 
    rotate: 360,
    transition: {
      duration: 0.5,
      ease: 'linear',
    }
  },
};

/**
 * Achievement unlock toast animation
 */
export const achievementUnlockVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 200,
    }
  },
  exit: { 
    opacity: 0, 
    x: 50,
    scale: 0.9,
    transition: {
      duration: 0.2,
    }
  },
};

// ============================================
// STAGGER ANIMATIONS
// ============================================

/**
 * Staggered children animation
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'tween',
      duration: 0.2,
    }
  },
};

// ============================================
// PULSE & GLOW ANIMATIONS
// ============================================

/**
 * Pixel pulse animation (for alerts)
 */
export const pulseVariants: Variants = {
  idle: { opacity: 1 },
  pulse: {
    opacity: [1, 0.7, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * Glow effect for highlighted elements
 */
export const glowVariants: Variants = {
  idle: { 
    boxShadow: '0 0 0 rgba(255, 236, 39, 0)',
  },
  glow: {
    boxShadow: [
      '0 0 0 rgba(255, 236, 39, 0)',
      '0 0 12px rgba(255, 236, 39, 0.8)',
      '0 0 0 rgba(255, 236, 39, 0)',
    ],
    transition: {
      duration: 1,
      repeat: Infinity,
    },
  },
};

// ============================================
// REDUCED MOTION
// ============================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get transition respecting reduced motion preference
 */
export function safeTransition(transition: Transition): Transition {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return transition;
}

/**
 * Reduced motion variants (instant transitions)
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ============================================
// CSS KEYFRAMES HELPERS
// ============================================

/**
 * Generate CSS keyframes for sprite animation
 */
export function spriteAnimationCSS(
  name: string,
  frames: number,
  frameWidth: number
): string {
  const keyframes = Array.from({ length: frames + 1 }, (_, i) => {
    const percent = (i / frames) * 100;
    const position = -i * frameWidth;
    return `${percent}% { background-position-x: ${position}px; }`;
  }).join('\n  ');

  return `@keyframes ${name} {\n  ${keyframes}\n}`;
}

/**
 * Pixel shake animation CSS
 */
export const pixelShakeCSS = `
@keyframes pixel-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}
`;

/**
 * Pixel bounce animation CSS
 */
export const pixelBounceCSS = `
@keyframes pixel-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
`;

export default {
  pixelStepTiming,
  pixelStepTransition,
  buttonPressVariants,
  slideDownVariants,
  modalPopVariants,
  achievementUnlockVariants,
  staggerContainerVariants,
  staggerItemVariants,
  prefersReducedMotion,
  safeTransition,
};
