from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime
import random
import string
import json
from app.services.ai_client import ask_ai

router = APIRouter()


def generate_class_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


async def notify_class_students(cls, notification_type, title, message, exam_id):
    students = cls.get("students", [])
    if not students:
        return

    now = datetime.utcnow()
    await db.notifications.insert_many([
        {
            "user_email": student_email,
            "type": notification_type,
            "title": title,
            "message": message,
            "class_id": str(cls["_id"]),
            "exam_id": exam_id,
            "created_at": now,
            "read": False
        }
        for student_email in students
    ])

@router.post("/")
async def create_class(data: dict, current_user=Depends(require_role("teacher"))):
    class_code = generate_class_code()
    class_doc = {
        "teacher_email": current_user["email"],
        "class_name": data.get("class_name", ""),
        "subject": data.get("subject", ""),
        "semester": data.get("semester", ""),
        "section": data.get("section", ""),
        "description": data.get("description", ""),
        "class_code": class_code,
        "join_link": f"/join/{class_code}",
        "students": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.classes.insert_one(class_doc)
    return {
        "message": "Class created successfully",
        "class_id": str(result.inserted_id),
        "class_code": class_code,
        "join_link": f"/join/{class_code}"
    }


@router.get("/")
async def get_classes(current_user=Depends(require_role("teacher"))):
    classes = []
    cursor = db.classes.find({"teacher_email": current_user["email"]}).sort("created_at", -1)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        item["student_count"] = len(item.get("students", []))
        classes.append(item)
    return classes
@router.get("/available")
async def available_classes(
    current_user=Depends(require_role("student"))
):
    classes = []

    cursor = db.classes.find()

    async for cls in cursor:

        status = "available"

        # Student already joined
        if current_user["email"] in cls.get("students", []):
            status = "joined"

        else:
            request = await db.class_requests.find_one({
                "class_id": str(cls["_id"]),
                "student_email": current_user["email"]
            })

            if request:
                status = request["status"]

        classes.append({
            "_id": str(cls["_id"]),
            "class_name": cls.get("class_name"),
            "subject": cls.get("subject"),
            "semester": cls.get("semester"),
            "section": cls.get("section"),
            "description": cls.get("description"),
            "teacher_email": cls.get("teacher_email"),
            "class_code": cls.get("class_code"),
            "status": status
        })

    return classes


@router.get("/{class_id}")
async def get_class(class_id: str, current_user=Depends(require_role("teacher"))):
    cls = await db.classes.find_one({"_id": ObjectId(class_id), "teacher_email": current_user["email"]})
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    cls["_id"] = str(cls["_id"])
    student_details = []
    for email in cls.get("students", []):
        student = await db.users.find_one({"email": email})
        if student:
            student_details.append({
                "name": student.get("name", ""),
                "email": student.get("email", ""),
                "course": student.get("course", ""),
                "semester": student.get("yearSemester", "")
            })
    cls["student_details"] = student_details
    return cls


@router.put("/{class_id}")
async def update_class(class_id: str, data: dict, current_user=Depends(require_role("teacher"))):
    update_data = {k: v for k, v in data.items() if k in ["class_name", "subject", "semester", "section", "description"]}
    update_data["updated_at"] = datetime.utcnow()
    result = await db.classes.update_one(
        {"_id": ObjectId(class_id), "teacher_email": current_user["email"]},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class updated successfully"}


@router.delete("/{class_id}")
async def delete_class(class_id: str, current_user=Depends(require_role("teacher"))):
    result = await db.classes.delete_one({"_id": ObjectId(class_id), "teacher_email": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted successfully"}


@router.post("/join")
async def join_class(data: dict):
    cls = await db.classes.find_one({"class_code": data.get("class_code", "")})
    if not cls:
        raise HTTPException(status_code=404, detail="Invalid class code")
    student_email = data.get("student_email", "")
    if student_email in cls.get("students", []):
        return {"message": "Already joined this class"}
    await db.classes.update_one(
        {"_id": cls["_id"]},
        {"$addToSet": {"students": student_email}}
    )
    return {"message": "Joined class successfully", "class_name": cls["class_name"]}
@router.post("/request")
async def request_join_class(
    data: dict,
    current_user=Depends(require_role("student"))
):
    class_code = data.get("class_code", "").upper()

    cls = await db.classes.find_one({"class_code": class_code})

    if not cls:
        raise HTTPException(status_code=404, detail="Invalid class code")

    existing = await db.class_requests.find_one({
        "class_id": str(cls["_id"]),
        "student_email": current_user["email"],
        "status": {
            "$in": ["pending", "approved"]
        }
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Request already exists"
        )

    request = {
        "class_id": str(cls["_id"]),
        "teacher_email": cls["teacher_email"],
        "student_email": current_user["email"],
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    await db.class_requests.insert_one(request)

    return {
        "message": "Join request sent successfully"
    }
@router.get("/{class_id}/requests")
async def get_pending_requests(
    class_id: str,
    current_user=Depends(require_role("teacher"))
):
    requests = []

    cursor = db.class_requests.find({
        "class_id": class_id,
        "teacher_email": current_user["email"],
        "status": "pending"
    })

    async for req in cursor:
        user = await db.users.find_one({
            "email": req["student_email"]
        })

        requests.append({
            "request_id": str(req["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "course": user.get("course", ""),
            "semester": user.get("yearSemester", "")
        })

    return requests
@router.post("/{class_id}/approve/{request_id}")
async def approve_request(
    class_id: str,
    request_id: str,
    current_user=Depends(require_role("teacher"))
):
    request = await db.class_requests.find_one({
        "_id": ObjectId(request_id),
        "teacher_email": current_user["email"]
    })

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    await db.classes.update_one(
        {
            "_id": ObjectId(class_id),
            "teacher_email": current_user["email"]
        },
        {
            "$addToSet": {
                "students": request["student_email"]
            }
        }
    )

    await db.class_requests.update_one(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "approved"
            }
        }
    )
    cls = await db.classes.find_one({
    "_id": ObjectId(class_id),
    "teacher_email": current_user["email"]
    })
    await db.notifications.insert_one({
        "user_email": request["student_email"],
        "title": "ðŸŽ‰ Class Join Request Approved",
        "message": (
            f'Congratulations! Your request to join "{cls["class_name"]}" '
            f'has been approved.\n\n'
            f'Class Code: {cls["class_code"]}\n'
            f'Use this code to join your classroom.'
        ),
        "type": "class_approval",
        "class_id": class_id,
        "class_name": cls["class_name"],
        "class_code": cls["class_code"],
        "teacher_email": current_user["email"],
        "read": False,
        "created_at": datetime.utcnow()
    })
    return {
        "message": "Student approved successfully"
    }
@router.post("/{class_id}/reject/{request_id}")
async def reject_request(
    class_id: str,
    request_id: str,
    current_user=Depends(require_role("teacher"))
):
    request = await db.class_requests.find_one({
        "_id": ObjectId(request_id),
        "teacher_email": current_user["email"]
    })

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    await db.class_requests.update_one(
        {
            "_id": ObjectId(request_id),
            "teacher_email": current_user["email"]
        },
        {
            "$set": {
                "status": "rejected"
            }
        }
    )

    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })

    await db.notifications.insert_one({
        "user_email": request["student_email"],
        "title": "Class Join Request Rejected",
        "message": f'Your request to join "{cls["class_name"]}" has been rejected.',
        "type": "class_rejected",
        "class_id": class_id,
        "teacher_email": current_user["email"],
        "read": False,
        "created_at": datetime.utcnow()
    })

    return {
        "message": "Request rejected"
    }
@router.post("/{class_id}/announcements")
async def create_announcement(
    class_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })

    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    # Normalize type: accept "student" from legacy frontend but store as "personal"
    ann_type = data.get("type", "class")
    if ann_type == "student":
        ann_type = "personal"

    announcement = {
        "class_id": class_id,
        "teacher_email": current_user["email"],
        "title": data.get("title", ""),
        "message": data.get("message", ""),
        "type": ann_type,   # class / personal
        "student_email": data.get("student_email", None),
        "created_at": datetime.utcnow().isoformat()
    }

    result = await db.class_announcements.insert_one(announcement)
    announcement["_id"] = str(result.inserted_id)

    return {"message": "Announcement created successfully", "announcement": announcement}
@router.get("/{class_id}/announcements")
async def get_announcements(
    class_id: str,
    current_user=Depends(require_role("student"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id)
    })

    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    if current_user["email"] not in cls.get("students", []):
        raise HTTPException(status_code=403, detail="Not enrolled")

    announcements = []

    cursor = db.class_announcements.find({
        "class_id": class_id,
        "$or": [
            {"type": "class"},
            {"student_email": current_user["email"]}
        ]
    }).sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        item["created_at"] = item["created_at"].isoformat()
        announcements.append(item)

    return announcements
@router.get("/{class_id}/teacher-announcements")
async def get_teacher_announcements(
    class_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })

    if not cls:
        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    announcements = []

    cursor = db.class_announcements.find({
        "class_id": class_id
    }).sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])

        if item.get("created_at") and hasattr(item["created_at"], "isoformat"):
            item["created_at"] = item["created_at"].isoformat()

        announcements.append(item)

    return announcements


@router.put("/{class_id}/announcements/{announcement_id}")
async def update_class_announcement(
    class_id: str,
    announcement_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })

    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    update_data = {}
    for key in ["title", "message", "type", "student_email"]:
        if key in data:
            update_data[key] = data[key]

    # Normalize type
    if update_data.get("type") == "student":
        update_data["type"] = "personal"

    update_data["updated_at"] = datetime.utcnow().isoformat()

    result = await db.class_announcements.update_one(
        {
            "_id": ObjectId(announcement_id),
            "class_id": class_id,
            "teacher_email": current_user["email"]
        },
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found"
        )

    return {"message": "Announcement updated successfully"}


@router.delete("/{class_id}/announcements/{announcement_id}")
async def delete_class_announcement(
    class_id: str,
    announcement_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })

    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    result = await db.class_announcements.delete_one({
        "_id": ObjectId(announcement_id),
        "class_id": class_id,
        "teacher_email": current_user["email"]
    })

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found"
        )

    return {"message": "Announcement deleted successfully"}


# =============================================
# CLASS EXAMS â€” Per-class exam management
# =============================================


@router.post("/{class_id}/exams/manual")
async def create_manual_exam(
    class_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    questions = data.get("questions", [])
    total_marks = sum(q.get("marks", 1) for q in questions)

    exam_doc = {
        "class_id": class_id,
        "teacher_email": current_user["email"],
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "exam_type": "manual",
        "subject": data.get("subject", ""),
        "difficulty": data.get("difficulty", "medium"),
        "question_type": data.get("question_type", "mixed"),
        "duration_minutes": data.get("duration_minutes", 30),
        "total_marks": total_marks,
        "questions": questions,
        "status": data.get("status", "draft"),
        "created_at": datetime.utcnow().isoformat()
    }

    result = await db.class_exams.insert_one(exam_doc)
    exam_doc["_id"] = str(result.inserted_id)

    return {
        "message": "Exam created successfully",
        "exam": exam_doc
    }


@router.post("/{class_id}/exams/ai")
async def generate_ai_exam(
    class_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    subject = data.get("subject", "General")
    difficulty = data.get("difficulty", "medium")
    num_questions = min(data.get("num_questions", 5), 30)
    question_type = data.get("question_type", "mcq")

    # Build type instruction
    if question_type == "mcq":
        type_instruction = f"All {num_questions} questions must be MCQ type."
    elif question_type == "descriptive":
        type_instruction = f"All {num_questions} questions must be descriptive type (no options)."
    else:
        mcq_count = num_questions // 2
        desc_count = num_questions - mcq_count
        type_instruction = f"Generate {mcq_count} MCQ questions and {desc_count} descriptive questions."

    prompt = f"""Generate exactly {num_questions} {difficulty} level questions for the subject: {subject}.

{type_instruction}

Return ONLY a valid JSON array. Each question object must have these exact fields:
- "question_text": the question string
- "type": either "mcq" or "descriptive"
- "options": array of exactly 4 option strings (for MCQ) or empty array [] (for descriptive)
- "correct_answer": the correct option text (for MCQ) or a model answer string (for descriptive)
- "marks": integer marks for this question (MCQ: 1-2, Descriptive: 3-5)

Example MCQ:
{{"question_text": "What is a stack?", "type": "mcq", "options": ["LIFO structure", "FIFO structure", "Tree", "Graph"], "correct_answer": "LIFO structure", "marks": 2}}

Example Descriptive:
{{"question_text": "Explain the difference between stack and queue.", "type": "descriptive", "options": [], "correct_answer": "A stack follows LIFO while a queue follows FIFO...", "marks": 5}}

Return ONLY the JSON array, no markdown, no explanation."""

    ai_response = await ask_ai(prompt)

    # Parse questions from AI response
    questions = []
    try:
        questions = json.loads(ai_response)
    except json.JSONDecodeError:
        try:
            start = ai_response.find('[')
            end = ai_response.rfind(']') + 1
            if start >= 0 and end > start:
                questions = json.loads(ai_response[start:end])
        except (json.JSONDecodeError, ValueError):
            questions = []

    if not isinstance(questions, list):
        questions = []

    # Validate and normalize each question
    validated = []
    for q in questions:
        if not isinstance(q, dict) or not q.get("question_text"):
            continue
        validated.append({
            "question_text": q.get("question_text", ""),
            "type": q.get("type", "mcq"),
            "options": q.get("options", []) if q.get("type") == "mcq" else [],
            "correct_answer": q.get("correct_answer", ""),
            "marks": q.get("marks", 2)
        })

    if not validated:
        return {
            "message": "AI could not generate valid questions. Please try again.",
            "questions": [],
            "raw_response": ai_response[:500]
        }

    total_marks = sum(q.get("marks", 1) for q in validated)

    exam_doc = {
        "class_id": class_id,
        "teacher_email": current_user["email"],
        "title": data.get("title", f"{subject} - AI Generated Exam"),
        "description": data.get("description", f"AI-generated {difficulty} level {subject} exam"),
        "exam_type": "ai_generated",
        "subject": subject,
        "difficulty": difficulty,
        "question_type": question_type,
        "duration_minutes": data.get("duration_minutes", max(num_questions * 3, 15)),
        "total_marks": total_marks,
        "questions": validated,
        "status": "draft",
        "created_at": datetime.utcnow().isoformat()
    }

    result = await db.class_exams.insert_one(exam_doc)
    exam_doc["_id"] = str(result.inserted_id)

    return {
        "message": "Exam generated successfully",
        "exam": exam_doc,
        "total_questions": len(validated)
    }


@router.get("/{class_id}/exams")
async def get_class_exams(
    class_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    exams = []
    cursor = db.class_exams.find({
        "class_id": class_id,
        "teacher_email": current_user["email"]
    }).sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        item["question_count"] = len(item.get("questions", []))
        if item.get("created_at") and hasattr(item["created_at"], "isoformat"):
            item["created_at"] = item["created_at"].isoformat()
        exams.append(item)

    return exams


@router.post("/{class_id}/exams/{exam_id}/publish")
async def publish_class_exam(
    class_id: str,
    exam_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    result = await db.class_exams.update_one(
        {
            "_id": ObjectId(exam_id),
            "class_id": class_id,
            "teacher_email": current_user["email"]
        },
        {"$set": {"status": "published"}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")

    return {"message": "Exam published successfully"}


@router.post("/{class_id}/exams/{exam_id}/publish-results")
async def publish_exam_results(
    class_id: str,
    exam_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    result = await db.class_exams.update_one(
        {
            "_id": ObjectId(exam_id),
            "class_id": class_id,
            "teacher_email": current_user["email"]
        },
        {"$set": {"results_published": True}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")

    return {"message": "Exam results published successfully"}


@router.get("/{class_id}/exams/{exam_id}")
async def get_class_exam(
    class_id: str,
    exam_id: str,
    current_user=Depends(require_role("teacher"))
):
    exam = await db.class_exams.find_one({
        "_id": ObjectId(exam_id),
        "class_id": class_id,
        "teacher_email": current_user["email"]
    })
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    exam["_id"] = str(exam["_id"])
    if exam.get("created_at") and hasattr(exam["created_at"], "isoformat"):
        exam["created_at"] = exam["created_at"].isoformat()

    return exam


@router.put("/{class_id}/exams/{exam_id}")
async def update_class_exam(
    class_id: str,
    exam_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    exam = await db.class_exams.find_one({
        "_id": ObjectId(exam_id),
        "class_id": class_id,
        "teacher_email": current_user["email"]
    })
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.get("status") == "published":
        raise HTTPException(status_code=400, detail="Published exams are locked")

    update_data = {}
    for key in ["title", "description", "subject", "difficulty",
                "question_type", "duration_minutes", "total_marks",
                "questions"]:
        if key in data:
            update_data[key] = data[key]

    if "questions" in update_data:
        update_data["total_marks"] = sum(
            q.get("marks", 1) for q in update_data["questions"]
        )

    update_data["updated_at"] = datetime.utcnow().isoformat()

    await db.class_exams.update_one(
        {"_id": ObjectId(exam_id)},
        {"$set": update_data}
    )

    return {"message": "Exam updated successfully"}


@router.delete("/{class_id}/exams/{exam_id}")
async def delete_class_exam(
    class_id: str,
    exam_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    exam = await db.class_exams.find_one({
        "_id": ObjectId(exam_id),
        "class_id": class_id,
        "teacher_email": current_user["email"]
    })
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.get("status") == "published":
        raise HTTPException(status_code=400, detail="Published exams are locked")

    await db.class_exams.delete_one({"_id": ObjectId(exam_id)})
    return {"message": "Exam deleted successfully"}


@router.post("/{class_id}/exams/{exam_id}/start")
async def start_class_exam(
    class_id: str,
    exam_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    exam = await db.class_exams.find_one({
        "_id": ObjectId(exam_id),
        "class_id": class_id,
        "teacher_email": current_user["email"]
    })
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")

    if exam.get("status") == "published":
        raise HTTPException(status_code=400, detail="Published exams are locked")

    await db.class_exams.update_one(
        {"_id": ObjectId(exam_id)},
        {"$set": {
            "status": "active",
            "started_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }}
    )

    title = exam.get("title", "Exam")
    await notify_class_students(
        cls,
        "exam_started",
        "Exam Started",
        f"Your exam '{title}' has started",
        exam_id
    )

    return {"message": "Exam started successfully"}


@router.get("/{class_id}/exams/{exam_id}/submissions")
async def get_exam_submissions(
    class_id: str,
    exam_id: str,
    current_user=Depends(require_role("teacher"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")

    exam = await db.class_exams.find_one({
        "_id": ObjectId(exam_id),
        "class_id": class_id
    })
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    enrolled_students = cls.get("students", [])
    total_students = len(enrolled_students)
    submissions = []
    cursor = db.exam_attempts.find({"exam_id": exam_id}).sort("submitted_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        if item.get("submitted_at") and hasattr(item["submitted_at"], "isoformat"):
            item["submitted_at"] = item["submitted_at"].isoformat()
        if item.get("started_at") and hasattr(item["started_at"], "isoformat"):
            item["started_at"] = item["started_at"].isoformat()

        submissions.append({
            "_id": item["_id"],
            "student_email": item.get("student_email", ""),
            "status": item.get("status", "in_progress"),
            "started_at": item.get("started_at", ""),
            "submitted_at": item.get("submitted_at", ""),
            "answer_count": len(item.get("answers", []))
        })

    return submissions
