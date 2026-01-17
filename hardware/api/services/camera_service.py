"""
Camera service layer - wraps camera module for API use
"""
import os
import sys
from datetime import datetime
from typing import Optional

# Add parent sensors directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'sensors'))

from api.models import PhotoResponse


class CameraService:
    """
    Service for camera operations.
    
    Wraps the existing camera.py script for API use.
    """
    
    def __init__(self, save_dir: str = "~/Plante/hardware/photos"):
        self.save_dir = os.path.expanduser(save_dir)
        os.makedirs(self.save_dir, exist_ok=True)
        
        self._camera = None
        self._available = False
        
        self._initialize_camera()
    
    def _initialize_camera(self) -> None:
        """Initialize camera if available."""
        try:
            from camera import PlantCamera
            self._camera = PlantCamera(save_dir=self.save_dir)
            self._available = True
        except Exception as e:
            print(f"Camera not available: {e}")
    
    @property
    def is_available(self) -> bool:
        """Check if camera is available."""
        return self._available
    
    def capture(self, filename: Optional[str] = None) -> PhotoResponse:
        """
        Capture a photo.
        
        Args:
            filename: Optional filename, uses timestamp if not provided
            
        Returns:
            PhotoResponse with result
        """
        if not self._available or self._camera is None:
            return PhotoResponse(
                success=False,
                error="Camera not available"
            )
        
        try:
            filepath = self._camera.capture(filename=filename)
            return PhotoResponse(
                success=True,
                filepath=filepath,
                filename=os.path.basename(filepath),
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            return PhotoResponse(
                success=False,
                error=str(e)
            )
    
    def get_latest(self) -> PhotoResponse:
        """
        Get the most recent photo.
        
        Returns:
            PhotoResponse with latest photo info
        """
        if not os.path.exists(self.save_dir):
            return PhotoResponse(
                success=False,
                error="No photos directory"
            )
        
        try:
            # Find most recent jpg file
            photos = [
                f for f in os.listdir(self.save_dir)
                if f.endswith('.jpg')
            ]
            
            if not photos:
                return PhotoResponse(
                    success=False,
                    error="No photos found"
                )
            
            # Sort by modification time
            photos.sort(
                key=lambda f: os.path.getmtime(os.path.join(self.save_dir, f)),
                reverse=True
            )
            
            latest = photos[0]
            filepath = os.path.join(self.save_dir, latest)
            
            return PhotoResponse(
                success=True,
                filepath=filepath,
                filename=latest,
                timestamp=datetime.fromtimestamp(os.path.getmtime(filepath))
            )
        except Exception as e:
            return PhotoResponse(
                success=False,
                error=str(e)
            )
    
    def cleanup(self) -> None:
        """Clean up camera resources."""
        if self._camera:
            try:
                self._camera.close()
            except:
                pass


# Global singleton instance
_camera_service: Optional[CameraService] = None


def get_camera_service() -> CameraService:
    """Get or create the global camera service instance."""
    global _camera_service
    if _camera_service is None:
        _camera_service = CameraService()
    return _camera_service
