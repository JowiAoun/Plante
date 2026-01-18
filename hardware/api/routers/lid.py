"""
Lid Control Router

Endpoints for controlling the greenhouse lid via servos.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal

router = APIRouter(prefix="/lid", tags=["lid"])


class LidCommand(BaseModel):
    """Lid control command."""
    action: Literal["open", "close", "toggle"]


class LidStatus(BaseModel):
    """Current lid status."""
    is_open: bool
    angle: int
    message: str
    connected: bool = False


@router.get("/status", response_model=LidStatus)
async def get_lid_status():
    """Get current lid status."""
    from api.services.lid_service import get_lid_service
    
    service = get_lid_service()
    status = service.get_status()
    
    return LidStatus(
        is_open=status["is_open"],
        angle=status["angle"],
        connected=status["connected"],
        message="open" if status["is_open"] else "closed"
    )


@router.post("/control", response_model=LidStatus)
async def control_lid(command: LidCommand):
    """
    Control the greenhouse lid.
    
    Actions:
    - open: Open the lid
    - close: Close the lid
    - toggle: Toggle current state
    """
    from api.services.lid_service import get_lid_service
    
    service = get_lid_service()
    
    # Execute action
    if command.action == "open":
        success = service.open_lid()
        action_msg = "opened"
    elif command.action == "close":
        success = service.close_lid()
        action_msg = "closed"
    else:  # toggle
        success = service.toggle_lid()
        status = service.get_status()
        action_msg = "opened" if status["is_open"] else "closed"
    
    if not success:
        raise HTTPException(
            status_code=503,
            detail="Failed to control lid. Arduino may not be connected."
        )
    
    status = service.get_status()
    
    return LidStatus(
        is_open=status["is_open"],
        angle=status["angle"],
        connected=status["connected"],
        message=f"Lid {action_msg} successfully"
    )


# Export router
lid_router = router
