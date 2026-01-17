"""
Sensors router - endpoints for reading sensor data
"""
from typing import Optional
from fastapi import APIRouter, HTTPException

from api.models import (
    SensorResponse,
    TemperatureReading,
    HumidityReading,
    LightReading,
    SoilMoistureReading,
)
from api.services import get_sensor_service

router = APIRouter(prefix="/sensors", tags=["sensors"])


@router.get("", response_model=SensorResponse)
async def get_all_sensors(use_cache: bool = True) -> SensorResponse:
    """
    Get all sensor readings.
    
    Args:
        use_cache: If True (default), return cached data if available
        
    Returns:
        All sensor readings with timestamp and status
    """
    sensor_service = get_sensor_service()
    return sensor_service.read_all(use_cache=use_cache)


@router.get("/temperature")
async def get_temperature() -> dict:
    """
    Get temperature and humidity readings from DHT11.
    
    Returns:
        Temperature and humidity readings
    """
    sensor_service = get_sensor_service()
    temp, humidity = sensor_service.read_temperature()
    
    if temp is None and humidity is None:
        raise HTTPException(
            status_code=503,
            detail="Temperature sensor unavailable"
        )
    
    return {
        "temperature": temp,
        "humidity": humidity
    }


@router.get("/light", response_model=Optional[LightReading])
async def get_light() -> Optional[LightReading]:
    """
    Get light intensity reading from BH1750.
    
    Returns:
        Light reading in lux with description
    """
    sensor_service = get_sensor_service()
    light = sensor_service.read_light()
    
    if light is None:
        raise HTTPException(
            status_code=503,
            detail="Light sensor unavailable"
        )
    
    return light


@router.get("/soil", response_model=Optional[SoilMoistureReading])
async def get_soil_moisture() -> Optional[SoilMoistureReading]:
    """
    Get soil moisture reading.
    
    Returns:
        Soil moisture percentage
    """
    sensor_service = get_sensor_service()
    soil = sensor_service.read_soil_moisture()
    
    if soil is None:
        raise HTTPException(
            status_code=503,
            detail="Soil moisture sensor unavailable"
        )
    
    return soil
