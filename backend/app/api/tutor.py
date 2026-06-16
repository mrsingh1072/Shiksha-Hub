from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.services.tutor_service import tutor_response
from app.services.conversation_service import (
    list_conversations,
    get_conversation,
    create_conversation,
    append_message,
    rename_conversation,
    delete_conversation,
)
from app.dependencies.auth import get_current_user

router = APIRouter()


class TutorRequest(BaseModel):
    question: str
    conversation_id: str | None = None
    conversation_type: str = "tutor"


class RenameConversationRequest(BaseModel):
    title: str


class CreateConversationRequest(BaseModel):
    title: str = "New conversation"
    conversation_type: str = "tutor"


@router.get("/conversations")
async def get_conversations(
    current_user=Depends(get_current_user),
    type: str | None = Query(default=None, alias="type"),
):
    return await list_conversations(current_user["email"], type)


@router.post("/conversations")
async def create_new_conversation(
    data: CreateConversationRequest | None = None,
    current_user=Depends(get_current_user),
):
    payload = data or CreateConversationRequest()
    return await create_conversation(
        current_user["email"],
        payload.title,
        payload.conversation_type,
    )


@router.get("/conversations/{conversation_id}")
async def get_conversation_by_id(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    conversation = await get_conversation(current_user["email"], conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.patch("/conversations/{conversation_id}")
async def rename_conversation_by_id(
    conversation_id: str,
    data: RenameConversationRequest,
    current_user=Depends(get_current_user),
):
    updated = await rename_conversation(
        current_user["email"],
        conversation_id,
        data.title.strip(),
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation renamed"}


@router.delete("/conversations/{conversation_id}")
async def delete_conversation_by_id(
    conversation_id: str,
    current_user=Depends(get_current_user),
):
    deleted = await delete_conversation(current_user["email"], conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"message": "Conversation deleted"}


@router.post("/")
async def ai_tutor(
    data: TutorRequest,
    current_user=Depends(get_current_user),
):
    email = current_user["email"]
    conversation_id = data.conversation_id

    if conversation_id:
        conversation = await get_conversation(email, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = await create_conversation(
            email,
            conversation_type=data.conversation_type,
        )
        conversation_id = conversation["_id"]

    history = conversation.get("messages", [])

    await append_message(
        user_email=email,
        conversation_id=conversation_id,
        role="user",
        content=data.question,
    )

    result = tutor_response(data.question, history)

    documentation = result.get("documentation", "")
    reply = result.get("reply", "")

    if reply and not str(reply).startswith("AI Error:"):
        await append_message(
            user_email=email,
            conversation_id=conversation_id,
            role="assistant",
            content=reply,
            documentation=documentation,
        )

    updated = await get_conversation(email, conversation_id)

    return {
        "conversation_id": conversation_id,
        "documentation": documentation,
        "answer": reply,
        "conversation": updated,
    }
