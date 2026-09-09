from typing import Optional, List
from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import String, Text, Boolean, Integer, DateTime, func
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import JSONB
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500))
    config: Mapped[dict] = mapped_column(JSONB, default={})
    status: Mapped[str] = mapped_column(String(50), default="active", index=True)
    created_by: Mapped[Optional[int]] = mapped_column(Integer, index=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    users: Mapped[List["UserWorkspace"]] = relationship("UserWorkspace", back_populates="workspace", cascade="all, delete")
    datasets: Mapped[List["Dataset"]] = relationship("Dataset", back_populates="workspace", cascade="all, delete")
    reports: Mapped[List["Report"]] = relationship("Report", back_populates="workspace", cascade="all, delete")
    report_schedules: Mapped[List["ReportSchedule"]] = relationship("ReportSchedule", back_populates="workspace", cascade="all, delete")
