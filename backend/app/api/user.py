from fastapi import APIRouter
from app.schemas.user import UserRegister
from app.models.user import user_collection
from app.utils.security import hash_password

router = APIRouter()

@router.post("/register")
async def register_user(user: UserRegister):

    existing_user = await user_collection.find_one(
        {"email": user.email}
    )

    if existing_user:
        return {
            "message": "Email already exists"
        }

    print(user.password)
    print(type(user.password))
    print(len(user.password))

    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role
    }

    await user_collection.insert_one(
        user_data
    )

    return {
        "message": "User registered successfully"
    }