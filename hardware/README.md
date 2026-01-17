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
├── motors/
│   └── servo.py
└── sensors/
    ├── DHT.py
    ├── light_sensor.py
    ├── soil_moisture.py
    └── camera.py
```
