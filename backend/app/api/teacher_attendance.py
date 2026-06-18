from fastapi import APIRouter, Depends, HTTPException, Query
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/")
async def mark_attendance(data: dict, current_user=Depends(require_role("teacher"))):
    attendance_doc = {
        "teacher_email": current_user["email"],
        "class_id": data.get("class_id", ""),
        "date": data.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
        "records": data.get("records", []),
        "created_at": datetime.utcnow()
    }

    # Upsert: update if same class+date exists, else insert
    existing = await db.attendance.find_one({
        "teacher_email": current_user["email"],
        "class_id": data.get("class_id", ""),
        "date": data.get("date", "")
    })

    if existing:
        await db.attendance.update_one(
            {"_id": existing["_id"]},
            {"$set": {"records": data.get("records", []), "updated_at": datetime.utcnow()}}
        )
        return {"message": "Attendance updated successfully"}
    else:
        result = await db.attendance.insert_one(attendance_doc)
        return {"message": "Attendance marked successfully", "attendance_id": str(result.inserted_id)}


@router.get("/")
async def get_attendance(
    class_id: str = Query(""),
    date: str = Query(""),
    current_user=Depends(require_role("teacher"))
):
    query = {"teacher_email": current_user["email"]}
    if class_id:
        query["class_id"] = class_id
    if date:
        query["date"] = date

    records = []
    cursor = db.attendance.find(query).sort("date", -1).limit(100)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        records.append(item)
    return records


@router.get("/report")
async def get_attendance_report(
    class_id: str = Query(""),
    current_user=Depends(require_role("teacher"))
):
    query = {"teacher_email": current_user["email"]}
    if class_id:
        query["class_id"] = class_id

    # Aggregate attendance stats per student
    student_stats = {}
    total_sessions = 0

    cursor = db.attendance.find(query)
    async for doc in cursor:
        total_sessions += 1
        for record in doc.get("records", []):
            email = record.get("student_email", "")
            status = record.get("status", "absent")
            if email not in student_stats:
                student_stats[email] = {"present": 0, "absent": 0, "late": 0, "total": 0}
            student_stats[email][status] = student_stats[email].get(status, 0) + 1
            student_stats[email]["total"] += 1

    report = []
    for email, stats in student_stats.items():
        user = await db.users.find_one({"email": email})
        total = stats["total"] or 1
        report.append({
            "student_email": email,
            "student_name": user.get("name", email) if user else email,
            "present": stats["present"],
            "absent": stats["absent"],
            "late": stats["late"],
            "total_sessions": total,
            "attendance_percentage": round((stats["present"] / total) * 100, 1)
        })

    return {
        "total_sessions": total_sessions,
        "report": report
    }
