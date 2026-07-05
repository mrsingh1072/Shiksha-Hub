from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId

router = APIRouter()


@router.get("/dashboard")
async def student_dashboard(
    current_user=Depends(require_role("student"))
):
    user = await db.users.find_one(
        {
            "email": current_user["email"]
        }
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    email = current_user["email"]

    assignments_submitted = await db.submissions.count_documents(
        {
            "student_email": email
        }
    )

    notes_generated = await db.chat_history.count_documents(
        {
            "user_email": email,
            "type": "notes"
        }
    )

    exams_generated = await db.chat_history.count_documents(
        {
            "user_email": email,
            "type": "exam"
        }
    )

    total_activities = await db.chat_history.count_documents(
        {
            "user_email": email
        }
    )

    total_assignments = await db.assignments.count_documents({})

    evaluated_count = await db.submissions.count_documents(
        {
            "student_email": email,
            "teacher_marks": {"$ne": None}
        }
    )

    published_count = await db.submissions.count_documents(
        {
            "student_email": email,
            "published": True
        }
    )

    return {
        "studentId": user.get("userId", ""),
        "userId": user.get("userId", ""),
        "studentType": user.get("studentType", ""),
        "studentName": user.get("name", ""),
        "email": user.get("email", ""),
        "schoolName": user.get("schoolName", ""),
        "studentClass": user.get("studentClass", ""),
        "collegeName": user.get("collegeName", ""),
        "degree": user.get("degree", ""),
        "course": user.get("course", ""),
        "yearSemester": user.get("yearSemester", ""),
        "branch": user.get("branch", ""),
        "semester": user.get("semester", ""),
        "assignmentsSubmitted": assignments_submitted,
        "notesGenerated": notes_generated,
        "examsGenerated": exams_generated,
        "totalActivities": total_activities,
        "totalAssignments": total_assignments,
        "pendingAssignments": total_assignments - assignments_submitted,
        "evaluatedCount": evaluated_count,
        "publishedMarksCount": published_count,
    }


@router.get("/assignments")
async def student_assignments(
    current_user=Depends(require_role("student"))
):
    assignments = []

    cursor = db.assignments.find().sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])

        if not item.get("teacher_name") and item.get("teacher_email"):
            teacher = await db.users.find_one(
                {
                    "email": item["teacher_email"]
                }
            )

            item["teacher_name"] = teacher.get("name", "") if teacher else ""

        assignments.append(item)

    return assignments


@router.get("/notifications")
async def student_notifications(
    current_user=Depends(require_role("student"))
):
    notifications = []

    cursor = db.notifications.find(
        {
            "user_email": current_user["email"]
        }
    ).sort("created_at", -1).limit(50)

    async for item in cursor:
        item["_id"] = str(item["_id"])

        if item.get("created_at") and hasattr(item["created_at"], "isoformat"):
            item["created_at"] = item["created_at"].isoformat()

        notifications.append(item)

    return notifications


@router.get("/resources")
async def student_resources(
    current_user=Depends(require_role("student"))
):
    resources = []

    cursor = db.resources.find().sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])

        teacher = await db.users.find_one(
            {
                "email": item.get("teacher_email")
            }
        )

        item["teacher_name"] = teacher.get("name", "") if teacher else ""

        if item.get("created_at") and hasattr(item["created_at"], "isoformat"):
            item["created_at"] = item["created_at"].isoformat()

        resources.append(item)

    return resources


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(require_role("student"))
):
    try:
        result = await db.notifications.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_email": current_user["email"]
            },
            {
                "$set": {
                    "read": True
                }
            }
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid notification id"
        )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {
        "message": "Notification marked as read"
    }
@router.get("/classes/{class_id}")
async def get_student_class(
    class_id: str,
    current_user=Depends(require_role("student"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id)
    })

    if not cls:
        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    if current_user["email"] not in cls.get("students", []):
        raise HTTPException(
            status_code=403,
            detail="You are not enrolled in this class"
        )

    teacher = await db.users.find_one({
        "email": cls["teacher_email"]
    })

    student_details = []

    for email in cls.get("students", []):
        student = await db.users.find_one({"email": email})

        if student:
            student_details.append({
                "name": student.get("name", ""),
                "email": student.get("email", ""),
                "course": student.get("course", ""),
                "semester": student.get("semester", "")
            })

    return {
        "id": str(cls["_id"]),
        "class_name": cls.get("class_name", ""),
        "subject": cls.get("subject", ""),
        "semester": cls.get("semester", ""),
        "section": cls.get("section", ""),
        "class_code": cls.get("class_code", ""),
        "description": cls.get("description", ""),
        "teacher_name": teacher.get("name", "") if teacher else "",
        "teacher_email": cls.get("teacher_email", ""),
        "student_count": len(cls.get("students", [])),
        "student_details": student_details
    }
@router.get("/classes/{class_id}/announcements")
async def get_class_announcements(
    class_id: str,
    current_user=Depends(require_role("student"))
):
    cls = await db.classes.find_one({
        "_id": ObjectId(class_id)
    })

    if not cls:
        raise HTTPException(
            status_code=404,
            detail="Class not found"
        )

    if current_user["email"] not in cls.get("students", []):
        raise HTTPException(
            status_code=403,
            detail="You are not enrolled in this class"
        )

    announcements = []

    # Use class_announcements collection (matches teacher POST endpoint)
    # Filter: show class-wide OR personal announcements targeted to this student
    cursor = db.class_announcements.find({
        "class_id": class_id,
        "$or": [
            {"type": "class"},
            {"type": "personal", "student_email": current_user["email"]}
        ]
    }).sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])

        if item.get("created_at") and hasattr(item["created_at"], "isoformat"):
            item["created_at"] = item["created_at"].isoformat()

        announcements.append(item)

    return announcements