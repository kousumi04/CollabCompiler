from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(websocket, room_id, client_id)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "REQUEST_CONTROL":
                await manager.request_control(room_id, client_id)
            
            elif msg_type == "CURSOR_UPDATE":
                # Quickly forward cursor updates to others for real-time tracking
                await manager.broadcast(
                    {
                        "type": "CURSOR_UPDATE",
                        "client_id": client_id,
                        "payload": data.get("payload")
                    }, 
                    room_id, 
                    exclude=client_id
                )
                
            elif msg_type in ["CODE_UPDATE", "LANGUAGE_UPDATE"]:
                # Only the current controller is allowed to modify code/language
                if manager.rooms[room_id]["controller"] == client_id:
                    await manager.broadcast(data, room_id, exclude=client_id)
            
    except WebSocketDisconnect:
        await manager.disconnect(room_id, client_id)