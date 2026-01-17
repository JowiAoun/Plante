# Routers package
from .health import router as health_router
from .sensors import router as sensors_router
from .camera import router as camera_router

__all__ = [
    "health_router",
    "sensors_router", 
    "camera_router",
]
