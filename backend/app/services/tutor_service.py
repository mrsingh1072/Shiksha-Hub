import json
import os
import re

import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

SYSTEM_PROMPT = """You are EduVerse AI Tutor.

Return ONLY valid JSON with this exact structure:
{
  "documentation": "Markdown study notes with headings, bullet points, numbered lists, tables, code blocks, examples, and important points.",
  "reply": "Short conversational tutor response for the chat panel."
}

Rules:
1. documentation must be detailed study material.
2. reply must be friendly and concise.
3. Use markdown in documentation.
4. Do not wrap JSON in markdown fences.
"""


def _parse_tutor_payload(raw: str):
    text = (raw or "").strip()
    if not text:
        return {
            "documentation": "No response generated.",
            "reply": "I could not generate a response. Please try again.",
        }

    if text.startswith("AI Error:"):
        return {
            "documentation": text,
            "reply": text,
        }

    try:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            parsed = json.loads(match.group(0))
            return {
                "documentation": parsed.get("documentation") or text,
                "reply": parsed.get("reply") or parsed.get("documentation") or text,
            }
    except json.JSONDecodeError:
        pass

    return {
        "documentation": text,
        "reply": text,
    }


def tutor_response(question: str, history: list | None = None):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

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

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "openai/gpt-oss-20b:free",
            "messages": messages,
        },
    )

    result = response.json()

    if "choices" in result:
        content = result["choices"][0]["message"]["content"]
        return _parse_tutor_payload(content)

    if "error" in result:
        message = result["error"].get("message", result["error"])
        return {
            "documentation": f"AI Error: {message}",
            "reply": f"AI Error: {message}",
        }

    return {
        "documentation": str(result),
        "reply": str(result),
    }
