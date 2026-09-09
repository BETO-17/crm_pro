from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from app.models.workspace import Workspace
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate

class WorkspaceService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Workspace]:
        stmt = select(Workspace).offset(skip).limit(limit)
        return self.db.scalars(stmt).all()

    def get_by_id(self, workspace_id: int) -> Optional[Workspace]:
        stmt = select(Workspace).where(Workspace.id == workspace_id)
        return self.db.scalars(stmt).first()

    def create(self, workspace_in: WorkspaceCreate, created_by: Optional[int] = None) -> Workspace:
        db_workspace = Workspace(**workspace_in.model_dump(), created_by=created_by)
        self.db.add(db_workspace)
        self.db.commit()
        self.db.refresh(db_workspace)
        return db_workspace

    def update(self, workspace_id: int, workspace_in: WorkspaceUpdate) -> Optional[Workspace]:
        db_workspace = self.get_by_id(workspace_id)
        if not db_workspace:
            return None
        
        update_data = workspace_in.model_dump(exclude_unset=True)
        if update_data:
            stmt = update(Workspace).where(Workspace.id == workspace_id).values(**update_data)
            self.db.execute(stmt)
            self.db.commit()
            self.db.refresh(db_workspace)
            
        return db_workspace

    def delete(self, workspace_id: int) -> bool:
        stmt = delete(Workspace).where(Workspace.id == workspace_id)
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount > 0
