from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/")
async def create_announcement(data: dict, current_user=Depends(require_role("teacher"))):
    announcement = {
        "teacher_email": current_user["email"],
        "title": data.get("title", ""),
        "content": data.get("content", ""),
        "class_id": data.get("class_id", ""),
        "type": data.get("type", "general"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.announcements.insert_one(announcement)
    return {"message": "Announcement created successfully", "announcement_id": str(result.inserted_id)}


@router.get("/")
async def get_announcements(
    class_id: str = Query(""),
    current_user=Depends(require_role("teacher"))
):
    query = {"teacher_email": current_user["email"]}
    if class_id:
        query["class_id"] = class_id

    announcements = []
    cursor = db.announcements.find(query).sort("created_at", -1)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        announcements.append(item)
    return announcements


@router.put("/{announcement_id}")
async def update_announcement(announcement_id: str, data: dict, current_user=Depends(require_role("teacher"))):
    update_data = {}
    for key in ["title", "content", "class_id", "type"]:
        if key in data:
            update_data[key] = data[key]
    update_data["updated_at"] = datetime.utcnow()
    result = await db.announcements.update_one(
        {"_id": ObjectId(announcement_id), "teacher_email": current_user["email"]},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement updated successfully"}


@router.delete("/{announcement_id}")
async def delete_announcement(announcement_id: str, current_user=Depends(require_role("teacher"))):
    result = await db.announcements.delete_one(
        {"_id": ObjectId(announcement_id), "teacher_email": current_user["email"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return {"message": "Announcement deleted successfully"}
