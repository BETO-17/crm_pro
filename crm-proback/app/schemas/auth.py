# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    code: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
