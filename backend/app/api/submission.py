from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.database.mongodb import db
from app.dependencies.roles import require_role
from bson import ObjectId
from datetime import datetime
import os
import uuid
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads/assignments"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".txt"}


@router.post("/submit")
async def submit_assignment(
    assignment_id: str = Form(...),
    submission_text: str = Form(""),
    file: UploadFile = File(None),
    current_user=Depends(require_role("student"))
):
    """Student submits an assignment with optional file upload."""

    # Validate assignment exists
    try:
        assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check for duplicate submission
    existing = await db.submissions.find_one({
        "assignment_id": assignment_id,
        "student_email": current_user["email"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted this assignment")

    # Handle file upload
    file_path = ""
    original_filename = ""
    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type {ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_path = f"/uploads/assignments/{filename}"
        original_filename = file.filename

    if not file_path and not submission_text.strip():
        raise HTTPException(status_code=400, detail="Please upload a file or provide submission text")

    # Look up student name
    student_user = await db.users.find_one({"email": current_user["email"]})
    student_name = student_user.get("name", "") if student_user else current_user.get("name", "")
    student_id = student_user.get("userId", "") if student_user else ""

    submission = {
        "assignment_id": assignment_id,
        "student_email": current_user["email"],
        "student_name": student_name,
        "student_id": student_id,
        "file_path": file_path,
        "original_filename": original_filename,
        "submission_text": submission_text,
        "submitted_at": datetime.utcnow(),
        "status": "submitted",
        "evaluation_status": "pending",
        "ai_evaluation": None,
        "ai_suggested_marks": None,
        "ai_feedback": None,
        "ai_strengths": None,
        "ai_weaknesses": None,
        "ai_improvements": None,
        "teacher_marks": None,
        "teacher_feedback": None,
        "final_marks": None,
        "final_feedback": None,
        "published": False,
        "published_at": None,
    }

    result = await db.submissions.insert_one(submission)
    submission["_id"] = str(result.inserted_id)

    # Notify the teacher
    teacher_email = assignment.get("teacher_email", "")
    if teacher_email:
        await db.notifications.insert_one({
            "user_email": teacher_email,
            "type": "submission_received",
            "title": "New Submission Received",
            "message": f"{student_name or current_user['email']} submitted '{assignment.get('title', 'Assignment')}'.",
            "assignment_id": assignment_id,
            "submission_id": str(result.inserted_id),
            "read": False,
            "created_at": datetime.utcnow(),
        })

    return {
        "message": "Assignment submitted successfully",
        "submission_id": str(result.inserted_id),
    }


@router.get("/")
async def get_my_submissions(current_user=Depends(require_role("student"))):
    """Student retrieves only their own submissions."""
    submissions = []
    cursor = db.submissions.find(
        {"student_email": current_user["email"]}
    ).sort("submitted_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        # Convert datetime fields to ISO strings for JSON serialization
        if item.get("submitted_at"):
            item["submitted_at"] = item["submitted_at"].isoformat() if hasattr(item["submitted_at"], "isoformat") else str(item["submitted_at"])
        if item.get("published_at"):
            item["published_at"] = item["published_at"].isoformat() if hasattr(item["published_at"], "isoformat") else str(item["published_at"])
        submissions.append(item)

    return submissions


@router.get("/assignment/{assignment_id}")
async def get_assignment_submissions(
    assignment_id: str,
    current_user=Depends(require_role("teacher"))
):
    """Teacher retrieves all submissions for a specific assignment."""

    # Verify the assignment belongs to this teacher
    try:
        assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment ID")

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    if assignment.get("teacher_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="You can only view submissions for your own assignments")

    submissions = []
    cursor = db.submissions.find(
        {"assignment_id": assignment_id}
    ).sort("submitted_at", -1)

    async for item in cursor:
        item["_id"] = str(item["_id"])
        if item.get("submitted_at"):
            item["submitted_at"] = item["submitted_at"].isoformat() if hasattr(item["submitted_at"], "isoformat") else str(item["submitted_at"])
        if item.get("published_at"):
            item["published_at"] = item["published_at"].isoformat() if hasattr(item["published_at"], "isoformat") else str(item["published_at"])
        submissions.append(item)

    return submissions