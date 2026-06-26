"""
Unified async AI client for all OpenRouter API calls.

Replaces the legacy synchronous `requests.post()` implementation with
`httpx.AsyncClient` for proper async FastAPI integration.
"""

from __future__ import annotations

import logging
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-20b:free"

_TIMEOUT = httpx.Timeout(timeout=90.0)


async def chat_completion(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.7,
    max_tokens: int | None = None,
) -> str:
    """Send a chat-completion request to OpenRouter and return the content string."""

    if not OPENROUTER_API_KEY:
        logger.error("OPENROUTER_API_KEY is not set")
        return "AI Error: API key is not configured"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload: dict = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            response = await client.post(
                OPENROUTER_URL,
                headers=headers,
                json=payload,
            )

        result = response.json()

        if "choices" in result and result["choices"]:
            content = result["choices"][0]["message"]["content"]
            logger.debug("AI response received (%d chars)", len(content))
            return content

        if "error" in result:
            error_msg = result["error"]
            if isinstance(error_msg, dict):
                error_msg = error_msg.get("message", str(error_msg))
            logger.error("OpenRouter API error: %s", error_msg)
            return f"AI Error: {error_msg}"

        logger.warning("Unexpected API response structure: %s", result)
        return str(result)

    except httpx.TimeoutException:
        logger.error("OpenRouter API request timed out (90s)")
        return "AI Error: Request timed out. Please try again."
    except httpx.HTTPError as exc:
        logger.error("HTTP error during AI request: %s", exc)
        return f"AI Error: {exc}"
    except Exception as exc:
        logger.error("Unexpected error during AI request: %s", exc, exc_info=True)
        return f"AI Error: {exc}"


# ---------------------------------------------------------------------------
# Backward-compatible wrappers
# ---------------------------------------------------------------------------


async def ask_ai(prompt: str) -> str:
    """Simple prompt → response wrapper (backward-compatible)."""
    messages = [{"role": "user", "content": prompt}]
    return await chat_completion(messages)


async def generate_response(message: str) -> str:
    """Alias kept for modules that imported `generate_response`."""
    return await ask_ai(message)