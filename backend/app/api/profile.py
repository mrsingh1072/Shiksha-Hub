import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.dependencies.auth import get_current_user
from app.schemas.profile import ProfileUpdate
from app.models.user import user_collection

router = APIRouter()

AVATAR_DIR = Path("uploads/avatars")
AVATAR_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_AVATAR_BYTES = 2 * 1024 * 1024


def _avatar_filename(email: str) -> str:
    safe = email.replace("@", "_at_").replace(".", "_")
    return f"{safe}.jpg"


@router.get("/")
async def get_profile(
    current_user=Depends(get_current_user)
):

    user = await user_collection.find_one(
        {"email": current_user["email"]}
    )

    preferences = user.get("preferences") or {
        "language": "en",
        "theme": "light",
        "notifications": {
            "assignments": True,
            "exams": True,
            "tutor": True,
            "announcements": True,
        },
    }

    profile_photo = user.get("profilePhoto", "")

    return {
    "userId": user.get("userId", ""),
    "name": user["name"],
    "email": user["email"],
    "phone": user.get("phone", ""),
    "role": user["role"],
    "studentType": user.get("studentType", ""),

    "schoolName": user.get("schoolName", ""),
    "studentClass": user.get("studentClass", ""),

    "collegeName": user.get("collegeName", ""),
    "degree": user.get("degree", ""),
    "course": user.get("course", ""),
    "yearSemester": user.get("yearSemester", ""),

    "college": user.get("college", ""),

    "branch": user.get("branch", ""),
    "semester": user.get("semester", ""),
    "division": user.get("division", ""),
    "roll_number": user.get("roll_number", ""),

    "department": user.get("department", ""),
    "subjects": user.get("subjects", []),

    "designation": user.get("designation", ""),
    "experience": user.get("experience", 0),

    "bio": user.get("bio", ""),

    "profilePhoto": profile_photo,
    "emailVerified": user.get("emailVerified", False),
    "phoneVerified": user.get("phoneVerified", False),
    "preferences": preferences,
}


@router.put("/")
async def update_profile(
    profile: ProfileUpdate,
    current_user=Depends(get_current_user)
):

    update_fields = {

    "college": profile.college,
    "phone": profile.phone,
    "studentType": profile.studentType,

    "schoolName": profile.schoolName,
    "studentClass": profile.studentClass,

    "collegeName": profile.collegeName,
    "degree": profile.degree,
    "course": profile.course,
    "yearSemester": profile.yearSemester,

    "branch": profile.branch,
    "semester": profile.semester,
    "division": profile.division,
    "roll_number": profile.roll_number,

    "department": profile.department,
    "subjects": profile.subjects,

    "designation": profile.designation,
    "experience": profile.experience,

    "bio": profile.bio
}

    if profile.name and profile.name.strip():
        update_fields["name"] = profile.name.strip()

    if profile.preferences is not None:
        update_fields["preferences"] = profile.preferences.model_dump()

    await user_collection.update_one(
        {
            "email": current_user["email"]
        },
        {
            "$set": update_fields
        }
    )

    return {
        "message": "Profile updated successfully"
    }


@router.post("/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, or WEBP images are allowed")

    content = await file.read()
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=400, detail="Image must be 2MB or smaller")

    filename = _avatar_filename(current_user["email"])
    destination = AVATAR_DIR / filename

    with open(destination, "wb") as output:
        output.write(content)

    photo_path = f"/profile/photo/{filename}"

    await user_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"profilePhoto": photo_path}},
    )

    return {
        "message": "Profile photo updated",
        "profilePhoto": photo_path,
    }


@router.delete("/photo")
async def remove_profile_photo(
    current_user=Depends(get_current_user),
):
    user = await user_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    filename = _avatar_filename(current_user["email"])
    destination = AVATAR_DIR / filename
    if destination.exists():
        destination.unlink()

    await user_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"profilePhoto": ""}},
    )

    return {"message": "Profile photo removed"}


@router.get("/photo/{filename}")
async def get_profile_photo(
    filename: str,
    current_user=Depends(get_current_user),
):
    expected = _avatar_filename(current_user["email"])
    if filename != expected:
        raise HTTPException(status_code=403, detail="Not allowed")

    destination = AVATAR_DIR / filename
    if not destination.exists():
        raise HTTPException(status_code=404, detail="Photo not found")

    return FileResponse(destination)
