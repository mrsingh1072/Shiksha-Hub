from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    college: str
    department: str
    semester: str
    bio: str