from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.workspace import Workspace
from app.models.user import UserWorkspace
from app.models.dataset import Dataset
import pandas as pd
import io
import re

router = APIRouter()

def clean_column_name(col_name: str) -> str:
    # Remove special characters and replace spaces with underscores, lower case
    clean_name = re.sub(r'[^a-zA-Z0-9_]', '_', str(col_name).strip().lower())
    # Ensure it doesn't start with a number
    if clean_name and clean_name[0].isdigit():
        clean_name = 'col_' + clean_name
    return clean_name

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    sector: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find the user's workspace
    workspace = db.query(Workspace).first()
    if not workspace:
        # Fallback if no workspace exists for some reason
        workspace = Workspace(name="Default Workspace", slug="default-workspace")
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
    # Temporarily using a mock workspace for MVP testing since UI might not send token yet
    # In production, get user's active workspace.
    
    if not file.filename or not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos con extensión .csv (Only CSV files are supported)")

    contents = await file.read()
    
    try:
        # Read with pandas
        df = pd.read_csv(io.BytesIO(contents))
        
        # Clean column names
        df.columns = [clean_column_name(col) for col in df.columns]
        
        # Create a dynamic table name
        base_name = clean_column_name(file.filename.replace('.csv', ''))
        table_name = f"dataset_{base_name}"
        
        # If 'id' is already a column in CSV, drop or rename it to avoid conflict with index
        if 'id' in df.columns:
            df = df.rename(columns={'id': 'raw_id'})
        
        # Ensure we have an ID column
        df.index += 1 # start from 1
        df.index.name = 'id'
        
        # Save to database using pandas to_sql (with sqlalchemy connection)
        # We replace if it exists to make it easier for testing
        with engine.begin() as connection:
            df.to_sql(table_name, connection, if_exists='replace', index=True, index_label='id')
            
            # Grant public read access to this dynamic table so Supabase JS client (anon key) can query it.
            try:
                connection.execute(text(f'ALTER TABLE "{table_name}" ADD PRIMARY KEY (id);'))
            except Exception:
                pass
            connection.execute(text(f'GRANT SELECT ON TABLE "{table_name}" TO anon, authenticated;'))
            connection.execute(text(f'ALTER TABLE "{table_name}" ENABLE ROW LEVEL SECURITY;'))
            # Drop policy if exists
            connection.execute(text(f'DROP POLICY IF EXISTS "Enable read access for all users" ON "{table_name}";'))
            connection.execute(text(f'CREATE POLICY "Enable read access for all users" ON "{table_name}" FOR SELECT USING (true);'))
            connection.execute(text(f'GRANT ALL ON "{table_name}" TO anon, authenticated;'))
        # -------------------------------------------------------------
        # Create Dataset record in the metadata table
        # -------------------------------------------------------------
        new_dataset = Dataset(
            workspace_id=workspace.id,
            uploaded_by=current_user.id,
            name=file.filename,
            filename=file.filename,
            total_rows=len(df),
            total_columns=len(df.columns),
            status="ready",
            tags=[sector] if sector else []
        )
        db.add(new_dataset)
        db.commit()
        db.refresh(new_dataset)

        return {
            "message": "Dataset uploaded and processed successfully",
            "dataset_id": new_dataset.id,
            "table_name": table_name,
            "rows": len(df),
            "columns": list(df.columns)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@router.get("/")
def list_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only return active datasets for the user's workspace
    # Or just datasets uploaded by this user depending on rules.
    # We will just get all datasets created by this user or in their workspaces.
    datasets = db.query(Dataset).filter(Dataset.uploaded_by == current_user.id).all()
    
    return [
        {
            "id": d.id,
            "name": d.name,
            "filename": d.filename,
            "total_rows": d.total_rows,
            "total_columns": d.total_columns,
            "status": d.status,
            "created_at": d.created_at
        } for d in datasets
    ]

@router.delete("/{dataset_id}")
def delete_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id,
        Dataset.uploaded_by == current_user.id
    ).first()
    
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    db.delete(dataset)
    db.commit()
    
    return {"message": "Dataset deleted successfully"}

