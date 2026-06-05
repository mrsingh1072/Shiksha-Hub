from fastapi import APIRouter
from pydantic import BaseModel
from app.services.notes_service import generate_notes

router = APIRouter()

class NotesRequest(BaseModel):
    topic: str

@router.post("/")
async def notes(data: NotesRequest):

    notes = generate_notes(
        data.topic
    )

    return {
        "notes": notes
    }