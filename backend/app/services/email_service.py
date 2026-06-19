from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from dotenv import load_dotenv
import os

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


async def send_otp_email(email: str, otp: str):
    try:
        message = MessageSchema(
            subject="EduVerse AI - Verification Code",
            recipients=[email],
            body=f"""
Hello,

Your EduVerse AI verification code is:

{otp}

This OTP will expire in 10 minutes.

Regards,
EduVerse AI Team
""",
            subtype="plain"
        )

        fm = FastMail(conf)
        await fm.send_message(message)

        print(f"[EMAIL SUCCESS] OTP sent to {email}")

    except Exception as e:
        print(f"[EMAIL ERROR] {str(e)}")
        raise