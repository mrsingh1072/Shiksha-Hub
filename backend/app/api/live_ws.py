from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from typing import Dict, List, Any

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Dictionary structure: { class_id: { "teacher": WebSocket, "students": { student_id: WebSocket } } }
        self.active_connections: Dict[str, Dict[str, Any]] = {}

    def _ensure_class_exists(self, class_id: str):
        if class_id not in self.active_connections:
            self.active_connections[class_id] = {
                "teacher": None,
                "students": {}
            }

    async def connect(self, websocket: WebSocket, class_id: str, role: str, user_id: str):
        await websocket.accept()
        self._ensure_class_exists(class_id)
        
        if role == "teacher":
            self.active_connections[class_id]["teacher"] = websocket
            # Notify teacher of any existing students
            for student_id in self.active_connections[class_id]["students"].keys():
                await websocket.send_text(json.dumps({
                    "type": "join_student",
                    "student_id": student_id
                }))
        elif role == "student":
            self.active_connections[class_id]["students"][user_id] = websocket
            # Notify teacher that a new student joined
            teacher_ws = self.active_connections[class_id]["teacher"]
            if teacher_ws:
                await teacher_ws.send_text(json.dumps({
                    "type": "join_student",
                    "student_id": user_id
                }))

    def disconnect(self, class_id: str, role: str, user_id: str):
        if class_id in self.active_connections:
            if role == "teacher":
                self.active_connections[class_id]["teacher"] = None
            elif role == "student":
                if user_id in self.active_connections[class_id]["students"]:
                    del self.active_connections[class_id]["students"][user_id]

manager = ConnectionManager()

@router.websocket("/ws/{class_id}/{role}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, class_id: str, role: str, user_id: str):
    await manager.connect(websocket, class_id, role, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Message structure expects: { type: "offer", target_id: "...", sdp: "..." }
            msg_type = message.get("type")
            target_id = message.get("target_id")
            
            if not target_id:
                continue
                
            # If sender is teacher, route to specific student
            if role == "teacher":
                student_ws = manager.active_connections.get(class_id, {}).get("students", {}).get(target_id)
                if student_ws:
                    # Append sender_id so the student knows it's from the teacher
                    message["sender_id"] = user_id
                    await student_ws.send_text(json.dumps(message))
                    
            # If sender is student, route to teacher
            elif role == "student":
                teacher_ws = manager.active_connections.get(class_id, {}).get("teacher")
                if teacher_ws:
                    # Append sender_id so the teacher knows which student sent the answer/candidate
                    message["sender_id"] = user_id
                    await teacher_ws.send_text(json.dumps(message))
                    
    except WebSocketDisconnect:
        manager.disconnect(class_id, role, user_id)
        if role == "student":
            teacher_ws = manager.active_connections.get(class_id, {}).get("teacher")
            if teacher_ws:
                try:
                    await teacher_ws.send_text(json.dumps({
                        "type": "leave_student",
                        "student_id": user_id
                    }))
                except Exception:
                    pass
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(class_id, role, user_id)
