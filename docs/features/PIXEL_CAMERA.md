# Pixel Camera Feature

Live farm photos from the Raspberry Pi camera with visual health assessment.

## Overview

Display real-time photos of plants when viewing a farm, with a simple "Visual Health" status indicator.

## User Flow

1. User navigates to farm detail page
2. Photo is captured from Pi camera on page load
3. Photo displays with pixelated aesthetic
4. Visual health status shows as "healthy" indicator

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/farms/[id]/photo` | GET | Get latest photo metadata |
| `POST /api/farms/[id]/photo` | POST | Capture new photo from Pi |

### Response Format

```json
{
  "success": true,
  "photo": {
    "url": "https://pi-sensors.example.com/camera/latest/file",
    "timestamp": "2026-01-17T20:30:00.000Z"
  },
  "visualHealth": "healthy"
}
```

## Frontend Components

### FarmPhoto Component

```
┌─────────────────────────────┐
│  📷 Live Photo              │
├─────────────────────────────┤
│                             │
│    [Pixelated Plant Image]  │
│                             │
├─────────────────────────────┤
│  Visual Health: ✅ Healthy  │
│  Captured: 2m ago           │
└─────────────────────────────┘
```

**Props:**
- `farmId: string` - Farm to capture photo for
- `autoCapture?: boolean` - Capture on mount (default: true)

## Integration Points

1. **Farm Detail Page** - Show photo in hero section
2. **FarmCard** - Optional thumbnail preview
3. **Pi Camera API** - `/camera/capture` and `/camera/latest/file`

## Implementation Checklist

- [ ] Create `FarmPhoto` component
- [ ] Add photo section to farm detail page
- [ ] Style with pixel art filter
- [ ] Add "Capture" button for manual refresh
- [ ] Display visual health status

## Styling

Apply CSS `image-rendering: pixelated` for retro aesthetic:

```css
.farm-photo__image {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  border: 4px solid var(--color-border);
}
```

## Error States

| State | Display |
|-------|---------|
| Camera unavailable | "📷 Camera offline" message |
| Capture failed | "Failed to capture" with retry button |
| Loading | Pulsing placeholder |
