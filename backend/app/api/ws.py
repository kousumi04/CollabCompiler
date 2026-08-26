from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from app.services.executor import CodeExecutionService
from app.schemas.execution import ExecuteCodeRequest

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(websocket, room_id, client_id)
    
    try:
        # 1. SEND INITIAL SYNC STATE IF IT EXISTS
        room = manager.rooms[room_id]
        if room.get("code") is not None and room.get("language") is not None:
            await websocket.send_json({
                "type": "SYNC_STATE",
                "payload": {
                    "code": room["code"],
                    "language": room["language"]
                }
            })

        # 2. LISTEN FOR MESSAGES
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "REQUEST_CONTROL":
                await manager.request_control(room_id, client_id)
            
            elif msg_type == "CURSOR_UPDATE":
                await manager.broadcast(
                    {
                        "type": "CURSOR_UPDATE",
                        "client_id": client_id,
                        "payload": data.get("payload")
                    }, 
                    room_id, 
                    exclude=client_id
                )
                
            elif msg_type == "CODE_UPDATE":
                if manager.rooms[room_id]["controller"] == client_id:
                    # Cache the latest code
                    manager.rooms[room_id]["code"] = data["payload"]["code"]
                    await manager.broadcast(data, room_id, exclude=client_id)
                    
            elif msg_type == "LANGUAGE_UPDATE":
                if manager.rooms[room_id]["controller"] == client_id:
                    # Cache the latest language
                    manager.rooms[room_id]["language"] = data["payload"]["language"]
                    await manager.broadcast(data, room_id, exclude=client_id)
                    
            elif msg_type == "RUN_CODE":
                if manager.rooms[room_id]["controller"] == client_id:
                    await manager.broadcast({"type": "RUN_STARTED"}, room_id)
                    
                    payload = data.get("payload", {})
                    req = ExecuteCodeRequest(
                        language=payload.get("language"),
                        code=payload.get("code"),
                        stdin=payload.get("stdin", "")
                    )
                    
                    result = await CodeExecutionService.run_code(req)
                    
                    await manager.broadcast({
                        "type": "RUN_RESULT",
                        "payload": result.model_dump()
                    }, room_id)
            
    except WebSocketDisconnect:
        await manager.disconnect(room_id, client_id)