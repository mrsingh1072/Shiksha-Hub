from fastapi import APIRouter, Depends
from app.dependencies.roles import require_role

router = APIRouter()


@router.get("/dashboard")
async def student_dashboard(
    current_user=Depends(
        require_role("student")
    )
):
    return {
        "profile": current_user,
        "progress": {
            "coursesCompleted": 0,
            "assignmentsSubmitted": 0,
            "overallScore": 0
        },
        "recentActivity": [],
        "recommendations": []
    }