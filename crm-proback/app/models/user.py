from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import INET, JSONB
from app.models.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    role = Column(String(50), index=True, nullable=False, default="analyst")
    status = Column(String(50), index=True, nullable=False, default="active")
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    last_login_ip = Column(INET, nullable=True)
    failed_login_attempts = Column(Integer, nullable=False, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    preferences = Column(JSONB, nullable=False, default={})
    created_by = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # OTP fields
    otp_code = Column(String, nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    workspaces = relationship("UserWorkspace", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

class UserWorkspace(Base):
    __tablename__ = "user_workspaces"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    role_override = Column(String(50), nullable=True)
    is_default = Column(Boolean, index=True, nullable=False, default=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    last_accessed_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="workspaces")
    workspace = relationship("Workspace", back_populates="users")

class UserSession(Base):
    __tablename__ = "user_sessions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    refresh_token = Column(Text, unique=True, index=True, nullable=False)
    access_token = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), index=True, nullable=False)
    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)
    device_type = Column(String(50), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="sessions")
