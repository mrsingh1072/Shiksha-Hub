from fastapi import Depends, HTTPException
from app.dependencies.auth import get_current_user
from app.database.mongodb import db


def require_role(required_role: str):

    async def role_checker(
        current_user=Depends(get_current_user)
    ):

        role = current_user.get("role")
        if role not in {required_role, "admin"}:
            raise HTTPException(
                status_code=403,
                detail="Access Denied"
            )

        if required_role == "teacher" and role == "teacher":
            teacher = await db.users.find_one(
                {"email": current_user["email"], "role": "teacher"},
                {"status": 1},
            )
            if not teacher:
                raise HTTPException(status_code=403, detail="Teacher account not found")

            status = teacher.get("status")
            if status == "pending":
                raise HTTPException(
                    status_code=403,
                    detail="Your account is under admin review. You will receive an email once approved.",
                )
            if status == "rejected":
                raise HTTPException(
                    status_code=403,
                    detail="Your application was rejected. Contact administration.",
                )
            if status not in {None, "approved", "active"}:
                raise HTTPException(status_code=403, detail="Teacher account access is disabled")

        return current_user

    return role_checker
