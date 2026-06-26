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
from app.api.assignment_upload import router as assignment_upload_router
from app.api.avatar import router as avatar_router
from app.api.teacher_assignment import (
    router as teacher_assignment_router
)
from app.api.submission import router as submission_router
from app.api.teacher_classes import router as teacher_classes_router
from app.api.teacher_students import router as teacher_students_router
from app.api.teacher_exams import router as teacher_exams_router
from app.api.teacher_question_bank import router as teacher_qb_router
from app.api.teacher_attendance import router as teacher_attendance_router
from app.api.teacher_announcements import router as teacher_announcements_router
from app.api.teacher_resources import router as teacher_resources_router
from app.api.teacher_ai import router as teacher_ai_router
from app.api.admin import router as admin_router
from app.api.voice_learning import router as voice_learning_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EduVerse AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
app.include_router(
    assignment_upload_router,
    prefix="/assignment-upload",
    tags=["Assignment Upload"]
)
app.include_router(
    avatar_router,
    prefix="/avatar",
    tags=["AI Avatar Teacher"]
)
app.include_router(
    teacher_assignment_router,
    prefix="/teacher/assignments",
    tags=["Teacher Assignments"]
)
app.include_router(
    submission_router,
    prefix="/submissions",
    tags=["Submissions"]
)

# ===== NEW TEACHER MODULE ROUTERS =====
app.include_router(
    teacher_classes_router,
    prefix="/teacher/classes",
    tags=["Teacher Classes"]
)
app.include_router(
    teacher_students_router,
    prefix="/teacher/students",
    tags=["Teacher Students"]
)
app.include_router(
    teacher_exams_router,
    prefix="/teacher/exams",
    tags=["Teacher Exams"]
)
app.include_router(
    teacher_qb_router,
    prefix="/teacher/question-bank",
    tags=["Teacher Question Bank"]
)
app.include_router(
    teacher_attendance_router,
    prefix="/teacher/attendance",
    tags=["Teacher Attendance"]
)
app.include_router(
    teacher_announcements_router,
    prefix="/teacher/announcements",
    tags=["Teacher Announcements"]
)
app.include_router(
    teacher_resources_router,
    prefix="/teacher/resources",
    tags=["Teacher Resources"]
)
app.include_router(
    teacher_ai_router,
    prefix="/teacher/ai",
    tags=["Teacher AI Assistant"]
)
app.include_router(
    admin_router,
    prefix="/admin",
    tags=["Admin"]
)
app.include_router(
    voice_learning_router,
    prefix="/voice-learning",
    tags=["Voice Learning"]
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

