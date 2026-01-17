# Plante Sprites Directory

This directory contains pixel-art sprites for the Plante application.

## File Naming Convention

- `sprite_<category>_<name>_<size>_<frame>.png`
- Example: `sprite_farm_tomato_32_01.png`

## Categories

- `farm` - Farm-related sprites (plants, thumbnails)
- `icon` - UI icons (16x16 or 32x32)
- `badge` - Achievement badges
- `avatar` - Avatar components (layered)
- `hud` - HUD elements (status bars, hearts)

## Tile Sizes

- **16×16 px** - Small icons, HUD elements
- **32×32 px** - Featured items, farm tiles
- **48×48 px** - Avatars
- **96×96 px** - 2x retina avatars

## File Format

- Use **PNG** with transparency (lossless, crisp pixels)
- Provide 2x versions for retina displays with `_2x` suffix
- Avoid JPG/WebP for sprites

## Creating Sprites

Recommended tools:
- [Aseprite](https://www.aseprite.org/) - Professional pixel art editor
- [Piskel](https://www.piskelapp.com/) - Free web-based pixel art editor
- [TexturePacker](https://www.codeandweb.com/texturepacker) - Sprite sheet generation

## Animation Guidelines

- Idle loops: 4-8 FPS
- Action loops: 8-12 FPS
- Use PNG sequences or sprite sheets with JSON metadata
