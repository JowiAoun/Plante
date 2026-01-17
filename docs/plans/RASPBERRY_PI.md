# Raspberry Pi Integration Plan

> **Document Purpose**: Comprehensive implementation plan for integrating the Raspberry Pi hardware monitoring system with the Plante production server.

---

## Overview

This document outlines the complete integration of the Raspberry Pi 5 hardware system with the Plante Next.js application. The goal is to enable real-time plant monitoring for the **Kalanchoe Farm** using physical sensors and a camera, displaying live sensor readings on the dashboard UI with health threshold indicators.

### Current State

**Hardware (Raspberry Pi 5)**
- DHT11 sensor: Temperature (°C) and humidity (%)
- BH1750 sensor: Light intensity (lux)
- SparkFun Soil Moisture sensor: Soil moisture (%)
- Pi Camera Module 3: Plant photos and timelapse

**Software**
- Python scripts in `hardware/sensors/` for reading each sensor
- Next.js production app with farms API and MongoDB backend
- FarmCard component displaying temperature, humidity, and soil moisture

---

## Phase 1: Raspberry Pi FastAPI Server

Create a lightweight REST API on the Raspberry Pi that exposes sensor readings and camera functionality to external clients.

### Objectives

- Build a FastAPI application that aggregates all sensor data
- Expose endpoints for sensor readings and camera capture
- Implement background sensor polling with configurable intervals
- Handle sensor failures gracefully with fallback values

### Components

#### FastAPI Application Structure

| Directory | Purpose |
|-----------|---------|
| `hardware/api/` | FastAPI server code |
| `hardware/api/main.py` | Application entry point |
| `hardware/api/routers/` | Endpoint definitions |
| `hardware/api/services/` | Sensor reading logic |
| `hardware/api/models/` | Pydantic response models |

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/sensors` | All sensor readings as JSON |
| GET | `/sensors/temperature` | Temperature and humidity from DHT11 |
| GET | `/sensors/light` | Light intensity from BH1750 |
| GET | `/sensors/soil` | Soil moisture percentage |
| GET | `/camera/capture` | Capture and return a photo |
| GET | `/camera/latest` | Get the most recent photo |

#### Response Schema (GET /sensors)

The main sensor endpoint returns a unified response with all readings:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO 8601 string | Reading timestamp |
| `temperature` | object | `{ value, unit: "celsius" }` |
| `humidity` | object | `{ value, unit: "percent" }` |
| `light` | object | `{ value, unit: "lux", description }` |
| `soilMoisture` | object | `{ value, unit: "percent" }` |
| `status` | string | Overall status (ok, degraded, error) |
| `errors` | array | List of sensor errors if any |

### Background Sensor Service

- Poll sensors at 30-second intervals (configurable)
- Cache latest readings in memory
- Log errors without crashing the server
- Retry failed sensors on next poll cycle

### Running the Server

- Start via systemd service for auto-restart
- Bind to port 8000 by default
- Support CORS for production domain access

---

## Phase 2: Networking Configuration

Establish secure communication between the Raspberry Pi and the production Next.js server.

### Option A: Public Internet Access (Recommended for Production)

**Method 1: Tailscale VPN**
- Install Tailscale on both Raspberry Pi and production server
- Use Tailscale's MagicDNS for stable addressing
- Secure peer-to-peer encrypted connection
- No port forwarding required

**Method 2: Cloudflare Tunnel**
- Install cloudflared on Raspberry Pi
- Create tunnel to expose FastAPI server
- Access via subdomain (e.g., `pi-sensors.yourdomain.com`)
- HTTPS encryption built-in

**Method 3: Ngrok (Development/Testing)**
- Simple temporary public URL
- Good for testing before setting up permanent solution
- Free tier has ephemeral URLs

### Option B: Local Network Only

If production runs on the same network as the Raspberry Pi:
- Access Pi directly via local IP
- Use mDNS hostname (e.g., `raspberrypi.local:8000`)
- Simpler but limited to local deployment

### Security Considerations

- Implement API key authentication on Pi endpoints
- Store API key in environment variables on both systems
- Rate limit requests to prevent abuse
- Validate incoming request origins

---

## Phase 3: Next.js Server Integration

Create server-side API routes that proxy requests to the Raspberry Pi and update the database.

### New API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/farms/[id]/sync` | Fetch sensor data from Pi and update farm |
| `GET /api/farms/[id]/sensors/live` | Real-time sensor feed (SSE or polling) |
| `POST /api/farms/[id]/photo` | Request photo from Pi camera |

### Data Flow

1. Client requests farm data → Next.js API
2. Next.js API fetches from Raspberry Pi FastAPI
3. Response mapped to farm schema
4. Sensors updated in MongoDB
5. Thresholds evaluated for status calculation
6. Updated farm returned to client

### Farm Status Calculation

Compare sensor values against thresholds stored in the farm document:

| Condition | Status |
|-----------|--------|
| All sensors within thresholds | `healthy` |
| One or more sensors near limits (within 10%) | `warning` |
| Any sensor outside thresholds | `critical` |

### Threshold Configuration (per farm)

| Sensor | Default Min | Default Max |
|--------|-------------|-------------|
| Temperature | 15°C | 30°C |
| Humidity | 40% | 80% |
| Soil Moisture | 30% | 70% |
| Light | 200 lux | 10000 lux |

> [!NOTE]
> Thresholds should be customizable per plant species. Consider loading from a plant database in the future.

---

## Phase 4: Frontend Dashboard Updates

Enhance the UI to display live sensor data with health indicators.

### FarmCard Enhancements

- Add light sensor reading display
- Show visual indicator for threshold status (green/yellow/red)
- Add "Last synced" timestamp
- Add refresh button for manual sync

### Farm Detail Page Enhancements

- Large sensor gauges with threshold visualizations
- Historical sensor graph (if data is stored)
- Live camera feed or latest photo
- Manual watering/action buttons (future)

### Sensor Health Indicators

| Status | Visual |
|--------|--------|
| Within range | Green indicator |
| Near threshold (within 10%) | Yellow indicator |
| Outside threshold | Red indicator + warning badge |

### Real-Time Updates

- Option 1: Client-side polling every 30-60 seconds
- Option 2: Server-Sent Events (SSE) for push updates
- Option 3: WebSocket for bidirectional (if actions are added)

Recommend starting with polling for simplicity, upgrade to SSE later.

---

## Phase 5: Camera Integration (Optional)

Enable users to view photos from the Pi camera on their farm page.

### Features

- Capture on-demand photo from farm detail page
- Display latest photo on farm card
- Store photos in cloud storage (e.g., S3, Cloudinary)
- Timelapse gallery view

### Photo Storage Strategy

| Option | Pros | Cons |
|--------|------|------|
| Pi local storage | Simple | Limited space, no redundancy |
| Cloud storage (S3) | Scalable, durable | Requires upload logic |
| Hybrid | Best of both | More complex |

Recommend: Upload to cloud on capture, cache locally.

### Photo API Flow

1. User clicks "Take Photo" on farm page
2. Next.js calls Pi `/camera/capture` endpoint
3. Pi captures photo, uploads to S3
4. Returns S3 URL to Next.js
5. URL saved to farm document as `thumbnailUrl`
6. UI updates with new photo

---

## Phase 6: Notifications Integration

Trigger notifications when sensor readings cross thresholds.

### Notification Triggers

| Condition | Message Type |
|-----------|--------------|
| Temperature too high | Warning alert |
| Temperature too low | Warning alert |
| Soil too dry | Watering reminder |
| Soil too wet | Overwatering alert |
| Humidity critical | Environment alert |
| Sensor offline | System alert |

### Integration with Existing Notifications

- Use existing Twilio integration from `docs/features/NOTIFICATIONS.md`
- Add sensor alert types to notification preferences
- Allow users to set quiet hours
- Debounce alerts (don't spam for same condition)

---

## Phase 7: Device Management

Support multiple Raspberry Pi devices for future expansion.

### Farm-Device Association

- Each farm document has optional `deviceId` field
- Device registry stores Pi connection details
- Admin UI to pair/unpair devices

### Device Document Schema

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Device identifier |
| `name` | string | Human-readable name |
| `endpoint` | string | URL to reach device API |
| `apiKey` | string | Authentication key |
| `lastSeen` | Date | Last successful contact |
| `status` | string | online/offline |

> [!IMPORTANT]
> This phase is for future expansion. Phase 1-4 assumes a single hardcoded Kalanchoe Farm device.

---

## Implementation Order

### Minimum Viable Product (Phases 1-4)

1. **Phase 1**: Build FastAPI server on Pi (2-3 days)
2. **Phase 2**: Set up Tailscale/networking (1 day)
3. **Phase 3**: Next.js integration API routes (1-2 days)
4. **Phase 4**: Frontend UI updates (1-2 days)

**Total MVP**: ~1 week

### Full Feature Set (Phases 5-7)

5. **Phase 5**: Camera integration (2 days)
6. **Phase 6**: Notification triggers (1 day)
7. **Phase 7**: Multi-device support (2-3 days)

**Total Full**: ~2 weeks additional

---

## Dependencies Required

### Raspberry Pi

| Package | Purpose |
|---------|---------|
| fastapi | Web framework |
| uvicorn | ASGI server |
| pydantic | Request/response models |
| python-dotenv | Environment configuration |

### Next.js (existing)

No new dependencies required. Uses existing `fetch` API for HTTP requests.

---

## Environment Variables

### Raspberry Pi (.env)

| Variable | Description |
|----------|-------------|
| `API_PORT` | Port for FastAPI (default: 8000) |
| `API_KEY` | Secret for authentication |
| `POLL_INTERVAL` | Sensor polling interval in seconds |
| `CLOUD_STORAGE_URL` | S3/Cloudinary upload endpoint |

### Next.js (.env)

| Variable | Description |
|----------|-------------|
| `PI_API_URL` | URL to reach Raspberry Pi API |
| `PI_API_KEY` | Secret for Pi authentication |

---

## Testing Strategy

### Raspberry Pi API Testing

- Unit tests for sensor reading functions
- Integration tests with mocked sensors
- Manual endpoint testing via curl/Postman

### Next.js Integration Testing

- Mock Pi responses for API route tests
- Component tests for updated FarmCard
- End-to-end test for sync flow

### Manual Verification

1. Start Pi FastAPI server
2. Verify `/health` endpoint responds
3. Check `/sensors` returns expected data
4. Create test farm in app
5. Trigger sync and verify UI updates
6. Cross threshold and verify status change

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Pi goes offline | Graceful degradation, show "offline" status |
| Sensor failure | Individual sensor error handling, continue with working sensors |
| Network latency | Async fetching, caching, loading states |
| Security exposure | API key auth, HTTPS via tunnel, IP allowlisting |

---

## Future Considerations

- Support for additional sensor types (CO2, pH)
- Machine learning for plant health prediction
- Automated watering via servo/pump control
- Multiple camera angles or video streaming
- Historical data analytics and trends
