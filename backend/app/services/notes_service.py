import requests
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv(
    "OPENROUTER_API_KEY"
)

def generate_notes(topic: str):

    prompt = f"""
You are Shiksha Hub Notes Generator.

Create well-structured study notes on:

{topic}

Format:

1. Definition
2. Key Concepts
3. Advantages
4. Disadvantages
5. Important Exam Points
6. Short Summary

Use simple student-friendly language.
"""

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "openai/gpt-oss-20b:free",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
    )

    result = response.json()

    if "choices" in result:
        return result["choices"][0]["message"]["content"]

    return f"Sample Notes Generated For {topic}"