from fastapi import FastAPI
from app.database.mongodb import client
from app.api.user import router as user_router
from app.api.auth import router as auth_router
from app.api.student import router as student_router
from app.api.teacher import router as teacher_router
from app.api.profile import router as profile_router
from app.api.analytics import router as analytics_router
from app.api.ai import router as ai_router
from app.api.tutor import router as tutor_router
from app.api.notes import router as notes_router
from app.api.exam import router as exam_router
from app.api.assignment import router as assignment_router
from app.api.pdf import router as pdf_router
from app.api.history import router as history_router

app = FastAPI(
    title="EduVerse AI",
    version="1.0.0"
)

app.include_router(
    user_router,
    prefix="/users",
    tags=["Users"]
)
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)
app.include_router(
    student_router,
    prefix="/student",
    tags=["Student"]
)
app.include_router(
    teacher_router,
    prefix="/teacher",
    tags=["Teacher"]
)
app.include_router(
    profile_router,
    prefix="/profile",
    tags=["Profile"]
)
app.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Analytics"]
)
app.include_router(
    ai_router,
    prefix="/ai",
    tags=["AI"]
)
app.include_router(
    tutor_router,
    prefix="/ai/tutor",
    tags=["AI Tutor"]
)
app.include_router(
    notes_router,
    prefix="/ai/notes",
    tags=["AI Notes"]
)
app.include_router(
    exam_router,
    prefix="/ai/exam",
    tags=["AI Exam"]
)
app.include_router(
    assignment_router,
    prefix="/ai/assignment-check",
    tags=["Assignment Evaluation"]
)
app.include_router(
    pdf_router,
    prefix="/pdf",
    tags=["PDF Export"]
)
app.include_router(
    history_router,
    prefix="/history",
    tags=["History"]
)

@app.get("/")
async def home():
    try:
        await client.admin.command("ping")
        return {
            "message": "EduVerse AI Backend Running",
            "database": "MongoDB Connected"
        }
    except Exception as e:
        return {
            "message": "MongoDB Connection Failed",
            "error": str(e)
        }
