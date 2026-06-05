from pydantic import BaseModel
from datetime import datetime


class History(BaseModel):
    user_email: str
    type: str
    question: str
    answer: str
    created_at: datetime = datetime.utcnow()