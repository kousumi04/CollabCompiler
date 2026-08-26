from typing import Dict, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps room_id -> room_state
        self.rooms: Dict[str, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, client_id: str):
        await websocket.accept()
        
        if room_id not in self.rooms:
            self.rooms[room_id] = {
                "connections": {},
                "owner": client_id,
                "controller": client_id,
                "status": "WAITING",
                "code": None,      # Cache for reconnection
                "language": None   # Cache for reconnection
            }
            
        self.rooms[room_id]["connections"][client_id] = websocket
        
        if len(self.rooms[room_id]["connections"]) >= 2:
            self.rooms[room_id]["status"] = "ACTIVE"

        await self.broadcast_room_state(room_id)

    async def disconnect(self, room_id: str, client_id: str):
        if room_id in self.rooms:
            room = self.rooms[room_id]
            if client_id in room["connections"]:
                del room["connections"][client_id]
                
            if not room["connections"]:
                del self.rooms[room_id]
            else:
                if len(room["connections"]) < 2:
                    room["status"] = "WAITING"
                    remaining_user = list(room["connections"].keys())[0]
                    room["controller"] = remaining_user
                    if client_id == room["owner"]:
                        room["owner"] = remaining_user
                        
                await self.broadcast_room_state(room_id)

    async def broadcast_room_state(self, room_id: str):
        if room_id in self.rooms:
            room = self.rooms[room_id]
            state_message = {
                "type": "ROOM_STATE",
                "payload": {
                    "owner": room["owner"],
                    "controller": room["controller"],
                    "status": room["status"],
                    "users": list(room["connections"].keys())
                }
            }
            await self.broadcast(state_message, room_id)

    async def request_control(self, room_id: str, client_id: str):
        if room_id in self.rooms:
            room = self.rooms[room_id]
            if room["status"] != "ACTIVE":
                return
                
            room["controller"] = client_id
            await self.broadcast_room_state(room_id)

    async def broadcast(self, message: dict, room_id: str, exclude: str = None):
        if room_id in self.rooms:
            connections = self.rooms[room_id]["connections"]
            for cid, connection in connections.items():
                if cid != exclude:
                    await connection.send_json(message)

manager = ConnectionManager()