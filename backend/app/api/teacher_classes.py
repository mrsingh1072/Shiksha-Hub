from fastapi import APIRouter, Depends, HTTPException
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime
import random
import string

router = APIRouter()


def generate_class_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@router.post("/")
async def create_class(data: dict, current_user=Depends(require_role("teacher"))):
    class_code = generate_class_code()
    class_doc = {
        "teacher_email": current_user["email"],
        "class_name": data.get("class_name", ""),
        "subject": data.get("subject", ""),
        "semester": data.get("semester", ""),
        "section": data.get("section", ""),
        "description": data.get("description", ""),
        "class_code": class_code,
        "join_link": f"/join/{class_code}",
        "students": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.classes.insert_one(class_doc)
    return {
        "message": "Class created successfully",
        "class_id": str(result.inserted_id),
        "class_code": class_code,
        "join_link": f"/join/{class_code}"
    }


@router.get("/")
async def get_classes(current_user=Depends(require_role("teacher"))):
    classes = []
    cursor = db.classes.find({"teacher_email": current_user["email"]}).sort("created_at", -1)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        item["student_count"] = len(item.get("students", []))
        classes.append(item)
    return classes


@router.get("/{class_id}")
async def get_class(class_id: str, current_user=Depends(require_role("teacher"))):
    cls = await db.classes.find_one({"_id": ObjectId(class_id), "teacher_email": current_user["email"]})
    if not cls:
        raise HTTPException(status_code=404, detail="Class not found")
    cls["_id"] = str(cls["_id"])
    student_details = []
    for email in cls.get("students", []):
        student = await db.users.find_one({"email": email})
        if student:
            student_details.append({
                "name": student.get("name", ""),
                "email": student.get("email", ""),
                "course": student.get("course", ""),
                "semester": student.get("yearSemester", "")
            })
    cls["student_details"] = student_details
    return cls


@router.put("/{class_id}")
async def update_class(class_id: str, data: dict, current_user=Depends(require_role("teacher"))):
    update_data = {k: v for k, v in data.items() if k in ["class_name", "subject", "semester", "section", "description"]}
    update_data["updated_at"] = datetime.utcnow()
    result = await db.classes.update_one(
        {"_id": ObjectId(class_id), "teacher_email": current_user["email"]},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class updated successfully"}


@router.delete("/{class_id}")
async def delete_class(class_id: str, current_user=Depends(require_role("teacher"))):
    result = await db.classes.delete_one({"_id": ObjectId(class_id), "teacher_email": current_user["email"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"message": "Class deleted successfully"}


@router.post("/join")
async def join_class(data: dict):
    cls = await db.classes.find_one({"class_code": data.get("class_code", "")})
    if not cls:
        raise HTTPException(status_code=404, detail="Invalid class code")
    student_email = data.get("student_email", "")
    if student_email in cls.get("students", []):
        return {"message": "Already joined this class"}
    await db.classes.update_one(
        {"_id": cls["_id"]},
        {"$addToSet": {"students": student_email}}
    )
    return {"message": "Joined class successfully", "class_name": cls["class_name"]}
