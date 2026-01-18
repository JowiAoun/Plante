# Routers package
from .health import router as health_router
from .sensors import router as sensors_router
from .camera import router as camera_router
from .config import router as config_router

__all__ = [
    "health_router",
    "sensors_router", 
    "camera_router",
    "config_router",
]

