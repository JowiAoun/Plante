"""
Sensor service layer - wraps existing sensor scripts for API use
"""
import sys
import os
import time
import threading
from datetime import datetime
from typing import Optional, Dict, Any, List

# Add parent sensors directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'sensors'))

from api.models import (
    TemperatureReading,
    HumidityReading,
    LightReading,
    SoilMoistureReading,
    SensorError,
    SensorResponse,
)


class SensorService:
    """
    Service for reading all sensors with caching and error handling.
    
    Wraps the existing sensor scripts and provides a unified interface
    for the API layer.
    """
    
    def __init__(self, poll_interval: int = 30):
        """
        Initialize the sensor service.
        
        Args:
            poll_interval: Seconds between sensor polls (default 30)
        """
        self.poll_interval = poll_interval
        self._cached_data: Optional[SensorResponse] = None
        self._last_poll: Optional[datetime] = None
        self._lock = threading.Lock()
        
        # Sensor availability flags
        self._dht_available = False
        self._light_available = False
        self._soil_available = False
        
        # Lazy-loaded sensor instances
        self._dht_device = None
        self._light_sensor = None
        self._soil_sensor = None
        
        self._initialize_sensors()
    
    def _initialize_sensors(self) -> None:
        """Initialize sensor instances, tracking which are available."""
        # Try DHT11
        try:
            import board
            import adafruit_dht
            self._dht_device = adafruit_dht.DHT11(board.D4)
            self._dht_available = True
        except Exception as e:
            print(f"DHT11 not available: {e}")
        
        # Try light sensor
        try:
            from light_sensor import LightSensor
            self._light_sensor = LightSensor()
            self._light_available = True
        except Exception as e:
            print(f"Light sensor not available: {e}")
        
        # Try soil moisture sensor
        try:
            from soil_moisture import SoilMoistureSensor
            self._soil_sensor = SoilMoistureSensor()
            self._soil_available = True
        except Exception as e:
            print(f"Soil moisture sensor not available: {e}")
    
    def get_available_sensors(self) -> List[str]:
        """Return list of available sensor names."""
        available = []
        if self._dht_available:
            available.extend(["temperature", "humidity"])
        if self._light_available:
            available.append("light")
        if self._soil_available:
            available.append("soil_moisture")
        return available
    
    def _read_dht(self) -> tuple[Optional[TemperatureReading], Optional[HumidityReading], Optional[SensorError]]:
        """Read temperature and humidity from DHT11."""
        if not self._dht_available or self._dht_device is None:
            return None, None, SensorError(sensor="dht11", error="Sensor not available")
        
        try:
            temperature = self._dht_device.temperature
            humidity = self._dht_device.humidity
            
            if temperature is None or humidity is None:
                return None, None, SensorError(sensor="dht11", error="Failed to read sensor")
            
            return (
                TemperatureReading(value=round(temperature, 1), unit="celsius"),
                HumidityReading(value=round(humidity, 1), unit="percent"),
                None
            )
        except RuntimeError as e:
            # DHT sensors often have transient read errors
            return None, None, SensorError(sensor="dht11", error=str(e))
        except Exception as e:
            return None, None, SensorError(sensor="dht11", error=str(e))
    
    def _read_light(self) -> tuple[Optional[LightReading], Optional[SensorError]]:
        """Read light intensity from BH1750."""
        if not self._light_available or self._light_sensor is None:
            return None, SensorError(sensor="bh1750", error="Sensor not available")
        
        try:
            lux = self._light_sensor.read_light()
            description = self._light_sensor.get_light_level_description(lux)
            
            return (
                LightReading(value=round(lux, 2), unit="lux", description=description),
                None
            )
        except Exception as e:
            return None, SensorError(sensor="bh1750", error=str(e))
    
    def _read_soil(self) -> tuple[Optional[SoilMoistureReading], Optional[SensorError]]:
        """Read soil moisture percentage."""
        if not self._soil_available or self._soil_sensor is None:
            return None, SensorError(sensor="soil_moisture", error="Sensor not available")
        
        try:
            moisture = self._soil_sensor.read_moisture_percent()
            
            return (
                SoilMoistureReading(value=round(moisture, 1), unit="percent"),
                None
            )
        except Exception as e:
            return None, SensorError(sensor="soil_moisture", error=str(e))
    
    def read_all(self, use_cache: bool = True) -> SensorResponse:
        """
        Read all sensors and return unified response.
        
        Args:
            use_cache: If True, return cached data if within poll_interval
            
        Returns:
            SensorResponse with all available sensor data
        """
        with self._lock:
            # Check cache
            if use_cache and self._cached_data and self._last_poll:
                age = (datetime.utcnow() - self._last_poll).total_seconds()
                if age < self.poll_interval:
                    return self._cached_data
            
            # Read all sensors
            errors: List[SensorError] = []
            
            temp, humidity, dht_error = self._read_dht()
            if dht_error:
                errors.append(dht_error)
            
            light, light_error = self._read_light()
            if light_error:
                errors.append(light_error)
            
            soil, soil_error = self._read_soil()
            if soil_error:
                errors.append(soil_error)
            
            # Determine overall status
            total_sensors = 4  # temp, humidity, light, soil
            working_sensors = sum([
                temp is not None,
                humidity is not None,
                light is not None,
                soil is not None
            ])
            
            if working_sensors == total_sensors:
                status = "ok"
            elif working_sensors > 0:
                status = "degraded"
            else:
                status = "error"
            
            response = SensorResponse(
                timestamp=datetime.utcnow(),
                temperature=temp,
                humidity=humidity,
                light=light,
                soil_moisture=soil,
                status=status,
                errors=errors
            )
            
            # Update cache
            self._cached_data = response
            self._last_poll = datetime.utcnow()
            
            return response
    
    def read_temperature(self) -> tuple[Optional[TemperatureReading], Optional[HumidityReading]]:
        """Read just temperature and humidity."""
        temp, humidity, _ = self._read_dht()
        return temp, humidity
    
    def read_light(self) -> Optional[LightReading]:
        """Read just light intensity."""
        light, _ = self._read_light()
        return light
    
    def read_soil_moisture(self) -> Optional[SoilMoistureReading]:
        """Read just soil moisture."""
        soil, _ = self._read_soil()
        return soil
    
    def cleanup(self) -> None:
        """Clean up sensor resources."""
        if self._dht_device:
            try:
                self._dht_device.exit()
            except:
                pass
        
        if self._light_sensor:
            try:
                self._light_sensor.cleanup()
            except:
                pass
        
        if self._soil_sensor:
            try:
                self._soil_sensor.close()
            except:
                pass


# Global singleton instance
_sensor_service: Optional[SensorService] = None


def get_sensor_service() -> SensorService:
    """Get or create the global sensor service instance."""
    global _sensor_service
    if _sensor_service is None:
        _sensor_service = SensorService()
    return _sensor_service
