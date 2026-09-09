import random
import string
from datetime import datetime, timedelta, timezone
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.auth import OTPRequest, OTPVerify, Token, UserResponse, LoginRequest
from app.utils.email import send_otp_email

router = APIRouter()

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

@router.post("/request-otp", status_code=status.HTTP_200_OK)
async def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    # Find user or create if not exists
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado en el sistema.")
    
    # Generate OTP and update user
    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRATION_MINUTES)
    
    db.commit()
    
    # Send email
    try:
        await send_otp_email(email_to=user.email, otp_code=otp)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send email."
        )
    
    return {"message": "OTP sent successfully."}

@router.post("/verify-otp", response_model=Token)
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if not user.otp_code or user.otp_code != payload.code:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP code")
        
    if not user.otp_expires_at or user.otp_expires_at < datetime.now():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="OTP code has expired")
        
    # Clear OTP
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    # Generate JWT
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
