from fastapi import APIRouter
from app.database.mongodb import db

router = APIRouter()


@router.get("/")
async def get_history():

    history = []

    cursor = db.chat_history.find()

    async for item in cursor:

        item["_id"] = str(item["_id"])

        history.append(item)

    return history