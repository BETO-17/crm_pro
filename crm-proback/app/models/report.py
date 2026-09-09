# pyrefly: ignore [missing-import]
from typing import Optional
# pyrefly: ignore [missing-import]
from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import String, Text, Boolean, Integer, BigInteger, DateTime, ForeignKey, func
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import JSONB
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    workspace_id: Mapped[int] = mapped_column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    dataset_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("datasets.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    report_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    config: Mapped[dict] = mapped_column(JSONB, default={}, nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(500))
    file_size: Mapped[Optional[int]] = mapped_column(BigInteger)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    download_count: Mapped[int] = mapped_column(Integer, default=0)
    last_downloaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="reports")

class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    workspace_id: Mapped[int] = mapped_column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    created_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    report_config: Mapped[dict] = mapped_column(JSONB, nullable=False)
    schedule_type: Mapped[str] = mapped_column(String(50), nullable=False)
    cron_expression: Mapped[Optional[str]] = mapped_column(String(100))
    next_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    last_run_status: Mapped[Optional[str]] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    recipients: Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="report_schedules")
