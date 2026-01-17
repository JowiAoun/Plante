# Plante - Pixel-Art Plant Monitoring UI

A game-like, pixel-art user interface for plant monitoring built with React, TypeScript, and Vite.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Storybook for component development
npm run storybook

# Build for production
npm run build
```

## 📁 Project Structure

```
/src
  /assets
    /sprites    # Individual pixel-art sprites
    /sheets     # Sprite sheet atlases with JSON metadata
    /fonts      # Custom fonts (if needed)
  /components   # React components
    /FarmCard   # Farm tile component
  /pages        # Page-level components
  /mocks        # MSW mock API handlers
  /styles
    tokens.ts   # Design tokens (colors, fonts, spacing)
  /types        # TypeScript type definitions
  /hooks        # Custom React hooks
  /utils        # Utility functions
```

## 🎨 Design System

### Color Palette (PICO-8)
- 16-color constrained palette for pixel-art consistency
- See `src/styles/tokens.ts` for full palette

### Typography
- **Game UI**: "Press Start 2P" - pixel-art headings and game elements
- **Body Text**: System font stack - readable non-game text

### Pixel Grid
- Base unit: 8px
- All spacing and sizing uses multiples of 8px
- Use `image-rendering: pixelated` for all pixel-art assets

## 🧩 Components

### FarmCard
Tile representing a farm unit on the dashboard.

```tsx
import { FarmCard } from './components/FarmCard';

<FarmCard 
  farm={farmData}
  selected={false}
  onSelect={(farm) => console.log('Selected:', farm.name)}
/>
```

## 🔧 Mock API (MSW)

Mock Service Worker provides mock API responses at `/api/*`:

- `GET /api/users` - List users
- `GET /api/farms` - List farms
- `POST /api/farms/:id/water` - Water a farm
- `GET /api/achievements` - List achievements
- `GET /api/notifications` - List notifications

> MSW automatically starts in development mode.

## 📖 Storybook

Component library with visual review:

```bash
npm run storybook
```

Stories are located alongside components: `ComponentName.stories.tsx`

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test -- --coverage
```

## 🎯 Phases

- [x] **Phase 0**: Scaffold - Project setup, Tailwind, NES.css, Storybook, MSW
- [ ] **Phase 1**: Tokens & Assets - Design tokens, sprite sheets
- [ ] **Phase 2**: Components - Core UI components
- [ ] **Phase 3**: Pages - Dashboard, Farm Detail, Profile, Leaderboard
- [ ] **Phase 4**: Animations - Micro-interactions, level-up sequences
- [ ] **Phase 5**: QA & Handoff - Testing, documentation

## 📝 Pixel Art Guidelines

1. **Integer scaling only**: Use 1x or 2x, no fractional scaling
2. **Pixel snapping**: Avoid subpixel transforms on pixel-art elements
3. **Crisp rendering**: Apply `image-rendering: pixelated` to all sprites
4. **Constrained palette**: Stay within the 16-color PICO-8 palette

## 🔮 Backend Integration (Future)

Currently all data is mocked. For backend integration:

1. Replace MSW handlers with real API calls in `src/services/api.ts`
2. Update endpoints in `src/mocks/handlers.ts` for reference
3. See `src/types/index.ts` for data contracts
