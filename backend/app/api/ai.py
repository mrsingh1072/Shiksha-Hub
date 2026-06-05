from fastapi import APIRouter
from pydantic import BaseModel

from app.services.openrouter_service import generate_response
from app.services.history_service import save_history

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def ai_chat(chat: ChatRequest):

    answer = generate_response(
        chat.message
    )

    await save_history(
        user_email="anonymous",
        history_type="chat",
        question=chat.message,
        answer=answer
    )

    return {
        "answer": answer
    }