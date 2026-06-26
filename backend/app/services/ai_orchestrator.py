"""
Central AI request dispatcher.

All high-level AI operations flow through this orchestrator which
co-ordinates the teaching engine, quiz engine, lesson planner,
student memory and speech service.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from uuid import uuid4

from app.services import (
    teaching_engine,
    quiz_engine,
    lesson_planner,
    student_memory,
    speech_service,
)

logger = logging.getLogger(__name__)

UPLOADS_DIR = Path("uploads") / "avatar"


# ---------------------------------------------------------------------------
# Teaching
# ---------------------------------------------------------------------------


async def handle_teaching_request(
    question: str,
    email: str,
    conversation_id: str | None = None,
    history: list | None = None,
) -> dict:
    """Generate a structured lesson, record it in student memory, and return."""

    memory_context = ""
    if email:
        try:
            memory = await student_memory.get_memory(email)
            memory_context = student_memory.build_memory_context(memory)
        except Exception as exc:
            logger.warning("Could not load student memory: %s", exc)

    result = await teaching_engine.generate_lesson(
        question=question,
        history=history,
        memory_context=memory_context,
    )

    # Record the lesson asynchronously (best-effort)
    if email:
        try:
            topic = question[:120]
            if result.get("lesson") and result["lesson"].get("title"):
                topic = result["lesson"]["title"]
            await student_memory.record_lesson(email, topic)
        except Exception as exc:
            logger.warning("Failed to record lesson in memory: %s", exc)

    result["conversation_id"] = conversation_id
    return result


# ---------------------------------------------------------------------------
# Quiz
# ---------------------------------------------------------------------------


async def handle_quiz_request(
    topic: str,
    lesson_content: str = "",
    email: str = "",
    num_questions: int = 5,
) -> dict:
    """Generate quiz questions for *topic*."""

    questions = await quiz_engine.generate_quiz(
        topic=topic,
        lesson_content=lesson_content,
        num_questions=num_questions,
    )

    return {"topic": topic, "questions": questions}


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------


async def handle_evaluation_request(
    question: dict,
    student_answer: str,
    email: str = "",
) -> dict:
    """Evaluate a student's answer and optionally record the score."""

    evaluation = await quiz_engine.evaluate_answer(question, student_answer)

    if email and question.get("question"):
        try:
            topic = question.get("topic", question.get("question", "")[:80])
            score = evaluation.get("score", 0.0)
            await student_memory.record_quiz_score(email, topic, score, 1.0)
        except Exception as exc:
            logger.warning("Failed to record quiz score: %s", exc)

    return evaluation


# ---------------------------------------------------------------------------
# Roadmap
# ---------------------------------------------------------------------------


async def handle_roadmap_request(
    goal: str,
    duration_weeks: int = 8,
    email: str = "",
) -> dict:
    """Generate a learning roadmap."""

    current_level = ""
    if email:
        try:
            memory = await student_memory.get_memory(email)
            completed = memory.get("totalLessonsCompleted", 0)
            strong = memory.get("strongTopics", [])
            if completed or strong:
                current_level = (
                    f"Completed {completed} lessons. "
                    f"Strong in: {', '.join(strong[:5]) if strong else 'N/A'}."
                )
        except Exception as exc:
            logger.warning("Could not load student memory for roadmap: %s", exc)

    roadmap = await lesson_planner.generate_roadmap(
        goal=goal,
        duration_weeks=duration_weeks,
        current_level=current_level,
    )

    return roadmap


# ---------------------------------------------------------------------------
# Voice
# ---------------------------------------------------------------------------


async def handle_voice_request(
    text: str,
    email: str = "",
) -> dict:
    """Generate TTS audio and return the file path."""

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    speech_service.cleanup_old_audio(str(UPLOADS_DIR))

    filename = f"voice_{uuid4().hex}.mp3"
    output_path = UPLOADS_DIR / filename

    await speech_service.generate_speech(text, str(output_path))

    return {"file": filename, "path": str(output_path)}
