"""
Learning roadmap / lesson planner.

Generates multi-week structured learning roadmaps using the LLM.
"""

from __future__ import annotations

import json
import logging
import re

from app.services.ai_client import chat_completion

logger = logging.getLogger(__name__)

_ROADMAP_SYSTEM_PROMPT = """\
You are EduVerse AI – an expert curriculum designer.

Generate a detailed, multi-week learning roadmap for the student's goal.
Return ONLY valid JSON (no markdown fences).

Use this schema:
{
  "goal": "The learning goal",
  "totalWeeks": 8,
  "weeks": [
    {
      "week": 1,
      "title": "Week title",
      "topics": ["Topic 1", "Topic 2"],
      "objectives": ["By the end of this week the student will..."]
    }
  ]
}

Guidelines:
- Start from fundamentals and progressively increase difficulty.
- Each week should build on the previous one.
- Include practical exercises and projects in later weeks.
- Be specific with topic names – avoid vague descriptions.
- Adjust the number of weeks to match the requested duration.
"""


async def generate_roadmap(
    goal: str,
    duration_weeks: int = 8,
    current_level: str = "",
) -> dict:
    """Generate a multi-week learning roadmap for *goal*."""

    user_parts = [
        f"Create a {duration_weeks}-week learning roadmap for: {goal}.",
    ]
    if current_level:
        user_parts.append(f"The student's current level: {current_level}.")

    messages = [
        {"role": "system", "content": _ROADMAP_SYSTEM_PROMPT},
        {"role": "user", "content": "\n".join(user_parts)},
    ]

    raw = await chat_completion(messages)
    return _parse_roadmap(raw, goal, duration_weeks)


def _parse_roadmap(raw: str, goal: str, duration_weeks: int) -> dict:
    """Extract roadmap dict from the raw LLM output."""

    try:
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            parsed = json.loads(match.group(0))
            return {
                "goal": parsed.get("goal", goal),
                "totalWeeks": parsed.get("totalWeeks", duration_weeks),
                "weeks": parsed.get("weeks", []),
            }
    except (json.JSONDecodeError, AttributeError):
        logger.warning("Failed to parse roadmap JSON")

    # Fallback – return the raw text as a single-week plan
    return {
        "goal": goal,
        "totalWeeks": duration_weeks,
        "weeks": [
            {
                "week": 1,
                "title": "Getting Started",
                "topics": [goal],
                "objectives": [
                    "Understand the fundamentals of the topic.",
                    raw[:500] if raw else "No roadmap generated.",
                ],
            }
        ],
    }
