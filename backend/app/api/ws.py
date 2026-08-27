import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from app.services.executor import CodeExecutionService
from app.schemas.execution import ExecuteCodeRequest

router = APIRouter(tags=["WebSocket"])

# Security Constants
RATE_LIMIT_SECONDS = 5
MAX_PAYLOAD_BYTES = 50000 # ~50KB limit

@router.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    await manager.connect(websocket, room_id, client_id)
    
    try:
        room = manager.rooms[room_id]
        if room.get("code") is not None and room.get("language") is not None:
            await websocket.send_json({
                "type": "SYNC_STATE",
                "payload": {
                    "code": room["code"],
                    "language": room["language"]
                }
            })

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
                    # Enforce payload limit on typing as well
                    code = data.get("payload", {}).get("code", "")
                    if len(code.encode('utf-8')) > MAX_PAYLOAD_BYTES:
                        continue # Silently drop oversized typing payloads
                    manager.rooms[room_id]["code"] = code
                    await manager.broadcast(data, room_id, exclude=client_id)
                    
            elif msg_type == "LANGUAGE_UPDATE":
                if manager.rooms[room_id]["controller"] == client_id:
                    manager.rooms[room_id]["language"] = data["payload"]["language"]
                    await manager.broadcast(data, room_id, exclude=client_id)
                    
            elif msg_type == "RUN_CODE":
                if manager.rooms[room_id]["controller"] == client_id:
                    # --- SECURITY CHECKS ---
                    current_time = time.time()
                    last_run = room.get("last_run_time", 0)
                    
                    # Check 1: Rate Limiting
                    if current_time - last_run < RATE_LIMIT_SECONDS:
                        await websocket.send_json({
                            "type": "ERROR",
                            "payload": f"Rate limit active. Please wait {RATE_LIMIT_SECONDS - int(current_time - last_run)} seconds."
                        })
                        continue
                        
                    payload = data.get("payload", {})
                    code = payload.get("code", "")
                    
                    # Check 2: Payload Size
                    if len(code.encode('utf-8')) > MAX_PAYLOAD_BYTES:
                        await websocket.send_json({
                            "type": "ERROR",
                            "payload": "Security Error: Code exceeds the 50KB size limit."
                        })
                        continue
                        
                    # Passed checks, proceed with execution
                    manager.rooms[room_id]["last_run_time"] = current_time
                    await manager.broadcast({"type": "RUN_STARTED"}, room_id)
                    
                    req = ExecuteCodeRequest(
                        language=payload.get("language"),
                        code=code,
                        stdin=payload.get("stdin", "")
                    )
                    
                    result = await CodeExecutionService.run_code(req)
                    
                    await manager.broadcast({
                        "type": "RUN_RESULT",
                        "payload": result.model_dump()
                    }, room_id)
            
    except WebSocketDisconnect:
        await manager.disconnect(room_id, client_id)