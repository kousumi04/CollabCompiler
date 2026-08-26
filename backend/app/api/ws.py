from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from app.services.executor import CodeExecutionService
from app.schemas.execution import ExecuteCodeRequest

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
                if manager.rooms[room_id]["controller"] == client_id:
                    await manager.broadcast(data, room_id, exclude=client_id)
                    
            elif msg_type == "RUN_CODE":
                # 1. Verify only the controller can run code
                if manager.rooms[room_id]["controller"] == client_id:
                    # 2. Tell everyone in the room that execution started
                    await manager.broadcast({"type": "RUN_STARTED"}, room_id)
                    
                    # 3. Execute the code using our existing JDoodle service
                    payload = data.get("payload", {})
                    req = ExecuteCodeRequest(
                        language=payload.get("language"),
                        code=payload.get("code"),
                        stdin=payload.get("stdin", "")
                    )
                    
                    result = await CodeExecutionService.run_code(req)
                    
                    # 4. Broadcast the result to everyone
                    await manager.broadcast({
                        "type": "RUN_RESULT",
                        "payload": result.model_dump()
                    }, room_id)
            
    except WebSocketDisconnect:
        await manager.disconnect(room_id, client_id)