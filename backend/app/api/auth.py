from fastapi import APIRouter, Depends, HTTPException
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    SendVerificationRequest,
    VerifyContactRequest,
    VerifyOtpRequest,
)
from app.models.user import user_collection
from app.utils.security import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.utils.password_policy import validate_password_strength
from app.services.otp_service import create_otp_request, verify_otp_request, consume_reset_token
from app.dependencies.auth import get_current_user

import os
from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

router = APIRouter()


def _password_error_response(password: str):
    result = validate_password_strength(password)
    if not result["valid"]:
        return {
            "message": "Password does not meet security requirements",
            "requiresOtp": False,
            "passwordPolicy": result,
        }
    return None


@router.post("/login")
async def login(user: LoginRequest):

    # Admin Login
    if (
        user.identifier == ADMIN_EMAIL
        and user.password == ADMIN_PASSWORD
    ):
        token = create_access_token(
            {
                "email": ADMIN_EMAIL,
                "role": "admin"
            }
        )

        return {
            "access_token": token,
            "token_type": "bearer"
        }

    # Student / Teacher Login
    db_user = await user_collection.find_one(
        {
            "$or": [
                {"email": user.identifier},
                {"userId": user.identifier},
                {"phone": user.identifier},
            ]
        }
    )

    if not db_user:
        return {
            "message": "Invalid User"
        }

    if not verify_password(
        user.password,
        db_user["password"]
    ):
        return {
            "message": "Invalid Password"
        }

    token = create_access_token(
        {
            "email": db_user["email"],
            "role": db_user["role"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    if not payload.email and not payload.phone:
        raise HTTPException(status_code=400, detail="Email or mobile number is required")

    query = {"email": payload.email} if payload.email else {"phone": payload.phone}
    user = await user_collection.find_one(query)

    if not user:
        return {
            "message": "If an account exists, a verification code will be sent shortly.",
            "requiresOtp": False,
        }

    channel = "email" if payload.email else "mobile"
    identifier = payload.email or payload.phone

    request_id, _otp = await create_otp_request(
        identifier=identifier,
        channel=channel,
        purpose="reset_password",
        user_email=user["email"],
    )

    return {
        "message": "Verification code sent successfully.",
        "requiresOtp": True,
        "requestId": request_id,
        "channel": channel,
    }


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpRequest):
    result = await verify_otp_request(payload.requestId, payload.otp, payload.purpose)

    if not result.get("ok"):
        return {
            "message": result.get("error", "OTP verification failed"),
            "requiresOtp": True,
        }

    response = {
        "message": "OTP verified successfully.",
        "requiresOtp": False,
    }

    if payload.purpose == "reset_password" and result.get("reset_token"):
        response["resetToken"] = result["reset_token"]

    return response


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    if payload.newPassword != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    policy_error = _password_error_response(payload.newPassword)
    if policy_error:
        return policy_error

    user_email = await consume_reset_token(payload.resetToken)
    if not user_email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    await user_collection.update_one(
        {"email": user_email},
        {"$set": {"password": hash_password(payload.newPassword)}},
    )

    return {
        "message": "Password reset successfully.",
        "requiresOtp": False,
    }


@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user=Depends(get_current_user),
):
    if payload.newPassword != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    policy_error = _password_error_response(payload.newPassword)
    if policy_error:
        return policy_error

    user = await user_collection.find_one({"email": current_user["email"]})
    if not user or not verify_password(payload.currentPassword, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    await user_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"password": hash_password(payload.newPassword)}},
    )

    return {
        "message": "Password changed successfully.",
        "requiresOtp": False,
    }


@router.post("/send-verification")
async def send_verification(
    payload: SendVerificationRequest,
    current_user=Depends(get_current_user),
):
    user = await user_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.channel == "email":
        identifier = user["email"]
    else:
        identifier = user.get("phone", "")
        if not identifier:
            raise HTTPException(status_code=400, detail="Mobile number is not set on profile")

    request_id, _otp = await create_otp_request(
        identifier=identifier,
        channel=payload.channel,
        purpose=f"verify_{payload.channel}" if payload.channel == "email" else "verify_mobile",
        user_email=user["email"],
    )

    return {
        "message": "Verification code sent.",
        "requiresOtp": True,
        "requestId": request_id,
        "channel": payload.channel,
    }


@router.post("/verify-email")
async def verify_email(
    payload: VerifyContactRequest,
    current_user=Depends(get_current_user),
):
    result = await verify_otp_request(payload.requestId, payload.otp, "verify_email")

    if not result.get("ok"):
        return {
            "message": result.get("error", "OTP verification failed"),
            "requiresOtp": True,
        }

    if result.get("user_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="OTP does not match current account")

    await user_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"emailVerified": True}},
    )

    return {
        "message": "Email verified successfully.",
        "requiresOtp": False,
        "emailVerified": True,
    }


@router.post("/verify-mobile")
async def verify_mobile(
    payload: VerifyContactRequest,
    current_user=Depends(get_current_user),
):
    result = await verify_otp_request(payload.requestId, payload.otp, "verify_mobile")

    if not result.get("ok"):
        return {
            "message": result.get("error", "OTP verification failed"),
            "requiresOtp": True,
        }

    if result.get("user_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="OTP does not match current account")

    await user_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"phoneVerified": True}},
    )

    return {
        "message": "Mobile number verified successfully.",
        "requiresOtp": False,
        "phoneVerified": True,
    }
