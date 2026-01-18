#!/usr/bin/env python3
#############################################################################
# Filename    : DHT.py
# Description : Read the temperature and humidity data of DHT11
# Using       : Adafruit CircuitPython DHT library (direct) or HTTP API
########################################################################
import time
import sys
import os

# API URL configuration
API_URL = os.getenv("PLANTE_API_URL", "http://localhost:8000")


def read_from_api(api_url: str = API_URL):
    """Read temperature and humidity from the running API instead of direct GPIO access."""
    import requests
    
    print("Reading temperature/humidity via API...")
    print(f"API URL: {api_url}")
    print("=" * 50)
    print()
    
    try:
        count = 0
        while True:
            count += 1
            try:
                response = requests.get(f"{api_url}/sensors", timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    temp_data = data.get("temperature", {})
                    hum_data = data.get("humidity", {})
                    
                    temp = temp_data.get("value", "N/A") if temp_data else "N/A"
                    humidity = hum_data.get("value", "N/A") if hum_data else "N/A"
                    
                    if temp != "N/A" and humidity != "N/A":
                        print(f"[{count}] Humidity: {humidity:.2f}%, \t Temperature: {temp:.2f}°C")
                    else:
                        print(f"[{count}] Sensor data unavailable")
                elif response.status_code == 503:
                    print(f"[{count}] Sensor unavailable - API returned 503")
                else:
                    print(f"[{count}] API error: {response.status_code}")
            except requests.exceptions.ConnectionError:
                print(f"[{count}] Cannot connect to API at {api_url}")
                print("    Is the plante-api service running?")
                print("    Check: sudo systemctl status plante-api")
            except requests.exceptions.Timeout:
                print(f"[{count}] API request timed out")
            
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nExiting...")


def read_direct_gpio():
    """Read directly from GPIO (only use when API is stopped)."""
    import board
    import adafruit_dht
    
    # Initialize the DHT11 sensor on GPIO 17 (board.D4)
    dht_device = adafruit_dht.DHT11(board.D4)
    
    print("Reading temperature/humidity via DIRECT GPIO...")
    print("WARNING: This will conflict with plante-api service!")
    print("=" * 50)
    print()
    
    try:
        count = 0
        while True:
            count += 1
            print(f"Measurement counts: {count}")
            
            try:
                temperature = dht_device.temperature
                humidity = dht_device.humidity
                print(f"Humidity: {humidity:.2f}%, \t Temperature: {temperature:.2f}°C")
            except RuntimeError as error:
                # Reading errors happen fairly often with DHT sensors, just retry
                print(f"Reading error: {error.args[0]}")
            except Exception as error:
                dht_device.exit()
                raise error
            
            time.sleep(2)
    except KeyboardInterrupt:
        print("\nExiting...")
        dht_device.exit()


if __name__ == '__main__':
    print('DHT11 Temperature/Humidity Sensor')
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--direct-gpio':
        # Direct GPIO mode - for when API is stopped
        read_direct_gpio()
    else:
        # Default: Use API mode (avoids GPIO conflicts with plante-api service)
        api_url = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else API_URL
        read_from_api(api_url)
