"""
Config router - endpoints for greenhouse configuration
Allows frontend dashboard to read/update thresholds
"""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/config", tags=["config"])

CONFIG_FILE = Path(__file__).parent.parent.parent / "config.json"


class ThresholdRange(BaseModel):
    min: Optional[float] = None
    max: Optional[float] = None
    unit: Optional[str] = None


class Thresholds(BaseModel):
    temperature: Optional[ThresholdRange] = None
    humidity: Optional[ThresholdRange] = None
    soil_moisture: Optional[ThresholdRange] = None
    light: Optional[ThresholdRange] = None


class ServoConfig(BaseModel):
    lid_open: int = 90
    lid_closed: int = 0


class GreenhouseConfig(BaseModel):
    thresholds: Thresholds
    servo: ServoConfig
    poll_interval: int = 30
    actions_enabled: bool = True


def load_config() -> dict:
    """Load config from JSON file."""
    try:
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load config: {e}")


def save_config(config: dict) -> None:
    """Save config to JSON file."""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save config: {e}")


@router.get("", response_model=GreenhouseConfig)
async def get_config() -> dict:
    """
    Get current greenhouse configuration.
    
    Returns:
        Current thresholds, servo positions, and settings
    """
    return load_config()


@router.put("")
async def update_config(config: GreenhouseConfig) -> dict:
    """
    Update greenhouse configuration.
    
    Changes take effect on the next main_control.py poll cycle.
    
    Args:
        config: New configuration values
        
    Returns:
        Updated configuration
    """
    config_dict = config.model_dump()
    save_config(config_dict)
    return {"status": "ok", "config": config_dict}


@router.patch("/thresholds")
async def update_thresholds(thresholds: Thresholds) -> dict:
    """
    Partially update just the thresholds.
    
    Args:
        thresholds: Threshold values to update (only specified fields are updated)
        
    Returns:
        Updated configuration
    """
    config = load_config()
    
    # Merge new thresholds with existing
    new_thresholds = thresholds.model_dump(exclude_none=True)
    for sensor, values in new_thresholds.items():
        if sensor not in config["thresholds"]:
            config["thresholds"][sensor] = {}
        config["thresholds"][sensor].update(values)
    
    save_config(config)
    return {"status": "ok", "thresholds": config["thresholds"]}


@router.post("/actions/toggle")
async def toggle_actions(enabled: bool) -> dict:
    """
    Enable or disable automatic actions (lid control).
    
    Args:
        enabled: True to enable automatic actions, False to disable
        
    Returns:
        Updated status
    """
    config = load_config()
    config["actions_enabled"] = enabled
    save_config(config)
    return {"status": "ok", "actions_enabled": enabled}
