"""
Speech generation service.

Cleans text of markdown / code artefacts, generates TTS audio via
edge_tts, and provides a helper for cleaning up stale audio files.
"""

from __future__ import annotations

import logging
import os
import re
import time

import edge_tts

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Text cleaning
# ---------------------------------------------------------------------------


def clean_text_for_speech(text: str) -> str:
    """Strip markdown, code blocks, tables, URLs and return plain speech text."""

    if not text:
        return ""

    cleaned = text

    # Remove code blocks (``` ... ```)
    cleaned = re.sub(r"```[\s\S]*?```", "", cleaned)

    # Remove inline code (`...`)
    cleaned = re.sub(r"`[^`]*`", "", cleaned)

    # Remove URLs
    cleaned = re.sub(r"https?://\S+", "", cleaned)

    # Remove markdown images ![alt](url)
    cleaned = re.sub(r"!\[.*?\]\(.*?\)", "", cleaned)

    # Remove markdown links but keep text: [text](url) → text
    cleaned = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", cleaned)

    # Remove table formatting (lines with pipes)
    cleaned = re.sub(r"^\|.*\|$", "", cleaned, flags=re.MULTILINE)
    # Remove table separator lines
    cleaned = re.sub(r"^[\s|:-]+$", "", cleaned, flags=re.MULTILINE)

    # Remove heading markers
    cleaned = re.sub(r"^#{1,6}\s*", "", cleaned, flags=re.MULTILINE)

    # Remove bold / italic markers
    cleaned = re.sub(r"\*{1,3}([^*]*)\*{1,3}", r"\1", cleaned)
    cleaned = re.sub(r"_{1,3}([^_]*)_{1,3}", r"\1", cleaned)

    # Remove blockquote markers
    cleaned = re.sub(r"^>\s?", "", cleaned, flags=re.MULTILINE)

    # Remove horizontal rules
    cleaned = re.sub(r"^[-*_]{3,}$", "", cleaned, flags=re.MULTILINE)

    # Remove list markers (unordered and ordered)
    cleaned = re.sub(r"^\s*[-*+]\s+", "", cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r"^\s*\d+\.\s+", "", cleaned, flags=re.MULTILINE)

    # Remove remaining pipe characters
    cleaned = cleaned.replace("|", " ")

    # Collapse whitespace
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    cleaned = cleaned.strip()

    # Limit length for TTS
    if len(cleaned) > 3000:
        cleaned = cleaned[:3000].rsplit(" ", 1)[0]

    return cleaned


# ---------------------------------------------------------------------------
# TTS generation
# ---------------------------------------------------------------------------


async def generate_speech(
    text: str,
    output_path: str,
    voice: str = "en-US-AriaNeural",
) -> None:
    """Clean *text*, generate TTS audio and save to *output_path*."""

    clean = clean_text_for_speech(text)
    if not clean:
        logger.warning("No speakable text after cleaning – skipping TTS")
        return

    try:
        communicate = edge_tts.Communicate(clean, voice)
        await communicate.save(output_path)
        logger.info("TTS audio saved to %s (%d chars)", output_path, len(clean))
    except Exception as exc:
        logger.error("TTS generation failed: %s", exc, exc_info=True)
        raise


# ---------------------------------------------------------------------------
# Cleanup helper
# ---------------------------------------------------------------------------


def cleanup_old_audio(directory: str, max_age_seconds: int = 3600) -> int:
    """Delete audio files older than *max_age_seconds*. Returns count deleted."""

    deleted = 0
    now = time.time()

    if not os.path.isdir(directory):
        return 0

    for filename in os.listdir(directory):
        if not filename.endswith((".mp3", ".wav", ".ogg")):
            continue
        filepath = os.path.join(directory, filename)
        try:
            if now - os.path.getmtime(filepath) > max_age_seconds:
                os.remove(filepath)
                deleted += 1
        except OSError as exc:
            logger.warning("Failed to remove %s: %s", filepath, exc)

    if deleted:
        logger.info("Cleaned up %d old audio file(s) from %s", deleted, directory)

    return deleted
