from fastapi import APIRouter
from app.database.mongodb import db
from app.models.assignment import AssignmentCreate

router = APIRouter()


@router.post("/")
async def create_assignment(
    data: AssignmentCreate
):

    assignment = {
        "title": data.title,
        "subject": data.subject,
        "description": data.description,
        "due_date": data.due_date
    }

    result = await db.assignments.insert_one(
        assignment
    )

    return {
        "message":
        "Assignment created successfully",
        "assignment_id":
        str(result.inserted_id)
    }
@router.get("/")
async def get_assignments():

    assignments = []

    cursor = db.assignments.find()

    async for item in cursor:
        item["_id"] = str(item["_id"])
        assignments.append(item)

    return assignments