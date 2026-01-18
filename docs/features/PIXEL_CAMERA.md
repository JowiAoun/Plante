# Pixel Camera Feature

Live farm photos from the Raspberry Pi camera with visual health assessment.

## Overview

Display real-time photos of plants when viewing a farm, with a pixelated camera aesthetic and visual health indicator.

## User Flow

1. User navigates to farm detail page
2. Camera frame shows with blurry placeholder
3. Photo is captured from Pi camera
4. Flash effect triggers, revealing crisp pixelated photo
5. Visual health status shows as "healthy" indicator

## Visual Design

### Camera Frame

The photo is encased in a pixel-art styled camera viewfinder:

```
╔═══════════════════════════════════╗
║  📷 LIVE PHOTO                    ║
╠═══════════════════════════════════╣
║ ┌───────────────────────────────┐ ║
║ │                               │ ║
║ │                               │ ║
║ │     [Pixelated Plant Image]   │ ║
║ │                               │ ║
║ │                               │ ║
║ └───────────────────────────────┘ ║
║  ◉ REC          [📸 Capture]     ║
╠═══════════════════════════════════╣
║  Visual Health: ✅ Healthy        ║
║  Captured: 2m ago                 ║
╚═══════════════════════════════════╝
```

### Loading Animation

While waiting for photo:
- Show blurry/pixelated placeholder (low-res noise pattern)
- Subtle pulse animation
- "Focusing..." text

### Capture Effect

When photo arrives:
1. Screen flashes white briefly (100ms)
2. Flash fades out (200ms)
3. Crisp photo revealed with slight zoom-in
4. Camera shutter sound effect (optional)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/farms/[id]/photo` | GET | Get latest photo metadata |
| `POST /api/farms/[id]/photo` | POST | Capture new photo from Pi |

### Response Format

```json
{
  "success": true,
  "photoUrl": "https://pi-sensors.example.com/camera/latest/file",
  "timestamp": "2026-01-17T20:30:00.000Z",
  "visualHealth": "healthy"
}
```

## Frontend Components

### FarmPhoto Component

**Props:**
- `farmId: string` - Farm to capture photo for
- `autoCapture?: boolean` - Capture on mount (default: true)
- `showFrame?: boolean` - Show camera frame (default: true)

**States:**
- `idle` - No photo yet
- `capturing` - Blurry loading state
- `flashing` - White flash effect
- `ready` - Photo displayed

## Styling

```css
/* Pixelated image */
.farm-photo__image {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

/* Loading blur effect */
.farm-photo--capturing .farm-photo__image {
  filter: blur(8px);
  opacity: 0.5;
}

/* Flash effect */
.farm-photo--flashing::after {
  content: '';
  position: absolute;
  inset: 0;
  background: white;
  animation: flash 0.3s ease-out forwards;
}

@keyframes flash {
  0% { opacity: 1; }
  100% { opacity: 0; }
}
```

## Implementation Checklist

- [ ] Create `FarmPhoto` component with camera frame
- [ ] Add blurry loading state animation
- [ ] Implement flash effect on photo capture
- [ ] Integrate with Pi camera API
- [ ] Add to farm detail page
- [ ] Display visual health status

## Error States

| State | Display |
|-------|---------|
| Camera unavailable | "📷 Camera offline" in frame |
| Capture failed | "Failed to capture" with retry |
| Loading | Blurry placeholder with pulse |
