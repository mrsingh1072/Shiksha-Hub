from fastapi import APIRouter

router = APIRouter()


@router.get("/overview")
async def analytics_overview():
    return {
        "totalStudents": 0,
        "totalTeachers": 0,
        "totalAssignments": 0,
        "averageScore": 0
    }