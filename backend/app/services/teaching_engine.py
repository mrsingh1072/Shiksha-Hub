"""
Core teaching engine – generates structured lessons via the LLM.

The engine sends a rich system prompt that instructs the model to return a
JSON object with structured lesson data, a short reply, and a voice-friendly
narration.  Robust fallback parsing ensures the endpoint never crashes even
when the model returns malformed output.
"""

from __future__ import annotations

import json
import logging
import re

from app.services.ai_client import chat_completion

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# System prompt
# ---------------------------------------------------------------------------

TEACHER_SYSTEM_PROMPT = """\
You are Shiksha Hub – a world-class AI teacher capable of teaching any subject
from primary school to university level.

Your mission is to teach concepts clearly, like an experienced and passionate
classroom teacher.  Automatically adapt depth and complexity based on the
topic.

## Response format

Return ONLY valid JSON (no markdown fences, no extra text outside the JSON).
Use this exact schema:

{
  "lesson": {
    "title": "Topic Title",
    "overview": "Brief overview of the topic",
    "learningObjectives": ["Objective 1", "Objective 2"],
    "prerequisites": ["Prerequisite 1"],
    "concepts": [
      {"heading": "Concept Name", "content": "Detailed explanation (markdown allowed)"}
    ],
    "examples": [
      {"title": "Example Title", "content": "Worked example with explanation"}
    ],
    "code": [
      {"language": "python", "title": "Demo", "code": "print('hi')", "explanation": "Prints hi"}
    ],
    "tables": [],
    "diagrams": [],
    "summary": "Key takeaways in a few sentences",
    "commonMistakes": ["Mistake 1"],
    "practiceQuestions": [
      {"question": "Question text", "hint": "Helpful hint"}
    ],
    "quiz": [
      {"type": "mcq", "question": "Q", "options": ["A","B","C","D"], "answer": "A", "explanation": "Why A"}
    ]
  },
  "reply": "A short encouraging natural language response to the student",
  "voiceText": "Natural speech-friendly narration of the lesson – NO markdown, NO code blocks, NO tables, NO special characters – just natural spoken language suitable for text-to-speech"
}

## Rules
1. Return ONLY valid JSON.  Never wrap it in markdown code fences.
2. The "concepts[].content" field may use markdown (headings, bold, code blocks, tables).
3. Explain concepts BEFORE introducing jargon.
4. Use analogies and real-world examples wherever helpful.
5. Include at least 3 practice questions with hints.
6. Include at least 2 MCQ quiz questions with explanations.
7. The "voiceText" must be plain spoken language – imagine you are reading a lesson aloud.
8. Never assume the student's knowledge level.
9. Adjust explanation depth based on topic complexity.
"""


# ---------------------------------------------------------------------------
# Lesson generation
# ---------------------------------------------------------------------------


async def generate_lesson(
    question: str,
    history: list | None = None,
    memory_context: str | None = None,
) -> dict:
    """Generate a structured lesson for *question* using the LLM.

    Returns a dict with keys: ``lesson``, ``documentation``, ``reply``,
    ``voiceText``.
    """

    messages: list[dict] = [{"role": "system", "content": TEACHER_SYSTEM_PROMPT}]

    # Inject student memory context (if available)
    if memory_context:
        messages.append({
            "role": "system",
            "content": (
                f"Student context (use this to personalise the lesson): "
                f"{memory_context}"
            ),
        })

    # Replay conversation history
    for item in history or []:
        role = item.get("role")
        if role == "user":
            messages.append({"role": "user", "content": item.get("content", "")})
        elif role == "assistant":
            messages.append({
                "role": "assistant",
                "content": item.get("reply") or item.get("content", ""),
            })

    messages.append({"role": "user", "content": question})

    raw = await chat_completion(messages)
    parsed = parse_lesson_response(raw)

    return parsed


# ---------------------------------------------------------------------------
# Response parsing
# ---------------------------------------------------------------------------


def parse_lesson_response(raw: str) -> dict:
    """Extract structured lesson data from the raw LLM output.

    Handles:
    - Clean JSON
    - JSON wrapped in markdown fences
    - Legacy ``{documentation, reply}`` format
    - Plain-text fallback
    """

    text = (raw or "").strip()

    if not text:
        return _fallback("No response generated.", "I could not generate a response. Please try again.")

    if text.startswith("AI Error:"):
        return _fallback(text, text)

    # Attempt JSON extraction
    try:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            parsed = json.loads(match.group(0))

            # New structured format
            if "lesson" in parsed:
                lesson = parsed["lesson"]
                return {
                    "lesson": lesson,
                    "documentation": lesson_to_markdown(lesson),
                    "reply": parsed.get("reply", ""),
                    "voiceText": parsed.get("voiceText", parsed.get("reply", "")),
                }

            # Legacy format: {documentation, reply}
            if "documentation" in parsed or "reply" in parsed:
                doc = parsed.get("documentation", text)
                reply = parsed.get("reply", doc)
                return {
                    "lesson": None,
                    "documentation": doc,
                    "reply": reply,
                    "voiceText": reply,
                }

            # Unknown JSON structure – use raw text as documentation
            logger.warning("Unknown JSON structure from LLM – using raw text")

    except json.JSONDecodeError:
        logger.debug("JSON decode failed – falling back to raw text")

    return _fallback(text, text)


def _fallback(documentation: str, reply: str) -> dict:
    return {
        "lesson": None,
        "documentation": documentation,
        "reply": reply,
        "voiceText": reply,
    }


# ---------------------------------------------------------------------------
# Markdown renderer
# ---------------------------------------------------------------------------


def lesson_to_markdown(lesson: dict) -> str:
    """Convert a structured lesson dict to beautiful markdown."""

    if not lesson:
        return ""

    parts: list[str] = []

    title = lesson.get("title", "Lesson")
    parts.append(f"# {title}\n")

    overview = lesson.get("overview")
    if overview:
        parts.append(f"## Overview\n\n{overview}\n")

    objectives = lesson.get("learningObjectives", [])
    if objectives:
        parts.append("## Learning Objectives\n")
        for obj in objectives:
            parts.append(f"- {obj}")
        parts.append("")

    prerequisites = lesson.get("prerequisites", [])
    if prerequisites:
        parts.append("## Prerequisites\n")
        for pre in prerequisites:
            parts.append(f"- {pre}")
        parts.append("")

    concepts = lesson.get("concepts", [])
    if concepts:
        parts.append("## Core Concepts\n")
        for concept in concepts:
            heading = concept.get("heading", "")
            content = concept.get("content", "")
            parts.append(f"### {heading}\n\n{content}\n")

    examples = lesson.get("examples", [])
    if examples:
        parts.append("## Worked Examples\n")
        for ex in examples:
            parts.append(f"### {ex.get('title', 'Example')}\n\n{ex.get('content', '')}\n")

    code_blocks = lesson.get("code", [])
    if code_blocks:
        parts.append("## Code Examples\n")
        for cb in code_blocks:
            lang = cb.get("language", "")
            code_title = cb.get("title", "")
            code = cb.get("code", "")
            explanation = cb.get("explanation", "")
            if code_title:
                parts.append(f"### {code_title}\n")
            parts.append(f"```{lang}\n{code}\n```\n")
            if explanation:
                parts.append(f"_{explanation}_\n")

    tables = lesson.get("tables", [])
    if tables:
        parts.append("## Tables\n")
        for table in tables:
            if isinstance(table, str):
                parts.append(f"{table}\n")
            elif isinstance(table, dict):
                parts.append(f"{table.get('content', str(table))}\n")

    diagrams = lesson.get("diagrams", [])
    if diagrams:
        parts.append("## Diagrams\n")
        for diagram in diagrams:
            if isinstance(diagram, str):
                parts.append(f"{diagram}\n")
            elif isinstance(diagram, dict):
                parts.append(f"{diagram.get('content', str(diagram))}\n")

    summary = lesson.get("summary")
    if summary:
        parts.append(f"## Summary\n\n{summary}\n")

    mistakes = lesson.get("commonMistakes", [])
    if mistakes:
        parts.append("## Common Mistakes\n")
        for m in mistakes:
            parts.append(f"- ⚠️ {m}")
        parts.append("")

    questions = lesson.get("practiceQuestions", [])
    if questions:
        parts.append("## Practice Questions\n")
        for i, q in enumerate(questions, 1):
            parts.append(f"**{i}.** {q.get('question', '')}")
            hint = q.get("hint")
            if hint:
                parts.append(f"   💡 *Hint: {hint}*")
            parts.append("")

    quiz = lesson.get("quiz", [])
    if quiz:
        parts.append("## Quiz\n")
        for i, item in enumerate(quiz, 1):
            parts.append(f"**Q{i}.** {item.get('question', '')}")
            options = item.get("options", [])
            for opt in options:
                parts.append(f"   - {opt}")
            parts.append("")

    return "\n".join(parts)
