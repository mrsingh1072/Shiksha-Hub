import hashlib
import secrets
from datetime import datetime, timedelta

from app.database.mongodb import db

OTP_EXPIRY_MINUTES = 10
MAX_OTP_ATTEMPTS = 5


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def generate_otp_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


async def create_otp_request(
    *,
    identifier: str,
    channel: str,
    purpose: str,
    user_email: str,
):
    otp = generate_otp_code()
    request_id = secrets.token_urlsafe(16)
    now = datetime.utcnow()

    document = {
        "request_id": request_id,
        "identifier": identifier,
        "channel": channel,
        "purpose": purpose,
        "user_email": user_email,
        "otp_hash": _hash_otp(otp),
        "attempts": 0,
        "verified": False,
        "expires_at": now + timedelta(minutes=OTP_EXPIRY_MINUTES),
        "created_at": now,
    }

    await db.otp_requests.insert_one(document)

    # Dev-friendly delivery hook (replace with email/SMS provider in production)
    print(f"[EduVerse OTP] purpose={purpose} channel={channel} identifier={identifier} otp={otp}")

    return request_id, otp


async def verify_otp_request(request_id: str, otp: str, purpose: str):
    record = await db.otp_requests.find_one({
        "request_id": request_id,
        "purpose": purpose,
    })

    if not record:
        return {"ok": False, "error": "Invalid or expired OTP request"}

    if record.get("verified"):
        return {"ok": False, "error": "OTP already used"}

    if datetime.utcnow() > record["expires_at"]:
        return {"ok": False, "error": "OTP expired"}

    if record.get("attempts", 0) >= MAX_OTP_ATTEMPTS:
        return {"ok": False, "error": "Too many invalid attempts"}

    if _hash_otp(otp) != record["otp_hash"]:
        await db.otp_requests.update_one(
            {"request_id": request_id},
            {"$inc": {"attempts": 1}},
        )
        return {"ok": False, "error": "Invalid OTP"}

    reset_token = None
    update_fields = {"verified": True}

    if purpose == "reset_password":
        reset_token = generate_reset_token()
        update_fields["reset_token"] = reset_token
        update_fields["reset_token_expires_at"] = datetime.utcnow() + timedelta(minutes=15)

    await db.otp_requests.update_one(
        {"request_id": request_id},
        {"$set": update_fields},
    )

    return {
        "ok": True,
        "user_email": record["user_email"],
        "reset_token": reset_token,
    }


async def consume_reset_token(reset_token: str):
    record = await db.otp_requests.find_one({
        "reset_token": reset_token,
        "purpose": "reset_password",
        "verified": True,
    })

    if not record:
        return None

    if datetime.utcnow() > record.get("reset_token_expires_at", datetime.utcnow()):
        return None

    await db.otp_requests.update_one(
        {"request_id": record["request_id"]},
        {"$unset": {"reset_token": "", "reset_token_expires_at": ""}},
    )

    return record["user_email"]
