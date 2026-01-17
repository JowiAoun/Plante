# Networking Setup Guide

This guide covers connecting the Raspberry Pi sensor API to the Plante production server.

## Option 1: Tailscale VPN (Recommended)

Tailscale creates a secure peer-to-peer VPN between devices.

### On Raspberry Pi

```bash
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# Start and authenticate
sudo tailscale up

# Note the Tailscale IP (e.g., 100.x.x.x)
tailscale ip -4
```

### On Production Server (Vercel)

For Vercel, use Tailscale's API proxy approach:

1. Note the Pi's Tailscale hostname (e.g., `raspberrypi.tail12345.ts.net`)
2. Add to Vercel environment variables:
   ```
   PI_API_URL=http://raspberrypi.tail12345.ts.net:8000
   ```

> **Note**: Vercel serverless functions cannot join a Tailscale network directly. For Vercel deployments, use Option 2 (Cloudflare Tunnel) instead.

### Alternative: Self-hosted Next.js

If self-hosting Next.js:

```bash
# Install Tailscale on server
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up

# Access Pi via Tailscale IP or MagicDNS
curl http://raspberrypi:8000/health
```

---

## Option 2: Cloudflare Tunnel (Best for Vercel)

Cloudflare Tunnel exposes the Pi API via a public subdomain with automatic HTTPS.

### Prerequisites

- Cloudflare account with a domain
- Domain DNS managed by Cloudflare

### On Raspberry Pi

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb

# Authenticate with Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create plante-pi

# Configure tunnel (creates ~/.cloudflared/config.yml)
cat > ~/.cloudflared/config.yml << EOF
tunnel: plante-pi
credentials-file: /home/jeremyfriesen/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: pi-sensors.yourdomain.com
    service: http://localhost:8000
  - service: http_status:404
EOF

# Create DNS record
cloudflared tunnel route dns plante-pi pi-sensors.yourdomain.com

# Run tunnel
cloudflared tunnel run plante-pi
```

### Run as Service

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

### On Production (Vercel/Next.js)

Add environment variable:
```
PI_API_URL=https://pi-sensors.yourdomain.com
```

---

## Option 3: Ngrok (Development Only)

Quick temporary URL for testing.

### On Raspberry Pi

```bash
# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Authenticate (get token from ngrok.com)
ngrok config add-authtoken <YOUR_TOKEN>

# Start tunnel
ngrok http 8000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`).

> **Warning**: Free ngrok URLs change on restart. Use for testing only.

---

## Security Configuration

### API Key Authentication

1. Generate a secure key:
   ```bash
   openssl rand -hex 32
   ```

2. On Pi, add to `hardware/api/.env`:
   ```
   API_KEY=your-generated-key
   ```

3. On Next.js, add to `.env`:
   ```
   PI_API_KEY=your-generated-key
   ```

4. Requests must include header:
   ```
   X-API-Key: your-generated-key
   ```

### CORS Configuration

On Pi, update `hardware/api/.env`:
```
CORS_ORIGINS=https://plante.vercel.app,http://localhost:3000
```

---

## Environment Variables Summary

### Raspberry Pi (`hardware/api/.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| `API_KEY` | `abc123...` | Authentication key |
| `CORS_ORIGINS` | `https://plante.vercel.app` | Allowed origins |
| `API_PORT` | `8000` | Server port |

### Next.js (`.env`)

| Variable | Example | Description |
|----------|---------|-------------|
| `PI_API_URL` | `https://pi-sensors.example.com` | Pi API endpoint |
| `PI_API_KEY` | `abc123...` | Authentication key |

---

## Verification

Test the connection from your production environment:

```bash
# Health check
curl -H "X-API-Key: your-key" https://pi-sensors.yourdomain.com/health

# Get sensors
curl -H "X-API-Key: your-key" https://pi-sensors.yourdomain.com/sensors
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "sensors_available": ["temperature", "humidity", "light", "soil_moisture"]
}
```
