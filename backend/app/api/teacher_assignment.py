from fastapi import APIRouter, Depends, HTTPException, Query
from app.database.mongodb import db
from app.dependencies.roles import require_role
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/")
async def create_assignment(
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    # Look up teacher name from users collection
    teacher_user = await db.users.find_one({"email": current_user["email"]})
    teacher_name = teacher_user.get("name", "") if teacher_user else ""

    assignment = {
        "teacher_email": current_user["email"],
        "teacher_name": teacher_name,
        "title": data.get("title", ""),
        "subject": data.get("subject", ""),
        "description": data.get("description", ""),
        "due_date": data.get("due_date", ""),
        "class_id": data.get("class_id", ""),
        "total_marks": data.get("total_marks", 100),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await db.assignments.insert_one(assignment)
    assignment_id = str(result.inserted_id)

    # Notify all students about the new assignment
    now = datetime.utcnow()
    student_cursor = db.users.find({"role": "student"}, {"email": 1})
    notifications = []
    async for student in student_cursor:
        notifications.append({
            "user_email": student["email"],
            "type": "assignment_created",
            "title": "New Assignment",
            "message": f"{teacher_name or current_user['email']} posted a new assignment: '{data.get('title', 'Assignment')}'.",
            "assignment_id": assignment_id,
            "read": False,
            "created_at": now,
        })
    if notifications:
        await db.notifications.insert_many(notifications)

    return {
        "message": "Assignment created successfully",
        "assignment_id": assignment_id
    }


@router.get("/")
async def get_assignments(
    class_id: str = Query(""),
    current_user=Depends(require_role("teacher"))
):
    assignments = []
    query = {"teacher_email": current_user["email"]}
    if class_id:
        query["class_id"] = class_id

    cursor = db.assignments.find(query).sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        # Count submissions for this assignment
        sub_count = await db.submissions.count_documents(
            {"assignment_id": item["_id"]}
        )
        item["submission_count"] = sub_count
        assignments.append(item)

    # Fallback: show all assignments if none are teacher-specific (only if not filtering by class)
    if not assignments and not class_id:
        cursor = db.assignments.find().sort("_id", -1)
        async for item in cursor:
            item["_id"] = str(item["_id"])
            sub_count = await db.submissions.count_documents(
                {"assignment_id": item["_id"]}
            )
            item["submission_count"] = sub_count
            assignments.append(item)

    return assignments


@router.get("/{assignment_id}")
async def get_assignment(
    assignment_id: str,
    current_user=Depends(require_role("teacher"))
):
    assignment = await db.assignments.find_one(
        {"_id": ObjectId(assignment_id)}
    )
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    assignment["_id"] = str(assignment["_id"])

    # Get submissions for this assignment, enriched with student info
    submissions = []
    cursor = db.submissions.find(
        {"assignment_id": assignment_id}
    ).sort("submitted_at", -1)
    async for sub in cursor:
        sub["_id"] = str(sub["_id"])
        # Serialize datetime fields
        for field in ("submitted_at", "published_at", "evaluated_at"):
            val = sub.get(field)
            if val and hasattr(val, "isoformat"):
                sub[field] = val.isoformat()
        submissions.append(sub)

    assignment["submissions"] = submissions
    return assignment


@router.put("/{assignment_id}")
async def update_assignment(
    assignment_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    update_data = {}
    for key in ["title", "subject", "description", "due_date", "class_id", "total_marks"]:
        if key in data:
            update_data[key] = data[key]
    update_data["updated_at"] = datetime.utcnow()

    result = await db.assignments.update_one(
        {"_id": ObjectId(assignment_id), "teacher_email": current_user["email"]},
        {"$set": update_data}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found or not authorized")

    return {"message": "Assignment updated successfully"}


@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    current_user=Depends(require_role("teacher"))
):
    result = await db.assignments.delete_one(
        {"_id": ObjectId(assignment_id), "teacher_email": current_user["email"]}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found or not authorized")

    return {"message": "Assignment deleted successfully"}


@router.post("/{assignment_id}/feedback")
async def add_feedback(
    assignment_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    submission_id = data.get("submission_id", "")
    feedback = data.get("feedback", "")
    grade = data.get("grade", None)

    update = {
        "feedback": feedback,
        "reviewed": True,
        "reviewed_at": datetime.utcnow(),
        "reviewed_by": current_user["email"]
    }
    if grade is not None:
        update["grade"] = grade

    result = await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": update}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")

    return {"message": "Feedback added successfully"}