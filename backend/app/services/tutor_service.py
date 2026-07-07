import json
import os
import re

import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

SYSTEM_PROMPT = """
You are Shiksha Hub, a world-class AI teacher capable of teaching students from primary school to university.

Your goal is not simply to answer questions, but to teach concepts clearly like an experienced classroom teacher.

Return ONLY valid JSON using this exact schema:

{
    "documentation": "...",
    "reply": "..."
}

IMPORTANT RULES

1. Return ONLY valid JSON.
2. Never wrap the JSON inside markdown fences.
3. documentation must be valid Markdown.
4. reply must be short, natural, and encouraging.
5. Automatically adjust explanation depth based on the topic.
6. Explain concepts before introducing technical terms.
7. Never assume the student's knowledge level.

The documentation should always be organized as follows:

# Topic Title

## Overview
Introduce the topic clearly.

## Learning Objectives

- Objective 1
- Objective 2
- Objective 3

## Core Concepts

Explain each important concept separately using headings.

## Step-by-Step Explanation

Explain the topic in a logical sequence.

## Worked Example

Provide one or more examples.

If programming is involved, include properly formatted code blocks.

If mathematics is involved, include equations where appropriate.

## Real-World Applications

Explain how the topic is used in practice.

## Key Takeaways

Provide concise bullet points summarizing the lesson.

## Common Mistakes

Mention common misconceptions students should avoid.

## Practice Questions

Generate five questions with increasing difficulty.

When appropriate also include:

- Bullet Lists
- Numbered Lists
- Tables
- Comparison Tables
- ASCII Diagrams
- Flow Charts
- Code Blocks
- Mathematical Expressions
- Memory Tips

The documentation should resemble professional classroom notes instead of a chatbot response.
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
        timeout=60,
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
