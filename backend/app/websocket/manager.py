from typing import Dict, Any
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps room_id -> room_state
        self.rooms: Dict[str, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, client_id: str):
        await websocket.accept()
        
        if room_id not in self.rooms:
            # First user to join becomes the owner/leader
            self.rooms[room_id] = {
                "connections": {},
                "owner": client_id,
                "controller": client_id,
                "status": "WAITING"
            }
            
        self.rooms[room_id]["connections"][client_id] = websocket
        
        # Check if room is active (at least 2 users)
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
                # If someone left and only 1 remains, revert to WAITING
                if len(room["connections"]) < 2:
                    room["status"] = "WAITING"
                    # Give control back to whoever is left
                    remaining_user = list(room["connections"].keys())[0]
                    room["controller"] = remaining_user
                    # If owner left, assign new owner
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
        """Handle control transfer logic based on your exact requirements."""
        if room_id in self.rooms:
            room = self.rooms[room_id]
            
            # Cannot type if waiting for second player
            if room["status"] != "ACTIVE":
                return
                
            # If member requests control, they get it. 
            # If Leader requests control (starts typing), they immediately steal it.
            room["controller"] = client_id
            await self.broadcast_room_state(room_id)

    async def broadcast(self, message: dict, room_id: str, exclude: str = None):
        """Broadcasts to the room, optionally excluding a specific client_id."""
        if room_id in self.rooms:
            connections = self.rooms[room_id]["connections"]
            for cid, connection in connections.items():
                if cid != exclude:
                    await connection.send_json(message)

manager = ConnectionManager()