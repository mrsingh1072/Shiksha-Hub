from app.services.ai_client import ask_ai


def generate_exam(
    subject: str,
    difficulty: str,
    questions: int
):

    prompt = f"""
You are EduVerse AI Exam Generator.

Generate ONLY valid JSON.

IMPORTANT:
- Return ONLY JSON.
- Do NOT return markdown.
- Do NOT use ```json.
- Do NOT write explanations.
- Do NOT write notes.
- Do NOT write answer key separately.
- Do NOT write any text before or after JSON.

Return exactly in this structure:

{{
  "questions": [
    {{
      "question": "Sample Question",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option A",
      "topic": "Topic Name"
    }}
  ]
}}

Subject: {subject}
Difficulty: {difficulty}
Number of Questions: {questions}

Rules:
1. Generate exactly {questions} MCQ questions.
2. Every question must have exactly 4 options.
3. Only one option should be correct.
4. Store the correct answer inside the "answer" field.
5. Include a topic field for each question.
6. Questions must be related to {subject}.
7. Difficulty level must be {difficulty}.
8. Return ONLY valid JSON.
"""

    return ask_ai(prompt)


def generate_exam_from_lesson(
    lesson_text: str,
    conversation_context: str = "",
    subject: str = "Lesson Quiz",
    questions: int = 5,
):
    prompt = f"""
You are EduVerse AI Exam Generator.

Generate ONLY valid JSON based on the lesson content below.

IMPORTANT:
- Return ONLY JSON.
- Do NOT return markdown.
- Do NOT use ```json.
- Do NOT write explanations.

Return exactly in this structure:

{{
  "subject": "{subject}",
  "questions": [
    {{
      "question": "Sample Question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "topic": "Topic Name"
    }}
  ]
}}

Rules:
1. Generate exactly {questions} MCQ questions from the lesson.
2. Every question must have exactly 4 options.
3. Include a topic field for each question.
4. Questions must test the lesson content only.
5. Subject: {subject}

Lesson:
{lesson_text}

Conversation context:
{conversation_context}
"""

    return ask_ai(prompt)