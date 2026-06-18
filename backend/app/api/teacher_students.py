from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId

router = APIRouter()


@router.get("/")
async def get_students(current_user=Depends(require_role("teacher"))):
    teacher_email = current_user["email"]

    # Get all students from teacher's classes
    student_emails = set()
    async for cls in db.classes.find({"teacher_email": teacher_email}):
        for s in cls.get("students", []):
            student_emails.add(s)

    # If no classes yet, show all students
    if not student_emails:
        students = []
        cursor = db.users.find({"role": "student"}).limit(100)
        async for user in cursor:
            user["_id"] = str(user["_id"])
            user.pop("password", None)
            students.append({
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "course": user.get("course", user.get("degree", "")),
                "semester": user.get("yearSemester", ""),
                "college": user.get("collegeName", user.get("schoolName", "")),
                "studentType": user.get("studentType", ""),
                "userId": user.get("userId", ""),
            })
        return students

    students = []
    for email in student_emails:
        user = await db.users.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
            user.pop("password", None)

            # Get assignment submissions
            sub_count = await db.submissions.count_documents({"student_email": email})
            
            students.append({
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "course": user.get("course", user.get("degree", "")),
                "semester": user.get("yearSemester", ""),
                "college": user.get("collegeName", user.get("schoolName", "")),
                "studentType": user.get("studentType", ""),
                "userId": user.get("userId", ""),
                "submissionCount": sub_count,
            })

    return students


@router.get("/search")
async def search_students(q: str = Query(""), current_user=Depends(require_role("teacher"))):
    if not q:
        return []

    query = {
        "role": "student",
        "$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
            {"userId": {"$regex": q, "$options": "i"}},
        ]
    }
    students = []
    cursor = db.users.find(query).limit(20)
    async for user in cursor:
        user["_id"] = str(user["_id"])
        user.pop("password", None)
        students.append({
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "course": user.get("course", user.get("degree", "")),
            "semester": user.get("yearSemester", ""),
            "userId": user.get("userId", ""),
        })
    return students


@router.get("/{student_email}")
async def get_student_detail(student_email: str, current_user=Depends(require_role("teacher"))):
    user = await db.users.find_one({"email": student_email, "role": "student"})
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    user["_id"] = str(user["_id"])
    user.pop("password", None)

    # Get submissions
    submissions = []
    async for sub in db.submissions.find({"student_email": student_email}).sort("_id", -1).limit(20):
        sub["_id"] = str(sub["_id"])
        submissions.append(sub)

    # Get exam results from chat_history
    exam_results = []
    async for h in db.chat_history.find({"user_email": student_email, "type": "exam"}).sort("created_at", -1).limit(10):
        h["_id"] = str(h["_id"])
        exam_results.append({
            "subject": h.get("metadata", {}).get("subject", ""),
            "score": h.get("metadata", {}).get("score", 0),
            "date": h.get("created_at", "").isoformat() if hasattr(h.get("created_at", ""), "isoformat") else str(h.get("created_at", ""))
        })

    return {
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "course": user.get("course", user.get("degree", "")),
        "semester": user.get("yearSemester", ""),
        "college": user.get("collegeName", user.get("schoolName", "")),
        "studentType": user.get("studentType", ""),
        "userId": user.get("userId", ""),
        "phone": user.get("phone", ""),
        "submissions": submissions,
        "examResults": exam_results,
    }
