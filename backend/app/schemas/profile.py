from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class NotificationPreferences(BaseModel):
    assignments: bool = True
    exams: bool = True
    tutor: bool = True
    announcements: bool = True


class UserPreferences(BaseModel):
    language: str = "en"
    theme: str = "light"
    notifications: NotificationPreferences = NotificationPreferences()


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: str = ""
    studentType: str = ""

    schoolName: str = ""
    studentClass: str = ""

    collegeName: str = ""
    degree: str = ""
    course: str = ""
    yearSemester: str = ""

    college: str = ""

    branch: str = ""
    semester: str = ""
    division: str = ""
    roll_number: str = ""

    department: str = ""
    subjects: list[str] = []

    designation: str = ""
    experience: int = 0

    bio: str = ""

    preferences: Optional[UserPreferences] = None
