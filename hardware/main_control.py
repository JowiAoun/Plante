#!/usr/bin/env python3
"""
Plante Greenhouse Main Control Loop

Continuously monitors sensors and controls the greenhouse lid
based on configurable thresholds for Kalanchoe care.

Usage:
    python3 main_control.py           # Run control loop
    python3 main_control.py --once    # Single reading (debug)
"""

import json
import time
import sys
import os
from datetime import datetime
from pathlib import Path

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.services.sensor_service import SensorService
from arduino.servo_control import DualServoController


CONFIG_FILE = Path(__file__).parent / "config.json"


class GreenhouseController:
    """Main greenhouse automation controller."""
    
    def __init__(self):
        self.sensor_service = None
        self.servo_controller = None
        self.lid_is_open = False
        self.config = {}
        
    def load_config(self) -> dict:
        """Load config from JSON file (reloads on each call for live updates)."""
        try:
            with open(CONFIG_FILE, 'r') as f:
                self.config = json.load(f)
            return self.config
        except Exception as e:
            print(f"[ERROR] Failed to load config: {e}")
            # Return defaults if config fails
            return {
                "thresholds": {
                    "temperature": {"min": 15, "max": 28},
                    "humidity": {"min": 30, "max": 70},
                    "soil_moisture": {"min": 20},
                    "light": {"min": 200}
                },
                "servo": {"lid_open": 90, "lid_closed": 0},
                "poll_interval": 30,
                "actions_enabled": True
            }
    
    def connect(self) -> bool:
        """Initialize sensors and servo connection."""
        print("[INFO] Initializing sensors...")
        try:
            self.sensor_service = SensorService(poll_interval=5)
            print(f"[INFO] Available sensors: {self.sensor_service.get_available_sensors()}")
        except Exception as e:
            print(f"[ERROR] Failed to initialize sensors: {e}")
            return False
        
        print("[INFO] Connecting to Arduino...")
        self.servo_controller = DualServoController()
        if not self.servo_controller.connect():
            print("[ERROR] Failed to connect to Arduino")
            return False
        
        print("[INFO] Greenhouse controller ready!")
        return True
    
    def open_lid(self, reason: str):
        """Open greenhouse lid using both servos."""
        if self.lid_is_open:
            return
        
        config = self.load_config()
        angle = config.get("servo", {}).get("lid_open", 90)
        
        print(f"[ACTION] Opening lid ({reason})")
        self.servo_controller.set_servo("both", angle)
        self.lid_is_open = True
        
    def close_lid(self, reason: str):
        """Close greenhouse lid using both servos."""
        if not self.lid_is_open:
            return
        
        config = self.load_config()
        angle = config.get("servo", {}).get("lid_closed", 0)
        
        print(f"[ACTION] Closing lid ({reason})")
        self.servo_controller.set_servo("both", angle)
        self.lid_is_open = False
    
    def check_thresholds(self, readings: dict) -> None:
        """Check sensor readings against thresholds and take action."""
        config = self.load_config()
        thresholds = config.get("thresholds", {})
        actions_enabled = config.get("actions_enabled", True)
        
        temp = readings.get("temperature")
        humidity = readings.get("humidity")
        soil = readings.get("soil_moisture")
        light = readings.get("light")
        
        # Temperature check
        if temp is not None:
            temp_thresh = thresholds.get("temperature", {})
            if temp > temp_thresh.get("max", 28):
                print(f"[ALERT] Temperature too high: {temp}°C > {temp_thresh['max']}°C")
                if actions_enabled:
                    self.open_lid("temperature too high")
            elif temp < temp_thresh.get("min", 15):
                print(f"[ALERT] Temperature too low: {temp}°C < {temp_thresh['min']}°C")
                if actions_enabled:
                    self.close_lid("temperature too low")
        
        # Humidity check
        if humidity is not None:
            hum_thresh = thresholds.get("humidity", {})
            if humidity > hum_thresh.get("max", 70):
                print(f"[ALERT] Humidity too high: {humidity}% > {hum_thresh['max']}%")
                if actions_enabled:
                    self.open_lid("humidity too high")
            elif humidity < hum_thresh.get("min", 30):
                print(f"[ALERT] Humidity too low: {humidity}% < {hum_thresh['min']}%")
                if actions_enabled:
                    self.close_lid("humidity too low")
        
        # Soil moisture check (warning only for now)
        if soil is not None:
            soil_thresh = thresholds.get("soil_moisture", {})
            if soil < soil_thresh.get("min", 20):
                print(f"[WARNING] Soil moisture low: {soil}% < {soil_thresh['min']}% - consider watering")
        
        # Light check (warning only)
        if light is not None:
            light_thresh = thresholds.get("light", {})
            if light < light_thresh.get("min", 200):
                print(f"[WARNING] Light level low: {light} lux < {light_thresh['min']} lux")
    
    def read_sensors(self) -> dict:
        """Read all sensors and return values."""
        try:
            response = self.sensor_service.read_all(use_cache=False)
            
            readings = {
                "temperature": response.temperature.value if response.temperature else None,
                "humidity": response.humidity.value if response.humidity else None,
                "soil_moisture": response.soil_moisture.value if response.soil_moisture else None,
                "light": response.light.value if response.light else None,
            }
            
            return readings
        except Exception as e:
            print(f"[ERROR] Sensor read failed: {e}")
            return {}
    
    def run_once(self) -> None:
        """Single control loop iteration (for testing)."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        readings = self.read_sensors()
        
        print(f"\n[{timestamp}] Sensor Readings:")
        print(f"  Temperature: {readings.get('temperature', 'N/A')}°C")
        print(f"  Humidity:    {readings.get('humidity', 'N/A')}%")
        print(f"  Soil:        {readings.get('soil_moisture', 'N/A')}%")
        print(f"  Light:       {readings.get('light', 'N/A')} lux")
        print(f"  Lid:         {'OPEN' if self.lid_is_open else 'CLOSED'}")
        
        self.check_thresholds(readings)
    
    def run(self) -> None:
        """Main control loop."""
        print("\n" + "="*50)
        print("  PLANTE GREENHOUSE CONTROLLER")
        print("  Press Ctrl+C to exit")
        print("="*50 + "\n")
        
        try:
            while True:
                self.run_once()
                
                config = self.load_config()
                interval = config.get("poll_interval", 30)
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n[INFO] Shutting down...")
            self.close_lid("shutdown")
            
    def cleanup(self) -> None:
        """Clean up resources."""
        if self.servo_controller:
            self.servo_controller.close()
        if self.sensor_service:
            self.sensor_service.cleanup()


def main():
    controller = GreenhouseController()
    
    if not controller.connect():
        print("[FATAL] Failed to initialize. Exiting.")
        sys.exit(1)
    
    try:
        if "--once" in sys.argv:
            controller.run_once()
        else:
            controller.run()
    finally:
        controller.cleanup()


if __name__ == "__main__":
    main()
