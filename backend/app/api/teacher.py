from fastapi import APIRouter, Depends
from app.dependencies.roles import require_role

router = APIRouter()


@router.get("/dashboard")
async def teacher_dashboard(
    current_user=Depends(
        require_role("teacher")
    )
):
    return {
        "profile": current_user,
        "classes": [],
        "students": 0,
        "assignments": []
    }