from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def public_questions(exam):
    questions = []
    for index, question in enumerate(exam.get("questions", [])):
        questions.append({
            "question_id": index,
            "question_text": question.get("question_text", ""),
            "type": question.get("type", "mcq"),
            "options": question.get("options", []),
            "marks": question.get("marks", 1),
        })
    return questions


@router.get("/classes/{class_id}/exams")
async def get_student_class_exams(
    class_id: str,
    current_user=Depends(require_role("student"))
):
    student_email = current_user["email"]

    cls = await db.classes.find_one({"_id": ObjectId(class_id)})
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if student_email not in cls.get("students", []):
        raise HTTPException(status_code=403, detail="Not enrolled in this class")

    exams = []
    cursor = db.class_exams.find({
        "class_id": class_id,
        "status": "published"
    }).sort("created_at", -1)

    async for item in cursor:
        exam_id = str(item["_id"])
        attempt = await db.exam_attempts.find_one({
            "exam_id": exam_id,
            "student_email": student_email
        })

        submitted_at = attempt.get("submitted_at") if attempt else None
        if submitted_at and hasattr(submitted_at, "isoformat"):
            submitted_at = submitted_at.isoformat()

        created_at = item.get("created_at", "")
        if created_at and hasattr(created_at, "isoformat"):
            created_at = created_at.isoformat()

        exams.append({
            "_id": exam_id,
            "title": item.get("title", ""),
            "description": item.get("description", ""),
            "subject": item.get("subject", ""),
            "difficulty": item.get("difficulty", ""),
            "duration_minutes": item.get("duration_minutes", 30),
            "total_marks": item.get("total_marks", 0),
            "question_count": len(item.get("questions", [])),
            "question_type": item.get("question_type", "mixed"),
            "exam_type": item.get("exam_type", "manual"),
            "status": item.get("status", "draft"),
            "created_at": created_at,
            "attempt_status": attempt.get("status") if attempt else None,
            "attempt_id": str(attempt["_id"]) if attempt else None,
            "submitted_at": submitted_at,
            "result_visible": bool(item.get("results_published")) and bool(attempt),
        })

    print("EXAMS FETCHED:", len(exams))
    return exams


@router.post("/exams/{exam_id}/start")
async def start_exam(
    exam_id: str,
    current_user=Depends(require_role("student"))
):
    student_email = current_user["email"]

    exam = await db.class_exams.find_one({"_id": ObjectId(exam_id)})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.get("status") not in ["active", "published"]:
        raise HTTPException(status_code=400, detail="This exam is not active")

    cls = await db.classes.find_one({"_id": ObjectId(exam.get("class_id", ""))})
    if not cls or student_email not in cls.get("students", []):
        raise HTTPException(status_code=403, detail="Not enrolled in this class")

    existing = await db.exam_attempts.find_one({
        "exam_id": exam_id,
        "student_email": student_email
    })

    if existing:
        if existing.get("status") == "in_progress":
            existing["_id"] = str(existing["_id"])
            if existing.get("started_at") and hasattr(existing["started_at"], "isoformat"):
                existing["started_at"] = existing["started_at"].isoformat()

            return {
                "message": "Resuming existing attempt",
                "attempt": existing,
                "questions": public_questions(exam),
                "duration_minutes": exam.get("duration_minutes", 30),
                "total_marks": exam.get("total_marks", 0),
                "title": exam.get("title", "")
            }

        raise HTTPException(status_code=400, detail="You have already submitted this exam")

    attempt_doc = {
        "exam_id": exam_id,
        "class_id": exam.get("class_id", ""),
        "student_email": student_email,
        "answers": [],
        "started_at": datetime.utcnow(),
        "submitted_at": None,
        "status": "in_progress"
    }

    result = await db.exam_attempts.insert_one(attempt_doc)
    attempt_doc["_id"] = str(result.inserted_id)
    attempt_doc["started_at"] = attempt_doc["started_at"].isoformat()

    return {
        "message": "Exam started",
        "attempt": attempt_doc,
        "questions": public_questions(exam),
        "duration_minutes": exam.get("duration_minutes", 30),
        "total_marks": exam.get("total_marks", 0),
        "title": exam.get("title", "")
    }


@router.post("/exams/{exam_id}/save-answer")
async def save_answer(
    exam_id: str,
    data: dict,
    current_user=Depends(require_role("student"))
):
    student_email = current_user["email"]

    attempt = await db.exam_attempts.find_one({
        "exam_id": exam_id,
        "student_email": student_email,
        "status": "in_progress"
    })

    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")

    question_id = data.get("question_id")
    answer = data.get("answer", "")
    selected_option = data.get("selected_option", "")

    answers = attempt.get("answers", [])
    found = False
    for saved_answer in answers:
        if saved_answer.get("question_id") == question_id:
            saved_answer["answer"] = answer
            saved_answer["selected_option"] = selected_option
            found = True
            break

    if not found:
        answers.append({
            "question_id": question_id,
            "answer": answer,
            "selected_option": selected_option
        })

    await db.exam_attempts.update_one(
        {"_id": attempt["_id"]},
        {"$set": {"answers": answers}}
    )

    return {"message": "Answer saved", "saved_count": len(answers)}


@router.post("/exams/{exam_id}/submit")
async def submit_exam(
    exam_id: str,
    data: dict = None,
    current_user=Depends(require_role("student"))
):
    student_email = current_user["email"]
    data = data or {}

    attempt = await db.exam_attempts.find_one({
        "exam_id": exam_id,
        "student_email": student_email,
        "status": "in_progress"
    })

    if not attempt:
        raise HTTPException(status_code=404, detail="No active attempt found")

    update_fields = {
        "status": "submitted",
        "submitted_at": datetime.utcnow().isoformat()
    }

    if isinstance(data.get("answers"), list):
        update_fields["answers"] = data["answers"]

    await db.exam_attempts.update_one(
        {"_id": attempt["_id"]},
        {"$set": update_fields}
    )

    return {"message": "Exam submitted successfully"}


@router.get("/classes/{class_id}/exam-results")
async def get_student_exam_results(
    class_id: str,
    current_user=Depends(require_role("student"))
):
    student_email = current_user["email"]

    cls = await db.classes.find_one({"_id": ObjectId(class_id)})
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if student_email not in cls.get("students", []):
        raise HTTPException(status_code=403, detail="Not enrolled in this class")

    results = []
    cursor = db.class_exams.find({
        "class_id": class_id,
        "status": "published"
    }).sort("published_at", -1)

    async for exam in cursor:
        exam_id = str(exam["_id"])
        attempt = await db.exam_attempts.find_one({
            "exam_id": exam_id,
            "student_email": student_email,
            "status": "submitted"
        })
        if not attempt:
            continue

        answers = attempt.get("answers", [])
        answers_by_question = {answer.get("question_id"): answer for answer in answers}
        score = 0
        graded_marks = 0

        for index, question in enumerate(exam.get("questions", [])):
            if question.get("type") != "mcq":
                continue
            marks = question.get("marks", 1)
            graded_marks += marks
            saved_answer = answers_by_question.get(index, {})
            if saved_answer.get("selected_option") == question.get("correct_answer"):
                score += marks

        submitted_at = attempt.get("submitted_at")
        if submitted_at and hasattr(submitted_at, "isoformat"):
            submitted_at = submitted_at.isoformat()

        results.append({
            "exam_id": exam_id,
            "title": exam.get("title", ""),
            "subject": exam.get("subject", ""),
            "submitted_at": submitted_at,
            "status": "published",
            "score": score,
            "graded_marks": graded_marks,
            "total_marks": exam.get("total_marks", 0),
            "answers": answers,
        })

    return results



