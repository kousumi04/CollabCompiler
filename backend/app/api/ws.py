from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(websocket, room_id)
    try:
        # Notify others in the room that someone joined
        await manager.broadcast(
            {"type": "USER_JOINED", "client_id": client_id},
            room_id
        )
        
        # Keep the connection open and listen for messages
        while True:
            data = await websocket.receive_json()
            # For now, just echo the message to everyone in the room
            await manager.broadcast(data, room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast(
            {"type": "USER_LEFT", "client_id": client_id},
            room_id
        )