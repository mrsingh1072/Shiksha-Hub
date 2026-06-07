from fastapi import APIRouter, Depends
from app.database.mongodb import db
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("/dashboard")
async def analytics_dashboard(
    current_user=Depends(
        get_current_user
    )
):

    email = current_user["email"]

    chat_count = await db.chat_history.count_documents(
        {
            "user_email": email,
            "type": "chat"
        }
    )

    tutor_count = await db.chat_history.count_documents(
        {
            "user_email": email,
            "type": "tutor"
        }
    )

    notes_count = await db.chat_history.count_documents(
        {
            "user_email": email,
            "type": "notes"
        }
    )

    exam_count = await db.chat_history.count_documents(
        {
            "user_email": email,
            "type": "exam"
        }
    )

    assignment_count = await db.chat_history.count_documents(
        {
            "user_email": email,
            "type": "assignment"
        }
    )

    total_activities = (
        chat_count +
        tutor_count +
        notes_count +
        exam_count +
        assignment_count
    )

    usage = {
        "chat": chat_count,
        "tutor": tutor_count,
        "notes": notes_count,
        "exam": exam_count,
        "assignment": assignment_count
    }

    most_used_feature = max(
        usage,
        key=usage.get
    )

    latest_activity = await db.chat_history.find_one(
        {
            "user_email": email
        },
        sort=[("created_at", -1)]
    )

    return {
        "totalActivities": total_activities,
        "chatCount": chat_count,
        "tutorCount": tutor_count,
        "notesCount": notes_count,
        "examCount": exam_count,
        "assignmentCount": assignment_count,
        "mostUsedFeature": most_used_feature,
        "lastActivity": (
            latest_activity["created_at"]
            if latest_activity
            else None
        )
    }