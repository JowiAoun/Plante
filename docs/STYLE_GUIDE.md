# Plante Style Guide

This document defines the visual standards for the Plante pixel-art UI.

## Pixel Grid Rules

### Base Unit
- **Grid unit**: 8px
- All spacing, sizing, and positioning should be multiples of 8px
- Exception: 4px for small details, 2px for borders

### Pixel Snapping
- Always use integer values for transforms and positions
- Avoid fractional pixels (subpixel rendering blurs pixel art)
- Use `transform: translate3d(Xpx, Ypx, 0)` with integer X/Y values

### Scaling
- Only use integer scale multipliers: 1x, 2x
- Never use fractional scaling (1.5x, 0.75x, etc.)
- For responsive layouts, change layout rather than scaling pixel elements

## Image Handling

### Pixel-Art Rendering
All pixel-art images MUST use:
```css
image-rendering: pixelated;
image-rendering: crisp-edges; /* fallback */
-ms-interpolation-mode: nearest-neighbor; /* IE */
```

### SVG Rendering
For pixel-style SVGs:
```css
shape-rendering: crispEdges;
```

### File Formats
| Format | Use Case | Notes |
|--------|----------|-------|
| PNG | Sprites, UI elements | Lossless, transparency support |
| SVG | Logo, simple icons | Scalable, use crispEdges |
| WebP | Photos only | NOT for pixel art |

## Sprite Usage

### Tile Sizes
| Size | Use Case |
|------|----------|
| 16×16 px | HUD icons, small indicators |
| 32×32 px | Featured items, farm tiles |
| 48×48 px | Avatars, large icons |
| 96×96 px | 2x retina avatars |

### Naming Convention
```
sprite_<category>_<name>_<size>_<frame>.png
sheet_<category>_<size>.png + .json
```

### Padding
- Include 1px transparent padding around sprites in sheets
- Prevents bleeding at edges during scaling

### 2x Assets
- Provide 2x versions for retina displays
- Same pixel art, just scaled 2x
- Use `_2x` suffix: `sprite_icon_heart_16_2x.png`

## Color Palette

### PICO-8 (16 colors)
Only use colors from the PICO-8 palette for UI elements:

| # | Name | Hex | Use |
|---|------|-----|-----|
| 0 | Black | #000000 | Backgrounds |
| 1 | Dark Blue | #1D2B53 | Surfaces |
| 2 | Dark Purple | #7E2553 | Epic rarity |
| 3 | Dark Green | #008751 | Farm healthy |
| 4 | Brown | #AB5236 | Farm warning |
| 5 | Dark Gray | #5F574F | Borders |
| 6 | Light Gray | #C2C3C7 | Muted text |
| 7 | White | #FFF1E8 | Primary text |
| 8 | Red | #FF004D | Critical/Error |
| 9 | Orange | #FFA300 | Warning |
| 10 | Yellow | #FFEC27 | Accent/Highlight |
| 11 | Green | #00E436 | Success/Healthy |
| 12 | Blue | #29ADFF | Primary action |
| 13 | Lavender | #83769C | Secondary |
| 14 | Pink | #FF77A8 | Decorative |
| 15 | Peach | #FFCCAA | Skin tones |

### Extending the Palette
Any colors outside PICO-8 require explicit approval. Document the reason and ensure WCAG AA contrast compliance.

## Typography

### Fonts
- **Game UI**: `'Press Start 2P', monospace`
- **Body Text**: `system-ui, -apple-system, sans-serif`

### Font Sizes (exact pixels)
| Token | Size | Use |
|-------|------|-----|
| xs | 8px | Tiny labels |
| sm | 10px | Small UI text |
| base | 12px | Default game text |
| lg | 14px | Important labels |
| xl | 16px | Section headers |
| 2xl | 20px | Page titles |
| 3xl | 24px | Hero text |

### Text Rendering
For pixel fonts, disable antialiasing:
```css
-webkit-font-smoothing: none;
-moz-osx-font-smoothing: unset;
```

## Animations

### Frame-Based Animation
Use CSS `steps()` for sprite animations:
```css
animation: walk 0.5s steps(4) infinite;
```

### Timing
| Type | FPS | Duration |
|------|-----|----------|
| Idle loops | 4-8 | Continuous |
| Actions | 8-12 | 0.25-0.5s |
| Transitions | N/A | 0.1-0.2s |

### Reduced Motion
Always respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

## Accessibility

### Contrast
- Ensure WCAG AA compliance (4.5:1 for text)
- Test with palette colors: white text on dark blue = OK

### Focus States
- Use 4px solid yellow (#FFEC27) outline
- 2px offset from element

### ARIA Labels
All icon-only buttons must have `aria-label` describing the action.
