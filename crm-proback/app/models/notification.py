# pyrefly: ignore [missing-import]
from typing import Optional
# pyrefly: ignore [missing-import]
from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import String, Text, Boolean, Integer, DateTime, ForeignKey, func
# pyrefly: ignore [missing-import]  
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    workspace_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    link: Mapped[Optional[str]] = mapped_column(String(500))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
