from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.workspace import WorkspaceCreate, WorkspaceUpdate, WorkspaceOut
from app.services.workspace import WorkspaceService

router = APIRouter()

@router.get("/", response_model=List[WorkspaceOut])
def read_workspaces(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = WorkspaceService(db)
    return service.get_all(skip=skip, limit=limit)

@router.post("/", response_model=WorkspaceOut, status_code=status.HTTP_201_CREATED)
def create_workspace(workspace_in: WorkspaceCreate, db: Session = Depends(get_db)):
    service = WorkspaceService(db)
    return service.create(workspace_in)

@router.get("/{workspace_id}", response_model=WorkspaceOut)
def read_workspace(workspace_id: int, db: Session = Depends(get_db)):
    service = WorkspaceService(db)
    workspace = service.get_by_id(workspace_id)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@router.put("/{workspace_id}", response_model=WorkspaceOut)
def update_workspace(workspace_id: int, workspace_in: WorkspaceUpdate, db: Session = Depends(get_db)):
    service = WorkspaceService(db)
    workspace = service.update(workspace_id, workspace_in)
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace

@router.delete("/{workspace_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workspace(workspace_id: int, db: Session = Depends(get_db)):
    service = WorkspaceService(db)
    if not service.delete(workspace_id):
        raise HTTPException(status_code=404, detail="Workspace not found")
