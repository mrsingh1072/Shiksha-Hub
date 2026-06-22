from fastapi import Depends, HTTPException
from app.dependencies.auth import get_current_user


def require_role(required_role: str):

    async def role_checker(
        current_user=Depends(get_current_user)
    ):

        if current_user.get("role") not in {required_role, "admin"}:
            raise HTTPException(
                status_code=403,
                detail="Access Denied"
            )

        return current_user

    return role_checker
