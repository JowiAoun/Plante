# Plante Hardware

Raspberry Pi 5 hardware setup for automated greenhouse monitoring.

## Components

| Component | Interface | GPIO/Pin |
|-----------|-----------|----------|
| DHT11 (Temp/Humidity) | Digital | GPIO 4 (Pin 7) |
| BH1750 (Light Sensor) | I2C | SDA (Pin 3), SCL (Pin 5) |
| Soil Moisture (SparkFun) | Analog (ADC) | HAT AD0 |
| Camera Module 3 | CSI | Ribbon cable |
| Waveshare AD/DA HAT | SPI | GPIO 17, 18 (reserved) |

## Setup

### 1. SSH into the Pi

```bash
ssh jeremyfriesen@<pi-ip-address>
```

### 2. Create Virtual Environment

```bash
cd ~/Plante/hardware
rm -rf venv
python3 -m venv venv --system-site-packages
source venv/bin/activate
pip install spidev adafruit-circuitpython-dht smbus2 picamera2
```

### 3. Enable Interfaces (if needed)

```bash
sudo raspi-config
# -> Interface Options -> SPI -> Enable
# -> Interface Options -> I2C -> Enable
```

## Wiring

### With Waveshare AD/DA HAT Installed

```
        3.3V [1]  [2] 5V      ← DHT11 VCC, Servo VCC
   I2C SDA  [3]  [4] 5V
   I2C SCL  [5]  [6] GND      ← Light sensor GND
  DHT DATA  [7]  [8]          ← GPIO 4
         GND [9]  [10]         ← DHT11 GND
 ⚠️ DRDY   [11] [12] ⚠️ RST    ← Reserved for HAT
    GPIO27 [13] [14] GND
           ...
```

### DHT11 (Temperature & Humidity)
| Wire | Connect To |
|------|------------|
| VCC | Pin 2 (5V) |
| DATA | Pin 7 (GPIO 4) |
| GND | Pin 9 |

### BH1750 (Light Sensor)
| Wire | Connect To |
|------|------------|
| VCC | Pin 1 (3.3V) |
| GND | Pin 6 or 9 |
| SDA | Pin 3 |
| SCL | Pin 5 |

### Soil Moisture Sensor
| Wire | Connect To |
|------|------------|
| VCC | HAT 5V terminal |
| GND | HAT GND terminal |
| SIG | HAT AD0 |

### Camera Module 3
- Connect via CSI ribbon cable (under the HAT)
- Blue side facing USB ports on Pi 5

## Testing Sensors

```bash
# Activate virtual environment
cd ~/Plante/hardware
source venv/bin/activate

# Test DHT11 (temperature & humidity)
python3 sensors/DHT.py

# Test light sensor
python3 sensors/light_sensor.py

# Test soil moisture / ADC
python3 sensors/soil_moisture.py --test-adc
python3 sensors/soil_moisture.py

# Test camera
python3 sensors/camera.py
python3 sensors/camera.py --timelapse 10 5
```

## Troubleshooting

### DHT11 not reading
- Ensure using 5V (not 3.3V)
- Check GPIO 4 (Pin 7) connection
- GPIO 17 conflicts with HAT - don't use it

### Soil moisture sensor not working
- Verify SPI is enabled: `ls /dev/spidev*`
- Check HAT is seated properly on all 40 pins

### Camera not detected
```bash
rpicam-hello --list-cameras
```

### Module not found errors
```bash
# Recreate venv with system packages
rm -rf venv
python3 -m venv venv --system-site-packages
source venv/bin/activate
pip install spidev adafruit-circuitpython-dht smbus2 picamera2
```

## Reserved GPIO Pins (Waveshare HAT)

Do NOT use these pins when HAT is installed:

| GPIO | Pin | Function |
|------|-----|----------|
| 17 | 11 | DRDY |
| 18 | 12 | RST |
| 8 | 24 | SPI CE0 |
| 9 | 21 | SPI MISO |
| 10 | 19 | SPI MOSI |
| 11 | 23 | SPI SCLK |

## Files

```
hardware/
├── README.md
├── requirements.txt
├── plante-api.service      # systemd service for auto-start
├── api/
│   ├── main.py             # FastAPI entry point
│   ├── .env.example        # Environment configuration
│   ├── models/
│   │   └── schemas.py      # Pydantic response models
│   ├── routers/
│   │   ├── health.py       # Health check endpoint
│   │   ├── sensors.py      # Sensor reading endpoints
│   │   └── camera.py       # Camera capture endpoints
│   └── services/
│       ├── sensor_service.py   # Sensor abstraction layer
│       └── camera_service.py   # Camera abstraction layer
├── motors/
│   └── servo.py
└── sensors/
    ├── DHT.py
    ├── light_sensor.py
    ├── soil_moisture.py
    └── camera.py
```

## API Server

FastAPI server exposing sensor readings and camera functionality.

### Setup

```bash
cd ~/Plante/hardware
source venv/bin/activate
pip install -r requirements.txt
cp api/.env.example api/.env
```

### Running the Server

```bash
# Development (with auto-reload)
cd ~/Plante/hardware
source venv/bin/activate
python -m api.main

# Or directly with uvicorn
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running as a Service

```bash
# Copy service file
sudo cp plante-api.service /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable plante-api
sudo systemctl start plante-api

# Check status
sudo systemctl status plante-api
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info |
| GET | `/health` | Health check with uptime and sensor availability |
| GET | `/sensors` | All sensor readings |
| GET | `/sensors/temperature` | Temperature and humidity from DHT11 |
| GET | `/sensors/light` | Light intensity from BH1750 |
| GET | `/sensors/soil` | Soil moisture percentage |
| GET | `/camera/capture` | Capture a new photo |
| GET | `/camera/latest` | Get latest photo metadata |
| GET | `/camera/latest/file` | Get latest photo as JPEG |

### Example Response (GET /sensors)

```json
{
  "timestamp": "2025-01-17T23:10:00Z",
  "temperature": { "value": 22.5, "unit": "celsius" },
  "humidity": { "value": 65.0, "unit": "percent" },
  "light": { "value": 450.5, "unit": "lux", "description": "Normal indoor" },
  "soil_moisture": { "value": 45.2, "unit": "percent" },
  "status": "ok",
  "errors": []
}
```

### Configuration

Environment variables in `api/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_PORT` | 8000 | Server port |
| `API_HOST` | 0.0.0.0 | Server host |
| `API_KEY` | _(empty)_ | Optional API key for authentication |
| `CORS_ORIGINS` | * | Allowed CORS origins (comma-separated) |
| `POLL_INTERVAL` | 30 | Sensor cache interval in seconds |

### Authentication

If `API_KEY` is set, all sensor and camera endpoints require the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-secret-key" http://raspberrypi.local:8000/sensors
```

