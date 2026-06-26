"""
OpenRouter service – backward-compatible wrapper.

This module now delegates to the unified async ai_client.
Kept for backward compatibility with modules that import from here.
"""

from __future__ import annotations

from app.services.ai_client import generate_response  # noqa: F401

__all__ = ["generate_response"]