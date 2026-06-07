from fastapi import APIRouter

from pydantic import BaseModel

from app.services.openrouter_service import (
    generate_response
)

from app.services.avatar_service import (
    generate_voice
)

router = APIRouter()


class AvatarRequest(
    BaseModel
):
    question: str


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