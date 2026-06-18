from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from app.services.ai_client import ask_ai
from bson import ObjectId
from datetime import datetime

router = APIRouter()

SYSTEM_PROMPTS = {
    "lesson_plan": "You are an expert educator and curriculum designer. Generate a detailed, well-structured lesson plan. Include: learning objectives, materials needed, introduction, main activities, assessment methods, and homework. Format with clear headings and bullet points.",
    "assignment": "You are an expert educator. Create a comprehensive, well-structured assignment. Include: clear instructions, learning objectives, rubric/grading criteria, submission guidelines, and expected outcomes. Format professionally.",
    "quiz": "You are an expert educator. Generate a quiz with clear questions and answers. Include a mix of question types (multiple choice, short answer, true/false). Provide correct answers and explanations. Format clearly.",
    "notes": "You are an expert educator. Create detailed, well-organized teaching notes. Include: key concepts, definitions, examples, diagrams descriptions, discussion points, and summary. Format with clear headings.",
    "resources": "You are an expert educator. Suggest comprehensive teaching resources and materials. Include: textbooks, online resources, videos, activities, worksheets, and tools. Organize by category with descriptions.",
}


@router.post("/chat")
async def teacher_ai_chat(data: dict, current_user=Depends(require_role("teacher"))):
    message = data.get("message", "")
    chat_type = data.get("type", "general")

    if not message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    system_prompt = SYSTEM_PROMPTS.get(chat_type, "You are an AI teaching assistant. Help the teacher with their request professionally and thoroughly.")
    full_prompt = f"{system_prompt}\n\nTeacher's request: {message}"

    ai_response = ask_ai(full_prompt)

    # Save to teacher chat history
    history_doc = {
        "teacher_email": current_user["email"],
        "type": chat_type,
        "question": message,
        "answer": ai_response,
        "created_at": datetime.utcnow()
    }
    await db.teacher_chat_history.insert_one(history_doc)

    return {"response": ai_response, "type": chat_type}


@router.get("/history")
async def get_ai_history(current_user=Depends(require_role("teacher"))):
    history = []
    cursor = db.teacher_chat_history.find(
        {"teacher_email": current_user["email"]}
    ).sort("created_at", -1).limit(100)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)
    return history


@router.delete("/history/{history_id}")
async def delete_ai_history(history_id: str, current_user=Depends(require_role("teacher"))):
    result = await db.teacher_chat_history.delete_one(
        {"_id": ObjectId(history_id), "teacher_email": current_user["email"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="History item not found")
    return {"message": "History item deleted successfully"}
