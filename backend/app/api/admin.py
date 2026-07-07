from datetime import datetime, timedelta
import os

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query

from app.database.mongodb import db
from app.dependencies.roles import require_role
from app.services.email_service import send_teacher_approval_email

router = APIRouter()
admin_only = require_role("admin")


def serialize(document):
    if not document:
        return document
    result = {}
    for key, value in document.items():
        if key == "password":
            continue
        if isinstance(value, ObjectId):
            value = str(value)
        elif isinstance(value, datetime):
            value = value.isoformat()
        result[key] = value
    return result


def object_id(value):
    try:
        return ObjectId(value)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid resource id") from exc


async def log_action(action_type, actor, message, metadata=None):
    await db.system_logs.insert_one({
        "type": action_type,
        "actor": actor,
        "message": message,
        "metadata": metadata or {},
        "created_at": datetime.utcnow(),
    })


@router.get("/dashboard")
async def dashboard(current_user=Depends(admin_only)):
    counts = {}
    for key, collection, query in [
        ("totalStudents", db.users, {"role": "student"}),
        ("totalTeachers", db.users, {"role": "teacher"}),
        ("totalClasses", db.classes, {}),
        ("totalAssignments", db.assignments, {}),
        ("totalExams", db.exams, {}),
        ("totalResources", db.resources, {}),
    ]:
        counts[key] = await collection.count_documents(query)

    since = datetime.utcnow() - timedelta(days=1)
    counts["activeUsers"] = await db.users.count_documents({"last_login": {"$gte": since}})
    counts["platformUsage"] = (
        await db.chat_history.count_documents({}) +
        await db.tutor_conversations.count_documents({}) +
        await db.teacher_chat_history.count_documents({})
    )
    counts["pendingTeachers"] = await db.users.count_documents(
        {"role": "teacher", "status": "pending"}
    )
    counts["approvedTeachers"] = await db.users.count_documents({
        "role": "teacher",
        "$or": [
            {"status": {"$in": ["approved", "active"]}},
            {"status": {"$exists": False}},
        ],
    })
    counts["rejectedTeachers"] = await db.users.count_documents(
        {"role": "teacher", "status": "rejected"}
    )

    registrations = [
        serialize(item) async for item in
        db.users.find({}, {"password": 0}).sort("created_at", -1).limit(6)
    ]
    activities = [
        serialize(item) async for item in db.system_logs.find().sort("created_at", -1).limit(8)
    ]
    recent_approvals = [
        serialize(item) async for item in
        db.system_logs.find({"type": "teacher_approval"}).sort("created_at", -1).limit(6)
    ]
    return {
        **counts,
        "recentRegistrations": registrations,
        "recentActivities": activities,
        "recentApprovals": recent_approvals,
        "systemHealth": {"api": "operational", "database": "operational", "ai": "operational"},
    }


async def user_list(role, search, status, limit):
    query = {"role": role}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"userId": {"$regex": search, "$options": "i"}},
        ]
    if status:
        query["status"] = status
    return [
        serialize(item) async for item in
        db.users.find(query, {"password": 0}).sort("created_at", -1).limit(limit)
    ]


@router.get("/students")
async def students(search: str = "", status: str = "", limit: int = Query(100, le=500),
                   current_user=Depends(admin_only)):
    return await user_list("student", search, status, limit)


@router.get("/teachers")
async def teachers(search: str = "", status: str = "", limit: int = Query(100, le=500),
                   current_user=Depends(admin_only)):
    return await user_list("teacher", search, status, limit)


@router.patch("/teachers/{teacher_id}/approve")
async def approve_teacher(teacher_id: str, current_user=Depends(admin_only)):
    teacher = await db.users.find_one(
        {"_id": object_id(teacher_id), "role": "teacher"},
        {"password": 0},
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher application not found")

    now = datetime.utcnow()
    await db.users.update_one(
        {"_id": teacher["_id"]},
        {"$set": {
            "status": "approved",
            "approved_at": now,
            "approved_by": current_user["email"],
        }},
    )

    email_sent = True
    email_error = None
    try:
        await send_teacher_approval_email(
            teacher["email"],
            teacher.get("name", "Teacher"),
            teacher.get("userId", ""),
        )
        await db.users.update_one(
            {"_id": teacher["_id"]},
            {"$set": {"approval_email_sent_at": datetime.utcnow()}, "$unset": {"approval_email_error": ""}},
        )
    except Exception as exc:
        email_sent = False
        email_error = str(exc)
        await db.users.update_one(
            {"_id": teacher["_id"]},
            {"$set": {"approval_email_error": email_error}},
        )

    await log_action(
        "teacher_approval",
        current_user["email"],
        f"Teacher approved: {teacher.get('name', teacher['email'])}",
        {"teacher_id": teacher_id, "teacher_email": teacher["email"], "email_sent": email_sent},
    )
    return {
        "message": "Teacher approved successfully",
        "status": "approved",
        "email_sent": email_sent,
        "email_error": email_error,
    }


@router.patch("/teachers/{teacher_id}/reject")
async def reject_teacher(teacher_id: str, current_user=Depends(admin_only)):
    now = datetime.utcnow()
    result = await db.users.update_one(
        {"_id": object_id(teacher_id), "role": "teacher"},
        {"$set": {
            "status": "rejected",
            "rejected_at": now,
            "rejected_by": current_user["email"],
        }},
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Teacher application not found")
    await log_action(
        "teacher_rejection",
        current_user["email"],
        "Teacher application rejected",
        {"teacher_id": teacher_id},
    )
    return {"message": "Teacher application rejected", "status": "rejected"}


@router.get("/users/{user_id}")
async def user_details(user_id: str, current_user=Depends(admin_only)):
    user = await db.users.find_one({"_id": object_id(user_id)}, {"password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    email = user.get("email")
    details = serialize(user)
    details["assignments"] = [
        serialize(x) async for x in db.submissions.find({"student_email": email}).limit(50)
    ]
    details["examScores"] = [
        serialize(x) async for x in db.exam_results.find({"student_email": email}).limit(50)
    ]
    details["attendance"] = [
        serialize(x) async for x in db.attendance.find({"student_email": email}).limit(50)
    ]
    details["aiTutorUsage"] = await db.chat_history.count_documents({"user_email": email})
    details["activityHistory"] = [
        serialize(x) async for x in db.system_logs.find({"actor": email}).sort("created_at", -1).limit(30)
    ]
    if user.get("role") == "teacher":
        details["classes"] = [
            serialize(x) async for x in db.classes.find({"teacher_email": email}).limit(50)
        ]
        details["assignmentsCreated"] = await db.assignments.count_documents({"teacher_email": email})
    return details


@router.patch("/users/{user_id}")
async def update_user(user_id: str, data: dict, current_user=Depends(admin_only)):
    allowed = {"name", "email", "phone", "subject", "qualification", "experience"}
    update = {key: value for key, value in data.items() if key in allowed}
    if not update:
        raise HTTPException(status_code=400, detail="No supported fields supplied")
    result = await db.users.update_one({"_id": object_id(user_id)}, {"$set": update})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="User not found")
    await log_action("user_update", current_user["email"], "User account updated", {"user_id": user_id})
    return {"message": "User updated"}


@router.patch("/users/{user_id}/status")
async def update_user_status(user_id: str, data: dict, current_user=Depends(admin_only)):
    user = await db.users.find_one({"_id": object_id(user_id)}, {"role": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.get("role") == "teacher":
        raise HTTPException(
            status_code=400,
            detail="Use the teacher approval or rejection endpoint",
        )
    status = data.get("status")
    if status not in {"active", "suspended", "approved", "rejected"}:
        raise HTTPException(status_code=400, detail="Invalid account status")
    result = await db.users.update_one({"_id": user["_id"]}, {"$set": {"status": status}})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="User not found")
    await log_action("account_status", current_user["email"], f"Account marked {status}", {"user_id": user_id})
    return {"message": f"Account marked {status}"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user=Depends(admin_only)):
    result = await db.users.delete_one({"_id": object_id(user_id)})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="User not found")
    await log_action("user_delete", current_user["email"], "User account deleted", {"user_id": user_id})
    return {"message": "User deleted"}


COLLECTIONS = {
    "classes": db.classes,
    "assignments": db.assignments,
    "exams": db.exams,
    "questions": db.question_bank,
    "resources": db.resources,
}


@router.get("/all-exams")
async def get_all_exams(search: str = "", limit: int = Query(500, le=1000), current_user=Depends(admin_only)):
    class_exams = await db.class_exams.find().sort("created_at", -1).limit(limit).to_list(limit)
    draft_exams = await db.exams.find({"status": "draft"}).sort("created_at", -1).limit(limit).to_list(limit)
    
    all_exams = class_exams + draft_exams
    
    teachers = await db.users.find({"role": "teacher"}).to_list(None)
    teacher_map = {t.get("email"): t.get("name", "Unknown Teacher") for t in teachers}
    
    classes = await db.classes.find().to_list(None)
    class_map = {str(c["_id"]): c for c in classes}
    
    results = []
    for ex in all_exams:
        ex_dict = serialize(ex)
        
        teacher_email = ex_dict.get("teacher_email")
        ex_dict["teacher_name"] = teacher_map.get(teacher_email, "Unknown")
        
        class_id = ex_dict.get("class_id")
        if class_id and class_id in class_map:
            cls = class_map[class_id]
            ex_dict["class_name"] = cls.get("class_name", "")
            ex_dict["semester"] = cls.get("semester", "")
            ex_dict["section"] = cls.get("section", "")
        else:
            ex_dict["class_name"] = "N/A"
            ex_dict["semester"] = "N/A"
            ex_dict["section"] = "N/A"
            
        ex_dict["total_questions"] = len(ex_dict.get("questions", []))
        if "duration_minutes" in ex_dict:
            ex_dict["duration"] = ex_dict["duration_minutes"]
        
        results.append(ex_dict)
        
    if search:
        search_lower = search.lower()
        results = [r for r in results if 
                   search_lower in r.get("title", "").lower() or 
                   search_lower in r.get("teacher_name", "").lower() or
                   search_lower in r.get("class_name", "").lower()
                   ]
                   
    results.sort(key=lambda x: str(x.get("created_at", "")), reverse=True)
    return results[:limit]


@router.get("/content/{kind}")
async def list_content(kind: str, search: str = "", limit: int = Query(100, le=500),
                       current_user=Depends(admin_only)):
    collection = COLLECTIONS.get(kind)
    if collection is None:
        raise HTTPException(status_code=404, detail="Unknown content type")
    query = {}
    if search:
        fields = ["title", "class_name", "subject", "question_text", "teacher_email"]
        query["$or"] = [{field: {"$regex": search, "$options": "i"}} for field in fields]
    return [serialize(x) async for x in collection.find(query).sort("created_at", -1).limit(limit)]


@router.patch("/content/classes/{item_id}/teacher")
async def assign_teacher(item_id: str, data: dict, current_user=Depends(admin_only)):
    email = data.get("teacher_email", "")
    teacher = await db.users.find_one({"email": email, "role": "teacher"})
    if not teacher:
        raise HTTPException(status_code=400, detail="Teacher not found")
    result = await db.classes.update_one({"_id": object_id(item_id)}, {"$set": {"teacher_email": email}})
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Teacher assigned"}


@router.patch("/content/questions/{item_id}/approve")
async def approve_question(item_id: str, current_user=Depends(admin_only)):
    result = await db.question_bank.update_one(
        {"_id": object_id(item_id)}, {"$set": {"status": "approved", "approved_at": datetime.utcnow()}}
    )
    if not result.matched_count:
        raise HTTPException(status_code=404, detail="Question not found")
    return {"message": "Question approved"}


@router.delete("/all-exams/{item_id}")
async def delete_all_exams_item(item_id: str, current_user=Depends(admin_only)):
    result = await db.class_exams.delete_one({"_id": object_id(item_id)})
    if not result.deleted_count:
        result = await db.exams.delete_one({"_id": object_id(item_id)})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Exam not found")
    await log_action("content_delete", current_user["email"], "Exam deleted", {"item_id": item_id})
    return {"message": "Exam deleted"}

@router.delete("/content/{kind}/{item_id}")
async def delete_content(kind: str, item_id: str, current_user=Depends(admin_only)):
    collection = COLLECTIONS.get(kind)
    if collection is None:
        raise HTTPException(status_code=404, detail="Unknown content type")
    result = await collection.delete_one({"_id": object_id(item_id)})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Content not found")
    await log_action("content_delete", current_user["email"], f"{kind} item deleted", {"item_id": item_id})
    return {"message": "Content deleted"}


@router.get("/announcements")
async def announcements(current_user=Depends(admin_only)):
    return [serialize(x) async for x in db.announcements.find({"global": True}).sort("created_at", -1).limit(100)]


@router.post("/announcements")
async def create_announcement(data: dict, current_user=Depends(admin_only)):
    audience = data.get("audience", "all")
    if audience not in {"all", "students", "teachers"}:
        raise HTTPException(status_code=400, detail="Invalid audience")
    document = {
        "title": data.get("title", "").strip(),
        "content": data.get("content", "").strip(),
        "audience": audience,
        "global": True,
        "created_by": current_user["email"],
        "created_at": datetime.utcnow(),
    }
    if not document["title"] or not document["content"]:
        raise HTTPException(status_code=400, detail="Title and content are required")
    result = await db.announcements.insert_one(document)
    announcement_id = str(result.inserted_id)
    
    # Broadcast notification to users
    query = {}
    if audience == "students":
        query = {"role": "student"}
    elif audience == "teachers":
        query = {"role": "teacher"}
    else:
        query = {"role": {"$in": ["student", "teacher"]}}
        
    users = db.users.find(query, {"email": 1})
    notifications = []
    now = datetime.utcnow()
    async for u in users:
        notifications.append({
            "user_email": u["email"],
            "type": "announcement",
            "title": "Platform Announcement",
            "message": document["title"],
            "announcement_id": announcement_id,
            "read": False,
            "created_at": now
        })
        
    if notifications:
        await db.notifications.insert_many(notifications)

    await log_action("announcement", current_user["email"], "Global announcement published")
    return {"message": "Announcement published", "announcement_id": announcement_id}


@router.get("/analytics")
async def analytics(current_user=Depends(admin_only)):
    async def daily_counts(collection, field, filters=None):
        since = datetime.utcnow() - timedelta(days=30)
        match = {field: {"$gte": since}, **(filters or {})}
        pipeline = [
            {"$match": match},
            {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": f"${field}"}}, "value": {"$sum": 1}}},
            {"$sort": {"_id": 1}},
        ]
        return [{"date": x["_id"], "value": x["value"]} async for x in collection.aggregate(pipeline)]

    return {
        "studentGrowth": await daily_counts(db.users, "created_at", {"role": "student"}),
        "teacherGrowth": await daily_counts(db.users, "created_at", {"role": "teacher"}),
        "examActivity": await daily_counts(db.exams, "created_at"),
        "assignmentActivity": await daily_counts(db.assignments, "created_at"),
        "attendanceRecords": await db.attendance.count_documents({}),
        "aiRequests": await db.chat_history.count_documents({}) + await db.teacher_chat_history.count_documents({}),
        "mostActiveClasses": [serialize(x) async for x in db.classes.find().sort("student_count", -1).limit(8)],
    }


@router.get("/ai-monitoring")
async def ai_monitoring(current_user=Depends(admin_only)):
    tutor = await db.chat_history.count_documents({})
    voice = await db.chat_history.count_documents({"type": {"$in": ["voice", "avatar"]}})
    exams = await db.chat_history.count_documents({"type": "exam"})
    teacher = await db.teacher_chat_history.count_documents({})
    return {
        "tutorRequests": tutor, "voiceRequests": voice, "examGenerationRequests": exams,
        "teacherAIRequests": teacher, "totalRequests": tutor + teacher,
        "tokenConsumption": "Provider telemetry not configured",
    }


@router.get("/logs")
async def logs(log_type: str = "", limit: int = Query(200, le=1000), current_user=Depends(admin_only)):
    query = {"type": log_type} if log_type else {}
    return [serialize(x) async for x in db.system_logs.find(query).sort("created_at", -1).limit(limit)]


@router.get("/profile")
async def profile(current_user=Depends(admin_only)):
    return {
        "name": os.getenv("ADMIN_NAME", "Platform Administrator"),
        "email": os.getenv("ADMIN_EMAIL", ""),
        "configurationManaged": True,
    }


@router.get("/settings")
async def settings(current_user=Depends(admin_only)):
    return {
        "platformName": os.getenv("PLATFORM_NAME", "Shiksha Hub"),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "sessionHours": 24,
        "adminRegistration": False,
        "notificationsEnabled": True,
    }
