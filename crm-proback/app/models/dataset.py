# pyrefly: ignore [missing-import]
from typing import Optional, List
# pyrefly: ignore [missing-import]
from datetime import datetime
# pyrefly: ignore [missing-import]
from sqlalchemy import String, Text, Boolean, Integer, BigInteger, DateTime, ForeignKey, func, UniqueConstraint
# pyrefly: ignore [missing-import]
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    workspace_id: Mapped[int] = mapped_column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size: Mapped[Optional[int]] = mapped_column(BigInteger)
    file_hash: Mapped[Optional[str]] = mapped_column(String(64))
    mime_type: Mapped[Optional[str]] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(Text)
    schema_definition: Mapped[Optional[dict]] = mapped_column(JSONB)
    total_rows: Mapped[int] = mapped_column(Integer, default=0)
    total_columns: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)
    processing_error: Mapped[Optional[str]] = mapped_column(Text)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default={})
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    version: Mapped[int] = mapped_column(Integer, default=1)
    parent_dataset_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("datasets.id"))
    tags: Mapped[Optional[list]] = mapped_column(ARRAY(Text), default=[])
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="datasets")
    rows: Mapped[List["DatasetRow"]] = relationship("DatasetRow", back_populates="dataset", cascade="all, delete")
    columns: Mapped[List["DatasetColumn"]] = relationship("DatasetColumn", back_populates="dataset", cascade="all, delete")

class DatasetRow(Base):
    __tablename__ = "dataset_rows"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    dataset_id: Mapped[int] = mapped_column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), primary_key=True, nullable=False, index=True)
    row_index: Mapped[int] = mapped_column(Integer, nullable=False)
    data: Mapped[dict] = mapped_column(JSONB, nullable=False)
    raw_data: Mapped[Optional[str]] = mapped_column(Text)
    validation_errors: Mapped[Optional[dict]] = mapped_column(JSONB)
    is_valid: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now())

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="rows")

class DatasetColumn(Base):
    __tablename__ = "dataset_columns"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    dataset_id: Mapped[int] = mapped_column(Integer, ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    column_name: Mapped[str] = mapped_column(String(255), nullable=False)
    data_type: Mapped[str] = mapped_column(String(50), nullable=False)
    nullable: Mapped[bool] = mapped_column(Boolean, default=True)
    is_unique: Mapped[bool] = mapped_column(Boolean, default=False)
    min_value: Mapped[Optional[str]] = mapped_column(Text)
    max_value: Mapped[Optional[str]] = mapped_column(Text)
    null_count: Mapped[int] = mapped_column(Integer, default=0)
    distinct_count: Mapped[int] = mapped_column(Integer, default=0)
    stats: Mapped[Optional[dict]] = mapped_column(JSONB)
    created_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), server_default=func.now())

    dataset: Mapped["Dataset"] = relationship("Dataset", back_populates="columns")

    __table_args__ = (
        UniqueConstraint("dataset_id", "column_name", name="uq_dataset_column"),
    )
