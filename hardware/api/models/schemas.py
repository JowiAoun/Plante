"""
Pydantic models for Raspberry Pi sensor API responses
"""
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class SensorReading(BaseModel):
    """Base sensor reading with value and unit"""
    value: float
    unit: str


class TemperatureReading(SensorReading):
    """Temperature reading from DHT11"""
    unit: Literal["celsius", "fahrenheit"] = "celsius"


class HumidityReading(SensorReading):
    """Humidity reading from DHT11"""
    unit: Literal["percent"] = "percent"


class LightReading(SensorReading):
    """Light intensity reading from BH1750"""
    unit: Literal["lux"] = "lux"
    description: Optional[str] = None


class SoilMoistureReading(SensorReading):
    """Soil moisture reading from SparkFun sensor"""
    unit: Literal["percent"] = "percent"


class SensorError(BaseModel):
    """Error information for a sensor"""
    sensor: str
    error: str


class SensorResponse(BaseModel):
    """Complete sensor data response"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    temperature: Optional[TemperatureReading] = None
    humidity: Optional[HumidityReading] = None
    light: Optional[LightReading] = None
    soil_moisture: Optional[SoilMoistureReading] = None
    status: Literal["ok", "degraded", "error"] = "ok"
    errors: List[SensorError] = Field(default_factory=list)


class HealthResponse(BaseModel):
    """Health check response"""
    status: Literal["healthy", "unhealthy"] = "healthy"
    version: str = "1.0.0"
    uptime_seconds: float
    sensors_available: List[str] = Field(default_factory=list)


class PhotoResponse(BaseModel):
    """Camera photo response"""
    success: bool
    filepath: Optional[str] = None
    filename: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    error: Optional[str] = None
