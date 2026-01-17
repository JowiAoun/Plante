"""
Camera router - endpoints for camera operations
"""
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from api.models import PhotoResponse
from api.services import get_camera_service

router = APIRouter(prefix="/camera", tags=["camera"])


@router.get("/capture", response_model=PhotoResponse)
async def capture_photo(filename: Optional[str] = None) -> PhotoResponse:
    """
    Capture a new photo.
    
    Args:
        filename: Optional filename for the photo
        
    Returns:
        Photo metadata including filepath
    """
    camera_service = get_camera_service()
    
    if not camera_service.is_available:
        raise HTTPException(
            status_code=503,
            detail="Camera not available"
        )
    
    response = camera_service.capture(filename=filename)
    
    if not response.success:
        raise HTTPException(
            status_code=500,
            detail=response.error or "Failed to capture photo"
        )
    
    return response


@router.get("/latest", response_model=PhotoResponse)
async def get_latest_photo() -> PhotoResponse:
    """
    Get metadata for the most recent photo.
    
    Returns:
        Latest photo metadata
    """
    camera_service = get_camera_service()
    response = camera_service.get_latest()
    
    if not response.success:
        raise HTTPException(
            status_code=404,
            detail=response.error or "No photos found"
        )
    
    return response


@router.get("/latest/file")
async def get_latest_photo_file():
    """
    Get the actual image file of the most recent photo.
    
    Returns:
        JPEG image file
    """
    camera_service = get_camera_service()
    response = camera_service.get_latest()
    
    if not response.success or not response.filepath:
        raise HTTPException(
            status_code=404,
            detail=response.error or "No photos found"
        )
    
    return FileResponse(
        response.filepath,
        media_type="image/jpeg",
        filename=response.filename
    )
