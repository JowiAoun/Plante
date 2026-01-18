"""
Lid Control Service

Service for controlling the greenhouse lid via Arduino-connected servos.
"""

import json
import time
from pathlib import Path
from typing import Optional

# Global lid state
_lid_state = {
    "is_open": False,
    "angle": 0,
}

# Config file path
CONFIG_FILE = Path(__file__).parent.parent.parent / "config.json"


def get_config() -> dict:
    """Load config from JSON file."""
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        return {
            "servo": {"lid_open": 90, "lid_closed": 0}
        }


class LidService:
    """Service for controlling the greenhouse lid."""
    
    def __init__(self):
        self.controller = None
        self._connected = False
    
    def connect(self) -> bool:
        """Connect to the Arduino servo controller."""
        try:
            # Import here to avoid issues when Arduino not connected
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent.parent))
            from arduino.servo_control import DualServoController
            
            self.controller = DualServoController()
            if self.controller.connect():
                self._connected = True
                return True
            return False
        except ImportError as e:
            print(f"[LidService] Import error: {e}")
            return False
        except Exception as e:
            print(f"[LidService] Connection error: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from Arduino."""
        if self.controller:
            self.controller.close()
            self._connected = False
    
    def is_connected(self) -> bool:
        """Check if connected to Arduino."""
        return self._connected
    
    def get_status(self) -> dict:
        """Get current lid status."""
        return {
            "is_open": _lid_state["is_open"],
            "angle": _lid_state["angle"],
            "connected": self._connected,
        }
    
    def open_lid(self) -> bool:
        """Open the greenhouse lid."""
        if _lid_state["is_open"]:
            return True  # Already open
        
        config = get_config()
        target = config.get("servo", {}).get("lid_open", 90)
        
        success = self._move_to_angle(target)
        if success:
            _lid_state["is_open"] = True
            _lid_state["angle"] = target
        return success
    
    def close_lid(self) -> bool:
        """Close the greenhouse lid."""
        if not _lid_state["is_open"]:
            return True  # Already closed
        
        config = get_config()
        target = config.get("servo", {}).get("lid_closed", 0)
        
        success = self._move_to_angle(target)
        if success:
            _lid_state["is_open"] = False
            _lid_state["angle"] = target
        return success
    
    def toggle_lid(self) -> bool:
        """Toggle the lid state."""
        if _lid_state["is_open"]:
            return self.close_lid()
        else:
            return self.open_lid()
    
    def _move_to_angle(self, target: int) -> bool:
        """Move servos smoothly to target angle."""
        if not self._connected and not self.connect():
            # If not connected, just update state (for dev mode)
            print(f"[LidService] Not connected, simulating move to {target}°")
            return True
        
        try:
            current = _lid_state.get("angle", 0)
            step = 5 if target > current else -5
            
            if abs(target - current) > abs(step):
                angles = range(current, target, step)
                for angle in angles:
                    self.controller.send_command(f"both:{angle}")
                    time.sleep(0.05)
            
            # Ensure we hit exact target
            self.controller.send_command(f"both:{target}")
            return True
        except Exception as e:
            print(f"[LidService] Move error: {e}")
            return False


# Singleton instance
_lid_service: Optional[LidService] = None


def get_lid_service() -> LidService:
    """Get singleton lid service instance."""
    global _lid_service
    if _lid_service is None:
        _lid_service = LidService()
    return _lid_service
