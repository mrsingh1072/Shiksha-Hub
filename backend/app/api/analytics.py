from fastapi import APIRouter, Depends
from app.database.mongodb import db
from app.dependencies.auth import get_current_user
import re

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
@router.get("/admin")
async def admin_dashboard():

    total_users = await db.users.count_documents({})

    total_students = await db.users.count_documents(
        {"role": "student"}
    )

    total_teachers = await db.users.count_documents(
        {"role": "teacher"}
    )

    total_admins = await db.users.count_documents(
        {"role": "admin"}
    )
    total_assignments = await db.assignments.count_documents(
    {}
    )

    total_submissions = await db.submissions.count_documents(
    {}
    )

    total_activities = await db.chat_history.count_documents({})

    latest_user = await db.users.find_one(
        sort=[("_id", -1)]
    )

    latest_activity = await db.chat_history.find_one(
        sort=[("created_at", -1)]
    )

    notes_count = await db.chat_history.count_documents(
        {"type": "notes"}
    )

    exam_count = await db.chat_history.count_documents(
        {"type": "exam"}
    )

    assignment_count = await db.chat_history.count_documents(
        {"type": "assignment"}
    )

    tutor_count = await db.chat_history.count_documents(
        {"type": "tutor"}
    )

    chat_count = await db.chat_history.count_documents(
        {"type": "chat"}
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

    return {
        "totalUsers": total_users,
        "totalStudents": total_students,
        "totalTeachers": total_teachers,
        "totalAdmins": total_admins,
        "totalAssignments": total_assignments,
        "totalSubmissions": total_submissions,
        "totalActivities": total_activities,
        "mostUsedFeature": most_used_feature,
        "latestUser": (
            latest_user["email"]
            if latest_user else None
        ),
        "latestActivity": (
            latest_activity["created_at"]
            if latest_activity else None
        )
    }
{
    "mostUsedFeature": "assignment",
    "latestUser": "test@gmail.com",
    "latestActivity": "2026-06-06T15:17:06"
}
@router.get("/leaderboard")
async def leaderboard():

    students = []

    cursor = db.users.find(
        {
            "role": "student"
        }
    )

    async for student in cursor:

        submissions_cursor = db.submissions.find(
            {
                "student_email":
                student["email"]
            }
        )

        total_marks = 0
        total_submissions = 0

        async for submission in submissions_cursor:

            evaluation = submission.get(
                "evaluation",
                ""
            )

            match = re.search(
                r'(\d+)\s*/\s*10',
                evaluation
            )

            if match:

                total_marks += int(
                    match.group(1)
                )

                total_submissions += 1

        average_score = 0

        if total_submissions > 0:

            average_score = round(
                total_marks /
                total_submissions,
                2
            )

        students.append(
            {
                "name":
                student["name"],

                "email":
                student["email"],

                "assignmentsSubmitted":
                total_submissions,

                "averageScore":
                average_score
            }
        )

    students.sort(
        key=lambda x:
        x["averageScore"],
        reverse=True
    )

    for index, student in enumerate(
        students,
        start=1
    ):

        student["rank"] = index

    return students