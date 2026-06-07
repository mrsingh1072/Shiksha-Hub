from pydantic import BaseModel


class AssignmentCreate(
    BaseModel
):
    title: str
    subject: str
    description: str
    due_date: str