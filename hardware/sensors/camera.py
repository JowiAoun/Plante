#!/usr/bin/env python3
#############################################################################
# Filename    : camera.py
# Description : Capture photos with Raspberry Pi Camera Module 3
# Hardware    : Pi Camera Module 3 (IMX708) via CSI connector
#############################################################################
import os
import time
from datetime import datetime

try:
    from picamera2 import Picamera2
    import libcamera
except ImportError:
    print("picamera2 not installed. Run: pip install picamera2")
    Picamera2 = None
    libcamera = None


class PlantCamera:
    """Raspberry Pi Camera for greenhouse monitoring."""
    
    def __init__(self, save_dir="~/Plante/hardware/photos"):
        if Picamera2 is None:
            raise ImportError("picamera2 library is not installed")
            
        self.save_dir = os.path.expanduser(save_dir)
        os.makedirs(self.save_dir, exist_ok=True)
        
        self.camera = Picamera2()
        # Configure for still photos
        config = self.camera.create_still_configuration(
            main={"size": (4608, 2592)},  # Full resolution
            display=None
        )
        self.camera.configure(config)
        
    def capture(self, filename=None):
        """
        Capture a single photo.
        
        Args:
            filename: Optional filename. If None, uses timestamp.
            
        Returns:
            Path to saved image
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"plant_{timestamp}.jpg"
        
        filepath = os.path.join(self.save_dir, filename)
        
        self.camera.start()
        time.sleep(0.5)  # Let camera adjust exposure
        self.camera.capture_file(filepath)
        self.camera.stop()
        
        print(f"Photo saved: {filepath}")
        return filepath
    
    def capture_timelapse(self, count=10, interval=5, prefix="timelapse"):
        """
        Capture a series of photos for timelapse.
        
        Args:
            count: Number of photos to take
            interval: Seconds between photos
            prefix: Filename prefix
        """
        print(f"Starting timelapse: {count} photos, {interval}s interval")
        
        self.camera.start()
        time.sleep(1)  # Initial warmup
        
        for i in range(count):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{prefix}_{i:04d}_{timestamp}.jpg"
            filepath = os.path.join(self.save_dir, filename)
            
            self.camera.capture_file(filepath)
            print(f"[{i+1}/{count}] Captured: {filename}")
            
            if i < count - 1:
                time.sleep(interval)
        
        self.camera.stop()
        print("Timelapse complete!")
        
    def preview(self, duration=5):
        """
        Show preview for specified seconds (requires display).
        
        Args:
            duration: Preview duration in seconds
        """
        print(f"Preview for {duration} seconds...")
        self.camera.start_preview()
        self.camera.start()
        time.sleep(duration)
        self.camera.stop()
        self.camera.stop_preview()
        
    def close(self):
        """Clean up camera resources."""
        self.camera.close()


def main():
    """Main function - take a single photo."""
    print("Pi Camera Module 3 - Photo Capture")
    print("=" * 40)
    
    try:
        camera = PlantCamera()
        filepath = camera.capture()
        camera.close()
        
        print()
        print(f"To view on your local machine, run:")
        print(f"  scp jeremyfriesen@<pi-ip>:{filepath} ~/Desktop/")
        
    except Exception as e:
        print(f"Error: {e}")
        raise


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == '--timelapse':
            count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            interval = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            camera = PlantCamera()
            camera.capture_timelapse(count=count, interval=interval)
            camera.close()
        elif sys.argv[1] == '--help':
            print("Usage:")
            print("  python3 camera.py              # Take single photo")
            print("  python3 camera.py --timelapse [count] [interval]")
            print("                                  # Take timelapse photos")
    else:
        main()
