from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from uuid import uuid4
import logging

from app.services.speech_service import generate_speech, cleanup_old_audio
from app.dependencies.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

UPLOADS_DIR = Path("uploads") / "avatar"


class VoiceRequest(BaseModel):
    text: str
    voice: str = "en-US-AriaNeural"


@router.post("/voice")
async def create_voice(
    data: VoiceRequest,
    current_user=Depends(get_current_user),
):
    text = (data.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    if len(text) > 5000:
        raise HTTPException(status_code=400, detail="Text exceeds maximum length of 5000 characters")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    cleanup_old_audio(str(UPLOADS_DIR))

    filename = f"voice_{uuid4().hex}.mp3"
    output_path = UPLOADS_DIR / filename

    try:
        await generate_speech(text, str(output_path), voice=data.voice)
    except Exception as e:
        logger.error("Voice generation failed: %s", e)
        raise HTTPException(status_code=500, detail="Voice generation failed")

    return {"file": filename}


@router.get("/audio/{filename}")
async def get_audio(
    filename: str,
    current_user=Depends(get_current_user),
):
    audio_path = UPLOADS_DIR / filename
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(
        path=str(audio_path),
        media_type="audio/mpeg",
        filename=filename,
    )