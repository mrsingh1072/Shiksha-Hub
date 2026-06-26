"""
Student memory system backed by MongoDB.

Tracks learning progress, completed lessons, quiz scores, and
builds a natural-language context string the LLM can use to
personalise its teaching.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from app.database.mongodb import db

logger = logging.getLogger(__name__)

_collection = db.student_memory

_DEFAULT_MEMORY: dict = {
    "completedLessons": [],
    "weakTopics": [],
    "strongTopics": [],
    "quizScores": [],
    "learningPace": "moderate",
    "preferredLanguage": "en",
    "recentTopics": [],
    "confidenceLevel": 0.5,
    "totalLessonsCompleted": 0,
    "lastLesson": None,
}


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------


async def get_memory(email: str) -> dict:
    """Return the student memory document, creating defaults if absent."""

    doc = await _collection.find_one({"email": email})
    if doc:
        doc["_id"] = str(doc["_id"])
        # Back-fill any missing keys with defaults
        for key, default in _DEFAULT_MEMORY.items():
            doc.setdefault(key, default)
        return doc

    # No document yet – return defaults (not persisted until an update)
    return {"email": email, **_DEFAULT_MEMORY}


# ---------------------------------------------------------------------------
# Write helpers
# ---------------------------------------------------------------------------


async def update_memory(email: str, updates: dict) -> None:
    """Apply arbitrary updates to the student memory document.

    Keys whose default type is ``list`` are handled with ``$push``;
    everything else uses ``$set``.
    """

    set_fields: dict = {"updated_at": datetime.now(timezone.utc)}
    push_fields: dict = {}

    list_keys = {
        "completedLessons",
        "weakTopics",
        "strongTopics",
        "quizScores",
        "recentTopics",
    }

    for key, value in updates.items():
        if key in list_keys and not isinstance(value, list):
            # Single item → push
            push_fields[key] = value
        else:
            set_fields[key] = value

    update_ops: dict = {"$set": set_fields}
    if push_fields:
        update_ops["$push"] = {k: v for k, v in push_fields.items()}

    await _collection.update_one(
        {"email": email},
        update_ops,
        upsert=True,
    )


async def record_lesson(
    email: str,
    topic: str,
    score: float | None = None,
) -> None:
    """Record that a student completed a lesson on *topic*."""

    now = datetime.now(timezone.utc)

    # Fetch current memory to trim recentTopics
    memory = await get_memory(email)
    recent = memory.get("recentTopics", [])
    recent.append(topic)
    recent = recent[-20:]  # keep last 20

    set_fields: dict = {
        "lastLesson": topic,
        "recentTopics": recent,
        "updated_at": now,
    }

    update_ops: dict = {
        "$set": set_fields,
        "$push": {"completedLessons": topic},
        "$inc": {"totalLessonsCompleted": 1},
    }

    await _collection.update_one({"email": email}, update_ops, upsert=True)
    logger.debug("Recorded lesson '%s' for %s", topic, email)


async def record_quiz_score(
    email: str,
    topic: str,
    score: float,
    total: float,
) -> None:
    """Store a quiz result and update weak / strong topic lists."""

    now = datetime.now(timezone.utc)
    percentage = (score / total * 100) if total else 0

    quiz_entry = {
        "topic": topic,
        "score": score,
        "total": total,
        "percentage": percentage,
        "timestamp": now,
    }

    # Determine weak vs strong
    memory = await get_memory(email)
    weak = set(memory.get("weakTopics", []))
    strong = set(memory.get("strongTopics", []))

    if percentage >= 70:
        strong.add(topic)
        weak.discard(topic)
    else:
        weak.add(topic)
        strong.discard(topic)

    await _collection.update_one(
        {"email": email},
        {
            "$push": {"quizScores": quiz_entry},
            "$set": {
                "weakTopics": list(weak),
                "strongTopics": list(strong),
                "updated_at": now,
            },
        },
        upsert=True,
    )
    logger.debug(
        "Recorded quiz score for %s – %s: %.0f/%.0f (%.0f%%)",
        email,
        topic,
        score,
        total,
        percentage,
    )


# ---------------------------------------------------------------------------
# LLM context builder
# ---------------------------------------------------------------------------


def build_memory_context(memory: dict) -> str:
    """Convert a memory dict into a natural-language string for the LLM."""

    parts: list[str] = []

    total = memory.get("totalLessonsCompleted", 0)
    if total:
        parts.append(f"The student has completed {total} lesson(s).")

    recent = memory.get("recentTopics", [])
    if recent:
        parts.append(f"Recent topics: {', '.join(recent[-5:])}.")

    weak = memory.get("weakTopics", [])
    if weak:
        parts.append(f"Weak areas: {', '.join(weak)}.")

    strong = memory.get("strongTopics", [])
    if strong:
        parts.append(f"Strong areas: {', '.join(strong)}.")

    pace = memory.get("learningPace", "moderate")
    parts.append(f"Learning pace: {pace}.")

    confidence = memory.get("confidenceLevel", 0.5)
    parts.append(f"Confidence level: {confidence:.0%}.")

    last = memory.get("lastLesson")
    if last:
        parts.append(f"Last lesson: {last}.")

    return " ".join(parts) if parts else ""
