"""
Health check router
"""
import time
from fastapi import APIRouter

from api.models import HealthResponse
from api.services import get_sensor_service

router = APIRouter(tags=["health"])

# Track server start time
_start_time = time.time()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns server status, version, uptime, and available sensors.
    """
    sensor_service = get_sensor_service()
    uptime = time.time() - _start_time
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        uptime_seconds=round(uptime, 2),
        sensors_available=sensor_service.get_available_sensors()
    )
