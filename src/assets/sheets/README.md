# Plante Sprite Sheets Directory

This directory contains combined sprite sheet atlases for efficient loading.

## Sprite Sheet Format

Each sprite sheet consists of two files:
1. `sheet_<category>_<size>.png` - The sprite atlas image
2. `sheet_<category>_<size>.json` - Metadata describing frame positions

## JSON Metadata Schema

```json
{
  "name": "sheet_icons_16",
  "category": "icons",
  "tileSize": 16,
  "frames": [
    {
      "name": "temp",
      "x": 0,
      "y": 0,
      "width": 16,
      "height": 16
    },
    {
      "name": "humidity",
      "x": 16,
      "y": 0,
      "width": 16,
      "height": 16
    }
  ],
  "anchor": { "x": 0.5, "y": 0.5 },
  "animations": {
    "idle": {
      "frames": ["frame_01", "frame_02", "frame_03", "frame_04"],
      "frameRate": 4,
      "loop": true
    }
  }
}
```

## Properties

- `name` - Unique identifier for the sprite sheet
- `category` - Type of sprites (icons, badges, avatars, etc.)
- `tileSize` - Base tile size in pixels
- `frames` - Array of frame definitions with x, y, width, height
- `anchor` - Origin point for sprites (0-1 normalized)
- `animations` - Named animation sequences with frame references

## Loading Sprite Sheets

Use the provided `useSpriteSheet` hook to load and render sprites:

```tsx
import { useSpriteSheet } from '@/hooks/useSpriteSheet';

const { getFrame, playAnimation } = useSpriteSheet('sheet_icons_16');
```

## Tips

- Keep sprite sheets under 2048×2048 for compatibility
- Use power-of-2 dimensions when possible
- Group related sprites together for cache efficiency
