from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "analyst"
    status: str = "offline"
    preferences: Optional[dict] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    preferences: Optional[dict] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserWorkspaceResponse(BaseModel):
    id: int
    user_id: int
    workspace_id: int
    role_override: Optional[str] = None
    is_default: bool

    class Config:
        from_attributes = True
