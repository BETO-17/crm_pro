import aiosmtplib
from email.message import EmailMessage
from app.core.config import settings

async def send_otp_email(email_to: str, otp_code: str):
    message = EmailMessage()
    message["From"] = settings.EMAIL_FROM
    message["To"] = email_to
    message["Subject"] = f"{settings.APP_NAME} - Your Login Code"
    
    content = f"""
    Hello,
    
    Your one-time login code is: {otp_code}
    
    This code is valid for {settings.OTP_EXPIRATION_MINUTES} minutes.
    
    If you did not request this code, you can safely ignore this email.
    """
    message.set_content(content)
    
    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        use_tls=settings.SMTP_USE_SSL,
        username=settings.EMAIL_USER,
        password=settings.EMAIL_PASSWORD
    )
