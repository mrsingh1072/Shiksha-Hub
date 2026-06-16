from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from uuid import uuid4

from app.services.openrouter_service import (
    generate_response
)

from app.services.avatar_service import (
    generate_voice
)

from app.dependencies.auth import get_current_user

router = APIRouter()


class AvatarRequest(
    BaseModel
):
    question: str


class VoiceRequest(BaseModel):
    text: str


@router.post("/")
async def avatar_teacher(
    data: AvatarRequest
):

    answer = generate_response(
        data.question
    )

    await generate_voice(
        answer,
        "avatar_response.mp3"
    )

    return {
        "question": data.question,
        "answer": answer,
        "audio": "avatar_response.mp3"
    }


@router.post("/voice")
async def avatar_voice(
    data: VoiceRequest,
    current_user=Depends(get_current_user),
):
    text = (data.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    uploads_dir = Path("uploads") / "avatar"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    filename = f"tutor_{uuid4().hex}.mp3"
    output_path = uploads_dir / filename

    await generate_voice(text, str(output_path))

    return {"file": filename}


@router.get("/audio/{filename}")
async def get_avatar_audio(
    filename: str,
    current_user=Depends(get_current_user),
):
    audio_path = Path("uploads") / "avatar" / filename
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=filename,
    )