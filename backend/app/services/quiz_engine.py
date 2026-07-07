"""
Quiz generation and evaluation engine.

Uses the unified AI client to generate quiz questions of various types
and evaluate student answers.
"""

from __future__ import annotations

import json
import logging
import re

from app.services.ai_client import chat_completion

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Quiz generation
# ---------------------------------------------------------------------------

_QUIZ_SYSTEM_PROMPT = """\
You are Shiksha Hub – an expert quiz generator for educational purposes.

Generate quiz questions based on the given topic and lesson content.
Return ONLY valid JSON (no markdown fences).

Use this schema:
{
  "questions": [
    {
      "type": "mcq",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "Why A is correct"
    }
  ]
}

Supported question types: mcq, short_answer, long_answer, coding.
- For "mcq": include "options" (exactly 4) and "answer" (the correct option text).
- For "short_answer": include "answer" (expected short answer).
- For "long_answer": include "answer" (model answer).
- For "coding": include "answer" (expected code solution) and "language" field.

Always include an "explanation" for every question.
"""


async def generate_quiz(
    topic: str,
    lesson_content: str = "",
    num_questions: int = 5,
    types: list[str] | None = None,
) -> list[dict]:
    """Generate *num_questions* quiz questions about *topic*."""

    allowed_types = types or ["mcq"]
    type_str = ", ".join(allowed_types)

    user_prompt_parts = [
        f"Generate {num_questions} quiz questions about: {topic}.",
        f"Question types to include: {type_str}.",
    ]
    if lesson_content:
        user_prompt_parts.append(
            f"Base the questions on this lesson content:\n{lesson_content[:3000]}"
        )

    messages = [
        {"role": "system", "content": _QUIZ_SYSTEM_PROMPT},
        {"role": "user", "content": "\n".join(user_prompt_parts)},
    ]

    raw = await chat_completion(messages)
    return _parse_quiz_response(raw, num_questions)


def _parse_quiz_response(raw: str, expected: int) -> list[dict]:
    """Extract list of question dicts from raw LLM output."""

    try:
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            parsed = json.loads(match.group(0))
            questions = parsed.get("questions", [])
            if isinstance(questions, list):
                return questions
    except (json.JSONDecodeError, AttributeError):
        logger.warning("Failed to parse quiz JSON – returning empty list")

    return []


# ---------------------------------------------------------------------------
# Answer evaluation
# ---------------------------------------------------------------------------

_EVAL_SYSTEM_PROMPT = """\
You are Shiksha Hub – an expert at evaluating student answers.

Evaluate the student's answer to the given question. Return ONLY valid JSON:
{
  "correct": true or false,
  "score": 0.0 to 1.0,
  "feedback": "Detailed feedback explaining what was right/wrong and the correct answer"
}
"""


async def evaluate_answer(question: dict, student_answer: str) -> dict:
    """Evaluate a student's answer.

    For MCQ questions a direct comparison is performed.  For other types
    the LLM is used for nuanced evaluation.
    """

    q_type = question.get("type", "mcq")

    # Fast path for MCQ – direct comparison
    if q_type == "mcq":
        correct_answer = (question.get("answer", "") or "").strip().lower()
        student_clean = (student_answer or "").strip().lower()
        is_correct = student_clean == correct_answer

        return {
            "correct": is_correct,
            "score": 1.0 if is_correct else 0.0,
            "feedback": (
                "Correct! " + question.get("explanation", "")
                if is_correct
                else f"Incorrect. The correct answer is: {question.get('answer', '')}. "
                     f"{question.get('explanation', '')}"
            ),
        }

    # For other types – use LLM evaluation
    user_prompt = (
        f"Question: {question.get('question', '')}\n"
        f"Expected answer: {question.get('answer', '')}\n"
        f"Student's answer: {student_answer}\n\n"
        f"Evaluate the student's answer."
    )

    messages = [
        {"role": "system", "content": _EVAL_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    raw = await chat_completion(messages)

    try:
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            result = json.loads(match.group(0))
            return {
                "correct": bool(result.get("correct", False)),
                "score": float(result.get("score", 0.0)),
                "feedback": result.get("feedback", ""),
            }
    except (json.JSONDecodeError, ValueError):
        logger.warning("Failed to parse evaluation JSON")

    # Fallback
    return {
        "correct": False,
        "score": 0.0,
        "feedback": raw or "Could not evaluate the answer. Please try again.",
    }
