import uuid
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

class CreateRoomResponse(BaseModel):
    room_id: str

@router.post("", response_model=CreateRoomResponse)
async def create_room():
    # Generate a short, 8-character unique ID for the room
    room_id = str(uuid.uuid4())[:8]
    return CreateRoomResponse(room_id=room_id)