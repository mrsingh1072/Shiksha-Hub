from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from app.services.ai_client import ask_ai
from bson import ObjectId
from datetime import datetime
import json

router = APIRouter()


@router.post("/")
async def create_exam(data: dict, current_user=Depends(require_role("teacher"))):
    exam_doc = {
        "teacher_email": current_user["email"],
        "title": data.get("title", ""),
        "subject": data.get("subject", ""),
        "class_id": data.get("class_id", ""),
        "questions": data.get("questions", []),
        "duration": data.get("duration", 30),
        "total_marks": data.get("total_marks", 0),
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.exams.insert_one(exam_doc)
    return {"message": "Exam created successfully", "exam_id": str(result.inserted_id)}


@router.post("/generate")
async def generate_exam(data: dict, current_user=Depends(require_role("teacher"))):
    subject = data.get("subject", "General")
    topic = data.get("topic", "")
    difficulty = data.get("difficulty", "medium")
    num_questions = data.get("num_questions", 10)

    prompt = f"""Generate exactly {num_questions} multiple choice questions for an exam.
Subject: {subject}
Topic: {topic}
Difficulty: {difficulty}

Return ONLY a valid JSON array. Each question object must have:
- "question": the question text
- "options": array of 4 options (strings)
- "correct_answer": the correct option (exact string from options)
- "explanation": brief explanation

Example format:
[{{"question": "What is 2+2?", "options": ["3", "4", "5", "6"], "correct_answer": "4", "explanation": "Basic addition"}}]

Return ONLY the JSON array, no other text."""

    ai_response = ask_ai(prompt)

    # Try to parse questions from AI response
    questions = []
    try:
        # Try direct JSON parse
        questions = json.loads(ai_response)
    except json.JSONDecodeError:
        # Try to extract JSON array from response
        try:
            start = ai_response.find('[')
            end = ai_response.rfind(']') + 1
            if start >= 0 and end > start:
                questions = json.loads(ai_response[start:end])
        except (json.JSONDecodeError, ValueError):
            questions = []

    if not questions:
        return {
            "message": "AI generated response but couldn't parse questions. Raw response included.",
            "questions": [],
            "raw_response": ai_response
        }

    exam_doc = {
        "teacher_email": current_user["email"],
        "title": f"{subject} - {topic or 'General'} Exam",
        "subject": subject,
        "topic": topic,
        "difficulty": difficulty,
        "questions": questions,
        "duration": num_questions * 2,
        "total_marks": num_questions,
        "status": "draft",
        "ai_generated": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.exams.insert_one(exam_doc)

    return {
        "message": "Exam generated successfully",
        "exam_id": str(result.inserted_id),
        "questions": questions,
        "total_questions": len(questions)
    }


@router.get("/")
async def get_exams(current_user=Depends(require_role("teacher"))):
    exams = []
    cursor = db.exams.find({"teacher_email": current_user["email"]}).sort("created_at", -1)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        item["question_count"] = len(item.get("questions", []))
        exams.append(item)
    return exams


@router.get("/{exam_id}")
async def get_exam(exam_id: str, current_user=Depends(require_role("teacher"))):
    exam = await db.exams.find_one({"_id": ObjectId(exam_id), "teacher_email": current_user["email"]})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    exam["_id"] = str(exam["_id"])
    return exam


@router.put("/{exam_id}")
async def update_exam(exam_id: str, data: dict, current_user=Depends(require_role("teacher"))):
    update_data = {}
    for key in ["title", "subject", "questions", "duration", "total_marks", "status"]:
        if key in data:
            update_data[key] = data[key]
    update_data["updated_at"] = datetime.utcnow()
    result = await db.exams.update_one(
        {"_id": ObjectId(exam_id), "teacher_email": current_user["email"]},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam updated successfully"}


@router.delete("/{exam_id}")
async def delete_exam(exam_id: str, current_user=Depends(require_role("teacher"))):
    result = await db.exams.delete_one({"_id": ObjectId(exam_id), "teacher_email": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam deleted successfully"}


@router.get("/{exam_id}/results")
async def get_exam_results(exam_id: str, current_user=Depends(require_role("teacher"))):
    exam = await db.exams.find_one({"_id": ObjectId(exam_id), "teacher_email": current_user["email"]})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    results = []
    cursor = db.exam_results.find({"exam_id": exam_id}).sort("submitted_at", -1)
    async for r in cursor:
        r["_id"] = str(r["_id"])
        results.append(r)

    return {"exam": {"title": exam.get("title", ""), "subject": exam.get("subject", "")}, "results": results}
