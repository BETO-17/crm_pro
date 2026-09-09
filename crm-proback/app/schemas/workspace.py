from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class WorkspaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    config: Optional[Dict[str, Any]] = {}
    status: str = "active"

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class WorkspaceOut(WorkspaceBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
