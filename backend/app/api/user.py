from fastapi import APIRouter, Depends
from app.schemas.user import UserRegister
from app.models.user import user_collection
from app.utils.security import hash_password
from app.dependencies.auth import get_current_user
from app.utils.id_generator import get_next_sequence

router = APIRouter()


@router.post("/register")
async def register_user(user: UserRegister):

    existing_user = await user_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already exists"
        }
    
    user_id = None

    if user.role == "teacher":

        seq = await get_next_sequence("teacher")
        user_id = f"TTT{str(seq).zfill(4)}"

    elif user.studentType == "school":

        seq = await get_next_sequence("school")
        user_id = f"TTS{str(seq).zfill(4)}"

    elif user.studentType == "college":

        seq = await get_next_sequence("college")
        user_id = f"TTC{str(seq).zfill(4)}"

    user_data = {
        "userId": user_id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "password": hash_password(user.password),
        "role": user.role,

        # Student Type
        "studentType": user.studentType,

        # School Information
        "schoolName": user.schoolName,
        "studentClass": user.studentClass,

        # College Information
        "collegeName": user.collegeName,
        "degree": user.degree,
        "course": user.course,
        "yearSemester": user.yearSemester,

        # Teacher Information
        "subject": user.subject,
        "qualification": user.qualification,
        "experience": user.experience,
    }

    await user_collection.insert_one(user_data)

    return {
    "success": True,
    "message": "User registered successfully",
    "user_id": user_id,
    "email": user.email
}


@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user)
):
    return current_user