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
@router.get("/available")
async def available_classes(
    current_user=Depends(require_role("student"))
):
    classes = []

    cursor = db.classes.find()

    async for cls in cursor:

        status = "available"

        # Student already joined
        if current_user["email"] in cls.get("students", []):
            status = "joined"

        else:
            request = await db.class_requests.find_one({
                "class_id": str(cls["_id"]),
                "student_email": current_user["email"]
            })

            if request:
                status = request["status"]

        classes.append({
            "_id": str(cls["_id"]),
            "class_name": cls.get("class_name"),
            "subject": cls.get("subject"),
            "semester": cls.get("semester"),
            "section": cls.get("section"),
            "description": cls.get("description"),
            "teacher_email": cls.get("teacher_email"),
            "class_code": cls.get("class_code"),
            "status": status
        })

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
@router.post("/request")
async def request_join_class(
    data: dict,
    current_user=Depends(require_role("student"))
):
    class_code = data.get("class_code", "").upper()

    cls = await db.classes.find_one({"class_code": class_code})

    if not cls:
        raise HTTPException(status_code=404, detail="Invalid class code")

    existing = await db.class_requests.find_one({
        "class_id": str(cls["_id"]),
        "student_email": current_user["email"],
        "status": {
            "$in": ["pending", "approved"]
        }
    })

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Request already exists"
        )

    request = {
        "class_id": str(cls["_id"]),
        "teacher_email": cls["teacher_email"],
        "student_email": current_user["email"],
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    await db.class_requests.insert_one(request)

    return {
        "message": "Join request sent successfully"
    }
@router.get("/{class_id}/requests")
async def get_pending_requests(
    class_id: str,
    current_user=Depends(require_role("teacher"))
):
    requests = []

    cursor = db.class_requests.find({
        "class_id": class_id,
        "teacher_email": current_user["email"],
        "status": "pending"
    })

    async for req in cursor:
        user = await db.users.find_one({
            "email": req["student_email"]
        })

        requests.append({
            "request_id": str(req["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "course": user.get("course", ""),
            "semester": user.get("yearSemester", "")
        })

    return requests
@router.post("/{class_id}/approve/{request_id}")
async def approve_request(
    class_id: str,
    request_id: str,
    current_user=Depends(require_role("teacher"))
):
    request = await db.class_requests.find_one({
        "_id": ObjectId(request_id),
        "teacher_email": current_user["email"]
    })

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    await db.classes.update_one(
        {
            "_id": ObjectId(class_id),
            "teacher_email": current_user["email"]
        },
        {
            "$addToSet": {
                "students": request["student_email"]
            }
        }
    )

    await db.class_requests.update_one(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "approved"
            }
        }
    )
    cls = await db.classes.find_one({
    "_id": ObjectId(class_id),
    "teacher_email": current_user["email"]
    })
    await db.notifications.insert_one({
        "user_email": request["student_email"],
        "title": "🎉 Class Join Request Approved",
        "message": (
            f'Congratulations! Your request to join "{cls["class_name"]}" '
            f'has been approved.\n\n'
            f'Class Code: {cls["class_code"]}\n'
            f'Use this code to join your classroom.'
        ),
        "type": "class_approval",
        "class_id": class_id,
        "class_name": cls["class_name"],
        "class_code": cls["class_code"],
        "teacher_email": current_user["email"],
        "read": False,
        "created_at": datetime.utcnow()
    })
    return {
        "message": "Student approved successfully"
    }
@router.post("/{class_id}/reject/{request_id}")
async def reject_request(
    class_id: str,
    request_id: str,
    current_user=Depends(require_role("teacher"))
):
    request = await db.class_requests.find_one({
        "_id": ObjectId(request_id),
        "teacher_email": current_user["email"]
    })

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )

    await db.class_requests.update_one(
        {
            "_id": ObjectId(request_id),
            "teacher_email": current_user["email"]
        },
        {
            "$set": {
                "status": "rejected"
            }
        }
    )

    cls = await db.classes.find_one({
        "_id": ObjectId(class_id),
        "teacher_email": current_user["email"]
    })

    await db.notifications.insert_one({
        "user_email": request["student_email"],
        "title": "Class Join Request Rejected",
        "message": f'Your request to join "{cls["class_name"]}" has been rejected.',
        "type": "class_rejected",
        "class_id": class_id,
        "teacher_email": current_user["email"],
        "read": False,
        "created_at": datetime.utcnow()
    })

    return {
        "message": "Request rejected"
    }
