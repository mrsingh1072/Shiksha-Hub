from fastapi import APIRouter
from pydantic import BaseModel
from app.services.openrouter_service import generate_response

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def ai_chat(chat: ChatRequest):

    answer = generate_response(
        chat.message
    )

    return {
        "answer": answer
    }