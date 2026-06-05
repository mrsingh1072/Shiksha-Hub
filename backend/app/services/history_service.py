from app.database.mongodb import db
from datetime import datetime


async def save_history(
    user_email: str,
    history_type: str,
    question: str,
    answer: str
):

    await db.chat_history.insert_one({
        "user_email": user_email,
        "type": history_type,
        "question": question,
        "answer": answer,
        "created_at": datetime.utcnow()
    })