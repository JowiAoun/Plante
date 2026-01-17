#!/usr/bin/env python3
#############################################################################
# Filename    : DHT.py
# Description : Read the temperature and humidity data of DHT11
# Using       : Adafruit CircuitPython DHT library
########################################################################
import time
import board
import adafruit_dht

# Initialize the DHT11 sensor on GPIO 17 (board.D17)
dht_device = adafruit_dht.DHT11(board.D17)

def loop():
    counts = 0  # Measurement counts
    while True:
        counts += 1
        print(f"Measurement counts: {counts}")
        
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

if __name__ == '__main__':
    print('Program is starting...')
    try:
        loop()
    except KeyboardInterrupt:
        print("\nExiting...")
        dht_device.exit()   
