from fastapi import APIRouter, Depends, HTTPException
from app.database.mongodb import db
from app.dependencies.roles import require_role
from app.services.ai_client import ask_ai
from app.services.file_parser_service import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_txt,
)
from bson import ObjectId
from datetime import datetime
import json
import os

router = APIRouter()


def _extract_file_text(file_path: str) -> str:
    """Extract text content from an uploaded file."""
    if not file_path:
        return ""

    # file_path is like "/uploads/assignments/uuid.pdf"
    # Resolve to actual path on disk
    actual_path = file_path.lstrip("/")
    if not os.path.exists(actual_path):
        return ""

    ext = os.path.splitext(actual_path)[1].lower()
    try:
        if ext == ".pdf":
            return extract_text_from_pdf(actual_path)
        elif ext in (".docx", ".doc"):
            return extract_text_from_docx(actual_path)
        elif ext == ".txt":
            return extract_text_from_txt(actual_path)
        else:
            return ""
    except Exception:
        return ""


async def _get_submission_and_verify_teacher(submission_id: str, teacher_email: str):
    """Fetch a submission and verify the teacher owns the parent assignment."""
    try:
        submission = await db.submissions.find_one({"_id": ObjectId(submission_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid submission ID")

    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    # Verify the assignment belongs to this teacher
    assignment_id = submission.get("assignment_id", "")
    try:
        assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid assignment reference")

    if not assignment:
        raise HTTPException(status_code=404, detail="Parent assignment not found")

    if assignment.get("teacher_email") != teacher_email:
        raise HTTPException(
            status_code=403,
            detail="You can only evaluate submissions for your own assignments"
        )

    return submission, assignment


@router.post("/ai/{submission_id}")
async def ai_evaluate_submission(
    submission_id: str,
    current_user=Depends(require_role("teacher"))
):
    """
    Trigger AI evaluation on a student submission.
    Results are saved as DRAFT only — never auto-published.
    """
    submission, assignment = await _get_submission_and_verify_teacher(
        submission_id, current_user["email"]
    )

    # Extract text from file or use submission_text
    file_text = _extract_file_text(submission.get("file_path", ""))
    submission_text = submission.get("submission_text", "")
    content = file_text or submission_text

    if not content.strip():
        raise HTTPException(
            status_code=400,
            detail="No content found in submission to evaluate"
        )

    # Truncate to avoid token limits
    content = content[:5000]

    total_marks = assignment.get("total_marks", 100)

    prompt = f"""You are an expert academic evaluator. Evaluate the following student submission strictly and fairly.

Assignment Title: {assignment.get("title", "")}
Assignment Description: {assignment.get("description", "")}
Total Marks: {total_marks}

Student Submission:
{content}

You MUST respond ONLY with valid JSON (no extra text). Use this exact format:
{{
    "suggested_marks": <integer out of {total_marks}>,
    "feedback": "<detailed overall feedback as a single string>",
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "improvements": ["suggestion 1", "suggestion 2"],
    "grade": "<letter grade like A, B+, C, etc.>"
}}

Be fair, constructive, and detailed."""

    ai_response = await ask_ai(prompt)

    # Parse AI response
    evaluation = None
    try:
        text = ai_response.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        evaluation = json.loads(text)
    except (json.JSONDecodeError, IndexError):
        evaluation = {
            "suggested_marks": 0,
            "feedback": ai_response,
            "strengths": [],
            "weaknesses": [],
            "improvements": [],
            "grade": "N/A",
        }

    # Save AI evaluation as DRAFT on the submission
    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "ai_evaluation": evaluation,
            "ai_suggested_marks": evaluation.get("suggested_marks", 0),
            "ai_feedback": evaluation.get("feedback", ""),
            "ai_strengths": evaluation.get("strengths", []),
            "ai_weaknesses": evaluation.get("weaknesses", []),
            "ai_improvements": evaluation.get("improvements", []),
            "ai_grade": evaluation.get("grade", "N/A"),
            "evaluation_status": "ai_evaluated",
        }}
    )

    return {
        "message": "AI evaluation completed (draft — not published)",
        "evaluation": evaluation,
    }


@router.post("/manual/{submission_id}")
async def manual_evaluate_submission(
    submission_id: str,
    data: dict,
    current_user=Depends(require_role("teacher"))
):
    """
    Teacher manually sets marks and feedback.
    This can also be used to override AI suggestions.
    """
    submission, assignment = await _get_submission_and_verify_teacher(
        submission_id, current_user["email"]
    )

    teacher_marks = data.get("teacher_marks")
    teacher_feedback = data.get("teacher_feedback", "")

    if teacher_marks is None:
        raise HTTPException(status_code=400, detail="teacher_marks is required")

    try:
        teacher_marks = float(teacher_marks)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="teacher_marks must be a number")

    total_marks = assignment.get("total_marks", 100)
    if teacher_marks < 0 or teacher_marks > total_marks:
        raise HTTPException(
            status_code=400,
            detail=f"Marks must be between 0 and {total_marks}"
        )

    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "teacher_marks": teacher_marks,
            "teacher_feedback": teacher_feedback,
            "evaluation_status": "evaluated",
            "evaluated_at": datetime.utcnow(),
            "evaluated_by": current_user["email"],
        }}
    )

    return {"message": "Manual evaluation saved successfully"}


@router.post("/publish/{submission_id}")
async def publish_marks(
    submission_id: str,
    current_user=Depends(require_role("teacher"))
):
    """
    Publish marks for a submission. Only after this call
    does the student see their marks and feedback.
    """
    submission, assignment = await _get_submission_and_verify_teacher(
        submission_id, current_user["email"]
    )

    # Must have teacher_marks set before publishing
    if submission.get("teacher_marks") is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot publish without setting marks first. Please evaluate (AI or manual) and set final marks."
        )

    now = datetime.utcnow()

    await db.submissions.update_one(
        {"_id": ObjectId(submission_id)},
        {"$set": {
            "published": True,
            "published_at": now,
            "final_marks": submission.get("teacher_marks"),
            "final_feedback": submission.get("teacher_feedback", ""),
            "evaluation_status": "published",
        }}
    )

    # Notify the student
    student_email = submission.get("student_email", "")
    if student_email:
        await db.notifications.insert_one({
            "user_email": student_email,
            "type": "marks_published",
            "title": "Marks Published",
            "message": f"Your marks for '{assignment.get('title', 'Assignment')}' have been published. Score: {submission.get('teacher_marks')}/{assignment.get('total_marks', 100)}.",
            "assignment_id": submission.get("assignment_id", ""),
            "submission_id": submission_id,
            "read": False,
            "created_at": now,
        })

    return {"message": "Marks published successfully. Student has been notified."}


@router.get("/{submission_id}")
async def get_evaluation_details(
    submission_id: str,
    current_user=Depends(require_role("teacher"))
):
    """
    Teacher retrieves full evaluation details for a submission:
    AI draft, teacher overrides, and publish status.
    """
    submission, assignment = await _get_submission_and_verify_teacher(
        submission_id, current_user["email"]
    )

    submission["_id"] = str(submission["_id"])

    # Serialize datetime fields
    for field in ("submitted_at", "published_at", "evaluated_at"):
        val = submission.get(field)
        if val and hasattr(val, "isoformat"):
            submission[field] = val.isoformat()

    submission["assignment_title"] = assignment.get("title", "")
    submission["total_marks"] = assignment.get("total_marks", 100)

    return submission
