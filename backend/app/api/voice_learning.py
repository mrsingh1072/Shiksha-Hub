from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.dependencies.auth import get_current_user
from app.services.ai_orchestrator import (
    handle_teaching_request,
    handle_quiz_request,
    handle_evaluation_request,
    handle_roadmap_request,
)
from app.services.conversation_service import (
    get_conversation,
    create_conversation,
    append_message,
)

router = APIRouter()


class TeachRequest(BaseModel):
    topic: str
    conversation_id: str | None = None


class AskRequest(BaseModel):
    question: str
    conversation_id: str | None = None


class QuizRequest(BaseModel):
    topic: str
    lesson_content: str = ""
    num_questions: int = 5


class EvaluateRequest(BaseModel):
    question: dict
    answer: str


class RoadmapRequest(BaseModel):
    goal: str
    duration_weeks: int = 8


@router.post("/teach")
async def teach(data: TeachRequest, current_user=Depends(get_current_user)):
    email = current_user["email"]
    conversation_id = data.conversation_id

    if conversation_id:
        conversation = await get_conversation(email, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = await create_conversation(email, data.topic[:80], "voice")
        conversation_id = conversation["_id"]

    history = conversation.get("messages", []) if conversation_id != conversation.get("_id") else []

    # Save user message
    await append_message(email, conversation_id, "user", data.topic)

    # Generate lesson
    result = await handle_teaching_request(
        question=f'Teach me about "{data.topic}" as a structured lesson.',
        email=email,
        conversation_id=conversation_id,
        history=history,
    )

    # Save assistant response
    documentation = result.get("documentation", "")
    reply = result.get("reply", "")
    if reply and not reply.startswith("AI Error:"):
        await append_message(email, conversation_id, "assistant", reply, documentation)

    updated = await get_conversation(email, conversation_id)

    return {
        "conversation_id": conversation_id,
        "lesson": result.get("lesson"),
        "documentation": documentation,
        "answer": reply,
        "voiceText": result.get("voiceText", reply),
        "conversation": updated,
    }


@router.post("/ask")
async def ask(data: AskRequest, current_user=Depends(get_current_user)):
    email = current_user["email"]
    conversation_id = data.conversation_id
    history = []

    if conversation_id:
        conversation = await get_conversation(email, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        history = conversation.get("messages", [])
    else:
        conversation = await create_conversation(email, data.question[:80], "voice")
        conversation_id = conversation["_id"]

    await append_message(email, conversation_id, "user", data.question)

    result = await handle_teaching_request(
        question=data.question,
        email=email,
        conversation_id=conversation_id,
        history=history,
    )

    documentation = result.get("documentation", "")
    reply = result.get("reply", "")
    if reply and not reply.startswith("AI Error:"):
        await append_message(email, conversation_id, "assistant", reply, documentation)

    updated = await get_conversation(email, conversation_id)

    return {
        "conversation_id": conversation_id,
        "lesson": result.get("lesson"),
        "documentation": documentation,
        "answer": reply,
        "voiceText": result.get("voiceText", reply),
        "conversation": updated,
    }


@router.post("/quiz")
async def quiz(data: QuizRequest, current_user=Depends(get_current_user)):
    result = await handle_quiz_request(
        topic=data.topic,
        lesson_content=data.lesson_content,
        email=current_user["email"],
        num_questions=data.num_questions,
    )
    return result


@router.post("/evaluate")
async def evaluate(data: EvaluateRequest, current_user=Depends(get_current_user)):
    result = await handle_evaluation_request(
        question=data.question,
        student_answer=data.answer,
        email=current_user["email"],
    )
    return result


@router.post("/roadmap")
async def roadmap(data: RoadmapRequest, current_user=Depends(get_current_user)):
    result = await handle_roadmap_request(
        goal=data.goal,
        duration_weeks=data.duration_weeks,
        email=current_user["email"],
    )
    return result
