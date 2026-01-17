/**
 * Plante Design Tokens
 * Single source of truth for pixel-art styling
 * 
 * Using PICO-8 palette as default - can be overridden with brand palette
 */

// PICO-8 color palette (16 colors)
export const palette = {
  // Base colors
  black: '#000000',       // 0
  darkBlue: '#1D2B53',    // 1
  darkPurple: '#7E2553',  // 2
  darkGreen: '#008751',   // 3
  brown: '#AB5236',       // 4
  darkGray: '#5F574F',    // 5
  lightGray: '#C2C3C7',   // 6
  white: '#FFF1E8',       // 7
  red: '#FF004D',         // 8
  orange: '#FFA300',      // 9
  yellow: '#FFEC27',      // 10
  green: '#00E436',       // 11
  blue: '#29ADFF',        // 12
  lavender: '#83769C',    // 13
  pink: '#FF77A8',        // 14
  peach: '#FFCCAA',       // 15
} as const;

// Semantic color aliases
export const colors = {
  // Status colors
  healthy: palette.green,
  warning: palette.orange,
  critical: palette.red,
  
  // UI colors
  background: palette.black,
  surface: palette.darkBlue,
  primary: palette.blue,
  secondary: palette.lavender,
  text: palette.white,
  textMuted: palette.lightGray,
  border: palette.darkGray,
  accent: palette.yellow,
  
  // Farm status
  farmHealthy: palette.darkGreen,
  farmWarning: palette.brown,
  farmCritical: palette.darkPurple,
} as const;

// Typography
export const fonts = {
  game: '"Press Start 2P", monospace',    // Pixel art headings & game UI
  ui: 'system-ui, -apple-system, sans-serif',  // Body copy & readable text
} as const;

// Font sizes in pixels (exact, not rem)
export const fontSizes = {
  xs: '8px',
  sm: '10px',
  base: '12px',
  lg: '14px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '32px',
} as const;

// Pixel grid base unit
export const gridUnit = 8;

// Spacing scale (multiples of grid unit)
export const spacing = {
  px: '1px',
  0: '0',
  1: `${gridUnit}px`,      // 8px
  1.5: `${gridUnit * 1.5}px`, // 12px
  2: `${gridUnit * 2}px`,  // 16px
  3: `${gridUnit * 3}px`,  // 24px
  4: `${gridUnit * 4}px`,  // 32px
  5: `${gridUnit * 5}px`,  // 40px
  6: `${gridUnit * 6}px`,  // 48px
  8: `${gridUnit * 8}px`,  // 64px
} as const;

// Border radii (pixel-friendly)
export const radii = {
  none: '0',
  sm: '2px',
  md: '4px',
  lg: '8px',
} as const;

// Pixel scale multipliers
export const pixelScale = {
  '1x': 1,
  '2x': 2,
} as const;

// Tile sizes for sprites
export const tileSizes = {
  small: 16,    // HUD icons
  medium: 32,   // Featured items
  large: 48,    // Avatars
  xlarge: 96,   // 2x avatar retina
} as const;

// Animation frame rates
export const frameRates = {
  idle: 4,      // 4-8 FPS for idle loops
  action: 8,    // 8-12 FPS for action loops
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 100,
  modal: 200,
  toast: 300,
  tooltip: 400,
} as const;

// Shadows (minimal for pixel look)
export const shadows = {
  none: 'none',
  pixel: '2px 2px 0 rgba(0, 0, 0, 0.25)',
  pixelInset: 'inset 2px 2px 0 rgba(0, 0, 0, 0.25)',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const tokens = {
  palette,
  colors,
  fonts,
  fontSizes,
  gridUnit,
  spacing,
  radii,
  pixelScale,
  tileSizes,
  frameRates,
  zIndex,
  shadows,
  breakpoints,
} as const;

export default tokens;
