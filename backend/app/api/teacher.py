from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from datetime import datetime
from bson import ObjectId

router = APIRouter()


@router.get("/dashboard")
async def teacher_dashboard(
    current_user=Depends(
        require_role("teacher")
    )
):
    teacher_email = current_user["email"]

    user = await db.users.find_one(
        {"email": teacher_email}
    )

    teacher_id = user.get("userId", "") if user else ""

    # Count assignments created by this teacher
    assignments_created = await db.assignments.count_documents(
        {"teacher_email": teacher_email}
    )

    # Fallback: count all if no teacher-specific assignments yet
    if assignments_created == 0:
        assignments_created = await db.assignments.count_documents({})

    # Collect this teacher's assignment IDs
    teacher_assignment_ids = []
    async for a in db.assignments.find({"teacher_email": teacher_email}):
        teacher_assignment_ids.append(str(a["_id"]))

    # Count submissions scoped to teacher's assignments
    if teacher_assignment_ids:
        sub_filter = {"assignment_id": {"$in": teacher_assignment_ids}}
    else:
        sub_filter = {}

    submissions_received = await db.submissions.count_documents(sub_filter)

    pending_evaluations = await db.submissions.count_documents(
        {**sub_filter, "teacher_marks": None}
    ) if teacher_assignment_ids else 0

    evaluated_count = await db.submissions.count_documents(
        {**sub_filter, "teacher_marks": {"$ne": None}}
    ) if teacher_assignment_ids else 0

    published_count = await db.submissions.count_documents(
        {**sub_filter, "published": True}
    ) if teacher_assignment_ids else 0

    # Count classes
    total_classes = await db.classes.count_documents(
        {"teacher_email": teacher_email}
    )

    # Count students across teacher's classes
    student_emails = set()
    async for cls in db.classes.find({"teacher_email": teacher_email}):
        for s in cls.get("students", []):
            student_emails.add(s)

    total_students = len(student_emails)
    if total_students == 0:
        total_students = await db.users.count_documents(
            {"role": "student"}
        )

    # Pending reviews (legacy field — kept for backward compatibility)
    pending_reviews = pending_evaluations

    # Average student score
    pipeline = [
        {"$match": {"score": {"$exists": True}}},
        {"$group": {"_id": None, "avg": {"$avg": "$score"}}}
    ]
    avg_result = await db.submissions.aggregate(pipeline).to_list(1)
    avg_score = round(avg_result[0]["avg"], 1) if avg_result else 0

    # Recent activity (last 10 from announcements + submissions)
    recent_activity = []
    async for ann in db.announcements.find(
        {"teacher_email": teacher_email}
    ).sort("created_at", -1).limit(5):
        recent_activity.append({
            "type": "announcement",
            "title": ann.get("title", ""),
            "time": ann.get("created_at", datetime.utcnow()).isoformat(),
            "description": f"Announcement: {ann.get('title', '')}"
        })

    async for sub in db.submissions.find().sort("_id", -1).limit(5):
        recent_activity.append({
            "type": "submission",
            "title": f"New submission from {sub.get('student_email', 'student')}",
            "time": sub.get("submitted_at", datetime.utcnow()).isoformat() if sub.get("submitted_at") else datetime.utcnow().isoformat(),
            "description": sub.get("assignment_id", "")
        })

    recent_activity.sort(
        key=lambda x: x.get("time", ""),
        reverse=True
    )

    # Upcoming deadlines (assignments with future due dates)
    upcoming_deadlines = []
    async for a in db.assignments.find(
        {"teacher_email": teacher_email}
    ).sort("due_date", 1).limit(5):
        upcoming_deadlines.append({
            "title": a.get("title", ""),
            "subject": a.get("subject", ""),
            "due_date": a.get("due_date", ""),
            "class_id": str(a.get("class_id", ""))
        })

    return {
        "teacherId": teacher_id,
        "teacherName": user.get("name", "") if user else "",
        "email": user.get("email", "") if user else teacher_email,
        "department": user.get("department", "") if user else "",
        "subjects": user.get("subjects", []) if user else [],
        "designation": user.get("designation", "") if user else "",
        "experience": user.get("experience", 0) if user else 0,
        "qualification": user.get("qualification", "") if user else "",
        "profilePhoto": user.get("profilePhoto", "") if user else "",
        "assignmentsCreated": assignments_created,
        "submissionsReceived": submissions_received,
        "totalStudents": total_students,
        "totalClasses": total_classes,
        "pendingReviews": pending_reviews,
        "pendingEvaluations": pending_evaluations,
        "evaluatedAssignments": evaluated_count,
        "publishedResults": published_count,
        "averageScore": avg_score,
        "recentActivity": recent_activity[:10],
        "upcomingDeadlines": upcoming_deadlines
    }


@router.get("/notifications")
async def teacher_notifications(
    current_user=Depends(require_role("teacher"))
):
    notifications = []
    
    cursor = db.notifications.find(
        {"user_email": current_user["email"]}
    ).sort("created_at", -1)
    
    async for item in cursor:
        item["_id"] = str(item["_id"])
        if "created_at" in item and isinstance(item["created_at"], datetime):
            item["created_at"] = item["created_at"].isoformat()
        else:
            item["created_at"] = datetime.utcnow().isoformat()
        notifications.append(item)

    return notifications


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user=Depends(require_role("teacher"))
):
    try:
        result = await db.notifications.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_email": current_user["email"]
            },
            {"$set": {"read": True}}
        )
        if result.modified_count == 1:
            return {"message": "Notification marked as read"}
        raise HTTPException(status_code=404, detail="Notification not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid notification ID")