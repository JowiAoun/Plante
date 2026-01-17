# Raspberry Pi Sensor API - Quick Setup

## Step 1: Install Dependencies (On Pi)

```bash
cd ~/Plante/hardware
source venv/bin/activate
pip install -r requirements.txt
cp api/.env.example api/.env
```

## Step 2: Test the API Locally

```bash
python -m api.main
```

Visit `http://localhost:8000/docs` to see the API documentation.

Test with:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/sensors
```

## Step 3: Run as Background Service

```bash
sudo cp plante-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable plante-api
sudo systemctl start plante-api
```

Check status: `sudo systemctl status plante-api`

---

## Step 4: Connect to Vercel (Choose One)

### Option A: Cloudflare Tunnel (Recommended)

**Prerequisites**: Cloudflare account with a domain

```bash
# 1. Run setup script
cd ~/Plante/hardware
./scripts/setup-cloudflare-tunnel.sh pi-sensors yourdomain.com

# 2. Install as service
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

**On Vercel**, add environment variable:
```
PI_API_URL=https://pi-sensors.yourdomain.com
```

---

### Option B: ngrok (Quick Testing)

```bash
# 1. Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# 2. Sign up at ngrok.com, get auth token
ngrok config add-authtoken YOUR_TOKEN

# 3. Start tunnel
ngrok http 8000
```

Copy the HTTPS URL (changes on restart).

**On Vercel**, add:
```
PI_API_URL=https://abc123.ngrok.io
```

---

### Option C: Local Network Only

If Next.js runs on same network as Pi:

```
PI_API_URL=http://172.20.10.9:8000
```

---

## Step 5: Add API Key (Optional)

Generate a key:
```bash
openssl rand -hex 32
```

**On Pi** (`api/.env`):
```
API_KEY=your-generated-key
```

**On Vercel**:
```
PI_API_KEY=your-generated-key
```

---

## Verify Connection

From your Next.js app or terminal:
```bash
curl https://pi-sensors.yourdomain.com/health
```

Expected response:
```json
{"status":"healthy","version":"1.0.0","sensors_available":["temperature","humidity","light","soil_moisture"]}
```
