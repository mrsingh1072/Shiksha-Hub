from fastapi import APIRouter, Depends
from fastapi import HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId

router = APIRouter()


@router.get("/dashboard")
async def student_dashboard(
    current_user=Depends(
        require_role("student")
    )
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

    # Assignment module stats
    total_assignments = await db.assignments.count_documents({})
    evaluated_count = await db.submissions.count_documents(
        {"student_email": email, "teacher_marks": {"$ne": None}}
    )
    published_count = await db.submissions.count_documents(
        {"student_email": email, "published": True}
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
    """List all assignments available to the student, including teacher name."""
    assignments = []
    cursor = db.assignments.find().sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        # Ensure teacher_name is present
        if not item.get("teacher_name") and item.get("teacher_email"):
            teacher_user = await db.users.find_one({"email": item["teacher_email"]})
            item["teacher_name"] = teacher_user.get("name", "") if teacher_user else ""
        assignments.append(item)

    return assignments


@router.get("/notifications")
async def student_notifications(
    current_user=Depends(require_role("student"))
):
    """Get notifications for this student, sorted newest first."""
    notifications = []
    cursor = db.notifications.find(
        {"user_email": current_user["email"]}
    ).sort("created_at", -1).limit(50)

    async for n in cursor:
        n["_id"] = str(n["_id"])
        if n.get("created_at") and hasattr(n["created_at"], "isoformat"):
            n["created_at"] = n["created_at"].isoformat()
        notifications.append(n)

    return notifications


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(require_role("student"))
):
    """Mark a notification as read."""
    try:
        result = await db.notifications.update_one(
            {"_id": ObjectId(notification_id), "user_email": current_user["email"]},
            {"$set": {"read": True}}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"message": "Notification marked as read"}
