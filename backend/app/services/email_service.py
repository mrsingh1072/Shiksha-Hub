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
            subject="Shiksha Hub - Verification Code",
            recipients=[email],
            body=f"""
Hello,

Your Shiksha Hub verification code is:

{otp}

This OTP will expire in 10 minutes.

Regards,
Shiksha Hub Team
""",
            subtype="plain"
        )

        fm = FastMail(conf)
        await fm.send_message(message)

        print(f"[EMAIL SUCCESS] OTP sent to {email}")

    except Exception as e:
        print(f"[EMAIL ERROR] {str(e)}")
        raise


async def send_teacher_approval_email(
    email: str,
    teacher_name: str,
    teacher_id: str,
):
    message = MessageSchema(
        subject="Welcome to Shiksha Hub",
        recipients=[email],
        body=f"""Hello {teacher_name},

Congratulations!

Your Shiksha Hub teacher account has been approved.

Your Details:

Name: {teacher_name}
User ID: {teacher_id}
Email: {email}

You are now officially a part of Shiksha Hub.

You can login and access your Teacher Workspace.

Thank you,
Shiksha Hub Team
""",
        subtype="plain",
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    print(f"[EMAIL SUCCESS] Teacher approval sent to {email}")
