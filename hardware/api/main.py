"""
Plante Raspberry Pi Sensor API

FastAPI server exposing sensor readings and camera functionality
for the Plante plant monitoring system.
"""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader

from api.routers import health_router, sensors_router, camera_router, config_router
from api.services import get_sensor_service, get_camera_service

# Load environment variables
load_dotenv()

# Configuration
API_VERSION = "1.0.0"
API_TITLE = "Plante Sensor API"
API_KEY = os.getenv("API_KEY", "")
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# API Key security (optional, disabled if API_KEY not set)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)):
    """Verify API key if one is configured."""
    if not API_KEY:
        # No API key configured, allow all requests
        return True
    
    if api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key"
        )
    return True


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Initialize sensors on startup, cleanup on shutdown.
    """
    # Startup
    print(f"Starting {API_TITLE} v{API_VERSION}")
    sensor_service = get_sensor_service()
    available = sensor_service.get_available_sensors()
    print(f"Available sensors: {', '.join(available) if available else 'none'}")
    
    yield
    
    # Shutdown
    print("Shutting down...")
    sensor_service.cleanup()
    get_camera_service().cleanup()
    print("Cleanup complete")


# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description="REST API for Raspberry Pi sensor readings and camera",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(sensors_router, dependencies=[Depends(verify_api_key)])
app.include_router(camera_router, dependencies=[Depends(verify_api_key)])
app.include_router(config_router, dependencies=[Depends(verify_api_key)])


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": API_TITLE,
        "version": API_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", "8000"))
    host = os.getenv("API_HOST", "0.0.0.0")
    
    uvicorn.run(
        "api.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )

