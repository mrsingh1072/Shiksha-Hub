from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.services.exam_service import generate_exam, generate_exam_from_lesson
from app.services.history_service import save_history
from app.dependencies.auth import get_current_user

router = APIRouter()


class ExamRequest(BaseModel):
    subject: str
    difficulty: str
    questions: int


class LessonExamRequest(BaseModel):
    lesson_text: str
    conversation_context: str = ""
    subject: str = "Lesson Quiz"
    questions: int = 5


class WrongAnswer(BaseModel):
    question: str
    selected: str
    correct: str
    topic: str = ""


class ExamResultRequest(BaseModel):
    subject: str
    score: int
    total: int
    weak_topics: list[str] = []
    wrong_answers: list[WrongAnswer] = []


@router.post("/")
async def exam(
    data: ExamRequest,
    current_user=Depends(
        get_current_user
    )
):

    paper = generate_exam(
        data.subject,
        data.difficulty,
        data.questions
    )

    return {
        "exam": paper
    }


@router.post("/from-lesson")
async def exam_from_lesson(
    data: LessonExamRequest,
    current_user=Depends(get_current_user),
):
    paper = generate_exam_from_lesson(
        data.lesson_text,
        data.conversation_context,
        data.subject,
        data.questions,
    )

    return {
        "exam": paper,
        "subject": data.subject,
    }


@router.post("/submit")
async def submit_exam(
    data: ExamResultRequest,
    current_user=Depends(
        get_current_user
    )
):

    percentage = round((data.score / data.total) * 100) if data.total else 0
    passed = percentage >= 40
    status = "Passed" if passed else "Failed"

    weak_topics = list(dict.fromkeys(
        topic.strip()
        for topic in data.weak_topics
        if topic and topic.strip()
    ))

    await save_history(
        user_email=current_user["email"],
        history_type="exam",
        question=f"Exam Attempt - {data.subject}",
        answer=f"Score: {data.score}/{data.total} ({percentage}%) - {status}",
        metadata={
            "title": f"Exam Attempt - {data.subject}",
            "subject": data.subject,
            "score": data.score,
            "total": data.total,
            "percentage": percentage,
            "passed": passed,
            "status": status,
            "weak_topics": weak_topics,
            "wrong_answers": [item.model_dump() for item in data.wrong_answers],
        }
    )

    return {
        "message": "Exam submitted successfully",
        "percentage": percentage,
        "status": status,
        "weak_topics": weak_topics,
    }
