# 🌱 Plante

> **🏆 Best Designed Award** – uOttaHack 8 2025

A gamified, pixel-art smart plant monitoring system with AI chat, Raspberry Pi sensor integration, and real-time farm management.

**[Devpost](https://devpost.com/software/plante)** | **[Demo Video](https://www.youtube.com/watch?v=7n9EgHPRCC8)**

## ✨ Features

- **🎮 Pixel-Art UI** – Retro-styled interface using PICO-8 color palette and NES.css
- **🤖 AI Chat Assistant** – Gemini-powered chat with voice synthesis (ElevenLabs)
- **📊 Live Sensor Data** – Real-time temperature, humidity, and soil moisture from Raspberry Pi
- **📸 Pi Camera Feed** – Auto-capturing plant photos with pixel-art filters
- **🔔 Smart Notifications** – In-app and SMS alerts via Twilio
- **📈 Weekly Pulse** – AI-generated weekly insights about your plants
- **🏆 Gamification** – XP, levels, achievements, and leaderboards
- **🔐 Google Auth** – Secure authentication with NextAuth.js

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `GOOGLE_CLIENT_ID/SECRET` | Google OAuth credentials |
| `NEXTAUTH_SECRET` | Random secret for sessions |
| `GEMINI_API_KEY` | Google AI API key |
| `ELEVENLABS_API_KEY` | Voice synthesis API key |
| `TWILIO_*` | SMS notification credentials |
| `RASPBERRY_PI_*` | Pi sensor API configuration |

## 📁 Project Structure

```
├── app/                  # Next.js App Router pages & API routes
├── components/           # React UI components
├── lib/                  # Core utilities (auth, db, twilio, AI)
├── hardware/             # Raspberry Pi scripts & Arduino code
│   ├── api/              # Flask API for sensor endpoints
│   ├── sensors/          # DHT, soil moisture, camera modules
│   └── motors/           # Hatch/watering motor controls
├── hooks/                # React custom hooks
├── types/                # TypeScript definitions
└── docs/                 # Feature documentation
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS, NES.css, CSS Modules |
| Database | MongoDB with NextAuth adapter |
| Auth | NextAuth.js (Google OAuth) |
| AI | Google Gemini API |
| Voice | ElevenLabs TTS |
| SMS | Twilio |
| Hardware | Raspberry Pi 4, Arduino, DHT22, Pi Camera, 2x SG90 Servos, SparkFun Soil Moisture Sensor, 9V Battery, Power Module, Breadboard |

## 🧪 Development

```bash
npm run dev          # Start dev server
npm run storybook    # Component library (port 6006)
npm run test         # Run Vitest tests
npm run lint         # ESLint
npm run build        # Production build
```

## 🌡️ Hardware Setup

See [`hardware/README.md`](hardware/README.md) for Raspberry Pi setup:

1. Install dependencies: `pip install -r hardware/requirements.txt`
2. Configure `hardware/config.json` with GPIO pins
3. Start sensor API: `python hardware/api/app.py`
4. Enable systemd service for auto-start

## � Documentation

- [`docs/features/AUTH.md`](docs/features/AUTH.md) – Authentication setup
- [`docs/features/CHAT.md`](docs/features/CHAT.md) – AI chat integration
- [`docs/features/NOTIFICATIONS.md`](docs/features/NOTIFICATIONS.md) – SMS/push notifications
- [`docs/features/MONGODB.md`](docs/features/MONGODB.md) – Database schema
- [`hardware/SETUP.md`](hardware/SETUP.md) – Pi hardware guide
