from fastapi import APIRouter, Depends, HTTPException
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
    assignment = {
        "teacher_email": current_user["email"],
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

    return {
        "message": "Assignment created successfully",
        "assignment_id": str(result.inserted_id)
    }


@router.get("/")
async def get_assignments(
    current_user=Depends(require_role("teacher"))
):
    assignments = []
    cursor = db.assignments.find(
        {"teacher_email": current_user["email"]}
    ).sort("created_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        # Count submissions for this assignment
        sub_count = await db.submissions.count_documents(
            {"assignment_id": item["_id"]}
        )
        item["submission_count"] = sub_count
        assignments.append(item)

    # Fallback: show all assignments if none are teacher-specific
    if not assignments:
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

    # Get submissions for this assignment
    submissions = []
    cursor = db.submissions.find(
        {"assignment_id": assignment_id}
    )
    async for sub in cursor:
        sub["_id"] = str(sub["_id"])
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