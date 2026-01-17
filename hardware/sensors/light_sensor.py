#!/usr/bin/env python3
#############################################################################
# Filename    : light_sensor.py
# Description : Read light intensity from GY-30 (BH1750) sensor via I2C
# Hardware    : GY-30 on I2C (SDA=GPIO2, SCL=GPIO3)
########################################################################
import time
import smbus2
import os

# BH1750 I2C address (ADDR pin low or unconnected = 0x23, ADDR pin high = 0x5C)
BH1750_ADDR = 0x23

def find_i2c_bus():
    """Find the correct I2C bus number (differs between Pi models)."""
    # Check common bus numbers
    for bus_num in [1, 11, 13, 14]:
        if os.path.exists(f"/dev/i2c-{bus_num}"):
            return bus_num
    return 1  # Default fallback

# BH1750 Commands
POWER_ON = 0x01
POWER_OFF = 0x00
RESET = 0x07

# Measurement modes
CONTINUOUS_HIGH_RES_MODE = 0x10   # 1 lux resolution, 120ms
CONTINUOUS_HIGH_RES_MODE_2 = 0x11 # 0.5 lux resolution, 120ms
CONTINUOUS_LOW_RES_MODE = 0x13    # 4 lux resolution, 16ms
ONE_TIME_HIGH_RES_MODE = 0x20     # 1 lux resolution, 120ms, auto power-down
ONE_TIME_HIGH_RES_MODE_2 = 0x21   # 0.5 lux resolution, 120ms, auto power-down
ONE_TIME_LOW_RES_MODE = 0x23      # 4 lux resolution, 16ms, auto power-down


class LightSensor:
    def __init__(self, bus_num=None, address=BH1750_ADDR):
        if bus_num is None:
            bus_num = find_i2c_bus()
        self.bus_num = bus_num
        self.bus = smbus2.SMBus(bus_num)
        self.address = address
        self._power_on()
        
    def _power_on(self):
        """Turn on the sensor."""
        self.bus.write_byte(self.address, POWER_ON)
        
    def _power_off(self):
        """Turn off the sensor."""
        self.bus.write_byte(self.address, POWER_OFF)
        
    def reset(self):
        """Reset the sensor data register."""
        self._power_on()
        self.bus.write_byte(self.address, RESET)
        
    def read_light(self, mode=CONTINUOUS_HIGH_RES_MODE):
        """
        Read light intensity in lux.
        
        Args:
            mode: Measurement mode (default: continuous high resolution)
            
        Returns:
            Light intensity in lux
        """
        self.bus.write_byte(self.address, mode)
        
        # Wait for measurement (120ms for high res, 16ms for low res)
        if mode in [CONTINUOUS_LOW_RES_MODE, ONE_TIME_LOW_RES_MODE]:
            time.sleep(0.024)  # 16ms + margin
        else:
            time.sleep(0.180)  # 120ms + margin
            
        # Read 2 bytes of data
        data = self.bus.read_i2c_block_data(self.address, mode, 2)
        
        # Convert to lux (data[0] << 8 | data[1]) / 1.2
        lux = (data[0] << 8 | data[1]) / 1.2
        return lux
    
    def read_light_fast(self):
        """Read light with low resolution (faster, 4 lux accuracy)."""
        return self.read_light(ONE_TIME_LOW_RES_MODE)
    
    def read_light_precise(self):
        """Read light with high resolution (0.5 lux accuracy)."""
        return self.read_light(ONE_TIME_HIGH_RES_MODE_2)
    
    def get_light_level_description(self, lux):
        """Get a human-readable description of the light level."""
        if lux < 1:
            return "Very dark (night)"
        elif lux < 50:
            return "Dim (indoor evening)"
        elif lux < 200:
            return "Low light (cloudy indoor)"
        elif lux < 500:
            return "Normal indoor"
        elif lux < 1000:
            return "Bright indoor"
        elif lux < 10000:
            return "Daylight (indirect sun)"
        elif lux < 50000:
            return "Bright daylight"
        else:
            return "Direct sunlight"
    
    def cleanup(self):
        """Clean up resources."""
        self._power_off()
        self.bus.close()


def demo():
    """Run a demo of light sensor readings."""
    bus_num = find_i2c_bus()
    print(f"Using I2C bus: {bus_num}")
    sensor = LightSensor(bus_num=bus_num)
    
    print("Reading light intensity...")
    print("-" * 40)
    
    try:
        while True:
            lux = sensor.read_light()
            description = sensor.get_light_level_description(lux)
            print(f"Light: {lux:>8.2f} lux - {description}")
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        sensor.cleanup()


if __name__ == '__main__':
    print('GY-30 Light Sensor starting...')
    try:
        demo()
    except FileNotFoundError:
        print("Error: I2C not enabled. Run 'sudo raspi-config' -> Interface Options -> I2C -> Enable")
    except Exception as e:
        print(f"Error: {e}")
