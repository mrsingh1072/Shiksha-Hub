from fastapi import APIRouter, Depends
from app.database.mongodb import db
from app.dependencies.auth import get_current_user
from bson import ObjectId

router = APIRouter()


@router.get("/")
async def get_all_history():

    history = []

    cursor = db.chat_history.find()

    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)

    return history


@router.get("/me")
async def get_my_history(
    current_user=Depends(
        get_current_user
    )
):

    history = []

    cursor = db.chat_history.find(
        {
            "user_email":
            current_user["email"]
        }
    )

    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)

    return history


@router.delete("/")
async def delete_my_history(
    current_user=Depends(
        get_current_user
    )
):

    result = await db.chat_history.delete_many(
        {
            "user_email":
            current_user["email"]
        }
    )

    return {
        "deleted_records":
        result.deleted_count
    }
@router.get("/stats")
async def history_stats(
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

    total = (
        chat_count +
        tutor_count +
        notes_count +
        exam_count +
        assignment_count
    )

    return {
        "chatCount": chat_count,
        "tutorCount": tutor_count,
        "notesCount": notes_count,
        "examCount": exam_count,
        "assignmentCount": assignment_count,
        "totalActivities": total
    }
@router.get("/type/{history_type}")
async def get_history_by_type(
    history_type: str,
    current_user=Depends(
        get_current_user
    )
):

    history = []

    cursor = db.chat_history.find(
        {
            "user_email": current_user["email"],
            "type": history_type
        }
    )

    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)

    return history
@router.delete("/{history_id}")
async def delete_history_record(
    history_id: str,
    current_user=Depends(
        get_current_user
    )
):

    result = await db.chat_history.delete_one(
        {
            "_id": ObjectId(history_id),
            "user_email": current_user["email"]
        }
    )

    return {
        "deleted_count": result.deleted_count
    }
@router.get("/search/{keyword}")
async def search_history(
    keyword: str,
    current_user=Depends(
        get_current_user
    )
):

    history = []

    cursor = db.chat_history.find(
        {
            "user_email": current_user["email"],
            "$or": [
                {
                    "question": {
                        "$regex": keyword,
                        "$options": "i"
                    }
                },
                {
                    "answer": {
                        "$regex": keyword,
                        "$options": "i"
                    }
                }
            ]
        }
    )

    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)

    return history