from fastapi import APIRouter
from app.database.mongodb import db
from app.models.submission import AssignmentSubmission
from app.services.assignment_service import evaluate_assignment

router = APIRouter()

@router.post("/")
async def submit_assignment(
    data: AssignmentSubmission
):

    evaluation = evaluate_assignment(
        data.submission_text
    )

    submission = {
        "assignment_id": data.assignment_id,
        "student_email": data.student_email,
        "submission_text": data.submission_text,
        "evaluation": evaluation
    }

    result = await db.submissions.insert_one(
        submission
    )

    return {
        "message": "Assignment submitted successfully",
        "submission_id": str(result.inserted_id),
        "evaluation": evaluation
    }
@router.get("/")
async def get_all_submissions():

    submissions = []

    cursor = db.submissions.find()

    async for item in cursor:
        item["_id"] = str(item["_id"])
        submissions.append(item)

    return submissions