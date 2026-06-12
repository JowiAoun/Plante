# 🚀 Getting Started

Everything you need to run the Plante web app and the Raspberry Pi greenhouse.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

None! The app now runs as a fully self-contained demo and requires no environment variables or API keys. Sign in with the demo account, and all data (farms, sensors, chat replies, leaderboard) comes from hard-coded fictional seed data.

After the hackathon ended, the original external services (MongoDB, Google OAuth, the Gemini AI chat, ElevenLabs voice, Twilio SMS, and the live Raspberry Pi link) were retired. The feature docs below describe how the original build worked.

## 🌡️ Hardware Setup

On the Raspberry Pi:

```bash
cd hardware
python3 -m venv venv --system-site-packages
source venv/bin/activate
pip install -r requirements.txt

# Start the sensor API
uvicorn api.main:app --host 0.0.0.0 --port 8000

# Start the greenhouse automation loop
python3 main_control.py
```

A systemd unit ([`hardware/plante-api.service`](../hardware/plante-api.service)) is included for auto-start on boot, and setup scripts under [`hardware/scripts/`](../hardware/scripts/) handle Cloudflare Tunnel / Tailscale configuration.

## 📁 Project Structure

```
├── app/                  # Next.js App Router pages & API routes
├── components/           # Pixel-art React components (with Storybook stories)
├── hooks/                # React custom hooks
├── lib/                  # Auth, MongoDB, Twilio, AI, and Pi API client
├── types/                # Shared TypeScript definitions
├── hardware/             # Everything that runs on the greenhouse
│   ├── api/              # FastAPI sensor & camera server
│   ├── sensors/          # DHT11, light, soil moisture, camera modules
│   ├── arduino/          # Dual-servo sketch & serial controller
│   ├── main_control.py   # Automation loop (sensors → lid decisions)
│   └── scripts/          # Pi, tunnel, and VPN setup scripts
└── docs/                 # Feature documentation
```

## 🧪 Development

```bash
npm run dev          # Start dev server
npm run storybook    # Component library (port 6006)
npm run test         # Run Vitest tests
npm run lint         # ESLint
npm run build        # Production build
```

## 📚 Documentation

- [`features/AUTH.md`](features/AUTH.md): Authentication setup
- [`features/CHAT.md`](features/CHAT.md): AI chat integration
- [`features/NOTIFICATIONS.md`](features/NOTIFICATIONS.md): SMS/push notifications
- [`features/MONGODB.md`](features/MONGODB.md): Database schema
- [`hardware/README.md`](../hardware/README.md): Wiring, pins, and the sensor API
- [`hardware/SETUP.md`](../hardware/SETUP.md): Pi hardware guide
- [`hardware/NETWORKING.md`](../hardware/NETWORKING.md): Connecting the Pi to the server
