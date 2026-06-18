from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/")
async def add_question(data: dict, current_user=Depends(require_role("teacher"))):
    question_doc = {
        "teacher_email": current_user["email"],
        "subject": data.get("subject", ""),
        "topic": data.get("topic", ""),
        "difficulty": data.get("difficulty", "medium"),
        "question_text": data.get("question_text", ""),
        "question_type": data.get("question_type", "mcq"),
        "options": data.get("options", []),
        "correct_answer": data.get("correct_answer", ""),
        "explanation": data.get("explanation", ""),
        "created_at": datetime.utcnow()
    }
    result = await db.question_bank.insert_one(question_doc)
    return {"message": "Question added successfully", "question_id": str(result.inserted_id)}


@router.get("/")
async def get_questions(
    subject: str = Query(""),
    topic: str = Query(""),
    difficulty: str = Query(""),
    current_user=Depends(require_role("teacher"))
):
    query = {"teacher_email": current_user["email"]}
    if subject:
        query["subject"] = {"$regex": subject, "$options": "i"}
    if topic:
        query["topic"] = {"$regex": topic, "$options": "i"}
    if difficulty:
        query["difficulty"] = difficulty

    questions = []
    cursor = db.question_bank.find(query).sort("created_at", -1)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        questions.append(item)
    return questions


@router.get("/search")
async def search_questions(q: str = Query(""), current_user=Depends(require_role("teacher"))):
    query = {
        "teacher_email": current_user["email"],
        "question_text": {"$regex": q, "$options": "i"}
    }
    questions = []
    cursor = db.question_bank.find(query).sort("created_at", -1).limit(50)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        questions.append(item)
    return questions


@router.put("/{question_id}")
async def update_question(question_id: str, data: dict, current_user=Depends(require_role("teacher"))):
    update_data = {}
    for key in ["subject", "topic", "difficulty", "question_text", "question_type", "options", "correct_answer", "explanation"]:
        if key in data:
            update_data[key] = data[key]
    update_data["updated_at"] = datetime.utcnow()
    result = await db.question_bank.update_one(
        {"_id": ObjectId(question_id), "teacher_email": current_user["email"]},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question updated successfully"}


@router.delete("/{question_id}")
async def delete_question(question_id: str, current_user=Depends(require_role("teacher"))):
    result = await db.question_bank.delete_one({"_id": ObjectId(question_id), "teacher_email": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question deleted successfully"}
