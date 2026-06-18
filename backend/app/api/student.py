from fastapi import APIRouter, Depends
from fastapi import HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db

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
        "totalActivities": total_activities
    }


@router.get("/assignments")
async def student_assignments(
    current_user=Depends(require_role("student"))
):
    """List all assignments available to the student."""
    assignments = []
    cursor = db.assignments.find().sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        assignments.append(item)

    return assignments
