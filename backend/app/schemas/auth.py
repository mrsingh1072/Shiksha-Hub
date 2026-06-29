import re
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class LoginRequest(BaseModel):
    identifier: str
    password: str
    role: Literal["student", "teacher", "admin"]


class ForgotPasswordRequest(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: Optional[str]):
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            return None
        if not re.match(r"^\+?[0-9]{10,15}$", cleaned):
            raise ValueError("Invalid mobile number")
        return cleaned


class VerifyOtpRequest(BaseModel):
    requestId: str = Field(..., min_length=8)
    otp: str = Field(..., min_length=6, max_length=6)
    purpose: Literal["reset_password", "verify_email", "verify_mobile"] = "reset_password"

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str):
        if not value.isdigit():
            raise ValueError("OTP must contain digits only")
        return value


class ResetPasswordRequest(BaseModel):
    resetToken: str = Field(..., min_length=16)
    newPassword: str = Field(..., min_length=8)
    confirmPassword: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    currentPassword: str = Field(..., min_length=1)
    newPassword: str = Field(..., min_length=8)
    confirmPassword: str = Field(..., min_length=8)


class SendVerificationRequest(BaseModel):
    channel: Literal["email", "mobile"]


class VerifyContactRequest(BaseModel):
    requestId: str = Field(..., min_length=8)
    otp: str = Field(..., min_length=6, max_length=6)

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, value: str):
        if not value.isdigit():
            raise ValueError("OTP must contain digits only")
        return value
