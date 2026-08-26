from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(websocket, room_id)
    try:
        await manager.broadcast(
            {"type": "USER_JOINED", "client_id": client_id},
            room_id,
            exclude=websocket
        )
        
        while True:
            data = await websocket.receive_json()
            # Broadcast the incoming data to everyone else in the room
            await manager.broadcast(data, room_id, exclude=websocket)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(
            {"type": "USER_LEFT", "client_id": client_id},
            room_id
        )