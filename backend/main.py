from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import json
import asyncio
import time

app = FastAPI(
    title="SynkCanvas Enterprise Engine",
    description="Distributed Real-Time CRDT Collaboration & Security Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class CanvasObjectSchema(BaseModel):
    id: str
    type: str
    x: float
    y: float
    width: float
    height: float
    rotation: Optional[float] = 0
    strokeColor: Optional[str] = "#e2e8f0"
    fillColor: Optional[str] = "#ffffff"
    strokeWidth: Optional[float] = 1.5
    opacity: Optional[float] = 1.0
    strokeStyle: Optional[str] = "solid"
    text: Optional[str] = None
    categoryTag: Optional[str] = None
    subtitle: Optional[str] = None
    semanticRole: Optional[str] = "generic"
    fromObjectId: Optional[str] = None
    toObjectId: Optional[str] = None
    version: Optional[int] = 1
    ownerId: Optional[str] = None

class MergeRequestSchema(BaseModel):
    baseState: Dict[str, CanvasObjectSchema]
    branchAState: Dict[str, CanvasObjectSchema]
    branchBState: Dict[str, CanvasObjectSchema]

class SecurityAuditRequestSchema(BaseModel):
    objects: List[CanvasObjectSchema]

# In-Memory Real-Time State Hub (Backed by Redis in Production)
class ConnectionManager:
    def __init__(self):
        self.active_rooms: Dict[str, Dict[str, WebSocket]] = {}
        self.presence: Dict[str, Dict[str, Any]] = {}
        self.room_states: Dict[str, Dict[str, Any]] = {}

    async def connect(self, room_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = {}
            self.presence[room_id] = {}
            self.room_states[room_id] = {}
        
        self.active_rooms[room_id][user_id] = websocket
        self.presence[room_id][user_id] = {
            "userId": user_id,
            "connectedAt": time.time(),
            "cursor": {"x": 0, "y": 0},
            "status": "online"
        }

        # Broadcast user joined event to room
        await self.broadcast_room(room_id, user_id, {
            "type": "USER_JOINED",
            "userId": user_id,
            "presence": list(self.presence[room_id].values())
        })

    def disconnect(self, room_id: str, user_id: str):
        if room_id in self.active_rooms:
            if user_id in self.active_rooms[room_id]:
                del self.active_rooms[room_id][user_id]
            if user_id in self.presence[room_id]:
                del self.presence[room_id][user_id]
            if not self.active_rooms[room_id]:
                del self.active_rooms[room_id]
                del self.presence[room_id]

    async def broadcast_room(self, room_id: str, sender_id: str, message: dict):
        if room_id in self.active_rooms:
            for uid, connection in list(self.active_rooms[room_id].items()):
                if uid != sender_id:
                    try:
                        await connection.send_text(json.dumps(message))
                    except Exception:
                        pass

manager = ConnectionManager()

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "SynkCanvas Enterprise Engine",
        "timestamp": time.time(),
        "active_rooms": len(manager.active_rooms)
    }

@app.get("/api/canvases")
def list_canvases():
    return [
        {
            "id": "room_demo",
            "name": "Product architecture",
            "activeBranch": "main",
            "onlineUsers": len(manager.presence.get("room_demo", {})),
            "updatedAt": time.time()
        }
    ]

@app.post("/api/audit")
def audit_canvas_security(req: SecurityAuditRequestSchema):
    issues = []
    dbs = [o for o in req.objects if o.semanticRole == "database" or (o.text and "db" in o.text.lower())]
    clients = [o for o in req.objects if o.semanticRole == "ui_component" or (o.text and "client" in o.text.lower())]
    gateways = [o for o in req.objects if o.semanticRole == "gateway" or (o.text and "gateway" in o.text.lower())]

    for db in dbs:
        direct_links = [
            o for o in req.objects
            if o.type == "connector" and (
                (o.fromObjectId == db.id and any(c.id == o.toObjectId for c in clients)) or
                (o.toObjectId == db.id and any(c.id == o.fromObjectId for c in clients))
            )
        ]
        if direct_links:
            issues.append({
                "id": f"sec_{db.id}_direct",
                "objectId": db.id,
                "severity": "critical",
                "title": "Direct Client to Database Vulnerability",
                "description": f"Database '{db.text or db.id}' is directly exposed to public client interfaces without an API Gateway.",
                "fixSuggestion": "Interpose an API Gateway / Authentication Service layer."
            })

    if dbs and not gateways:
        issues.append({
            "id": "sec_no_gateway",
            "objectId": dbs[0].id,
            "severity": "high",
            "title": "Missing Central API Gateway",
            "description": "System endpoints are exposed without a central WAF/API Gateway protection layer.",
            "fixSuggestion": "Add an API Gateway component at the top of the stack."
        })

    return {"issues": issues, "scanCount": len(req.objects)}

@app.websocket("/ws/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.connect(room_id, user_id, websocket)
    try:
        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            msg_type = data.get("type")

            if msg_type == "CURSOR_MOVE":
                if room_id in manager.presence and user_id in manager.presence[room_id]:
                    manager.presence[room_id][user_id]["cursor"] = data.get("cursor", {"x": 0, "y": 0})

            # Broadcast operation to all other clients in the room
            await manager.broadcast_room(room_id, user_id, data)
    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
        await manager.broadcast_room(room_id, user_id, {
            "type": "USER_DISCONNECT",
            "userId": user_id
        })
