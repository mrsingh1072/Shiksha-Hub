from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from app.dependencies.roles import require_role
from app.database.mongodb import db
from bson import ObjectId
from datetime import datetime
import os
import uuid

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "resources")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {
    "application/pdf": "PDF",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "image/png": "PNG",
    "image/jpeg": "JPG",
    "image/jpg": "JPG",
}


@router.post("/")
async def upload_resource(
    file: UploadFile = File(...),
    title: str = Form(""),
    class_id: str = Form(""),
    description: str = Form(""),
    current_user=Depends(require_role("teacher"))
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Accepted: {', '.join(ALLOWED_TYPES.values())}"
        )

    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    resource_doc = {
        "teacher_email": current_user["email"],
        "title": title or file.filename,
        "class_id": class_id,
        "description": description,
        "file_name": file.filename,
        "stored_name": unique_name,
        "file_type": ALLOWED_TYPES.get(file.content_type, "OTHER"),
        "file_size": len(content),
        "content_type": file.content_type,
        "created_at": datetime.utcnow()
    }
    result = await db.resources.insert_one(resource_doc)
    return {"message": "Resource uploaded successfully", "resource_id": str(result.inserted_id)}


@router.get("/")
async def get_resources(
    class_id: str = Query(""),
    current_user=Depends(require_role("teacher"))
):
    query = {"teacher_email": current_user["email"]}
    if class_id:
        query["class_id"] = class_id

    resources = []
    cursor = db.resources.find(query).sort("created_at", -1)
    async for item in cursor:
        item["_id"] = str(item["_id"])
        resources.append(item)
    return resources


@router.delete("/{resource_id}")
async def delete_resource(resource_id: str, current_user=Depends(require_role("teacher"))):
    resource = await db.resources.find_one(
        {"_id": ObjectId(resource_id), "teacher_email": current_user["email"]}
    )
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    # Delete file from disk
    file_path = os.path.join(UPLOAD_DIR, resource.get("stored_name", ""))
    if os.path.exists(file_path):
        os.remove(file_path)

    await db.resources.delete_one({"_id": ObjectId(resource_id)})
    return {"message": "Resource deleted successfully"}


@router.get("/file/{filename}")
async def serve_resource(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
