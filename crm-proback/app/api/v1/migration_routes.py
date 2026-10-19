from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.project_fetcher_service import project_fetcher
from app.services.aws_migration_evaluator import enterprise_aws_evaluator

router = APIRouter(prefix="/migration-evaluator", tags=["AWS Enterprise Migration"])

class GitEvaluationRequest(BaseModel):
    repo_url: str
    github_token: Optional[str] = None
    traffic_tier: str = "medium"       # low, medium, high, enterprise
    target_region: str = "us-east-1"
    custom_notes: Optional[str] = None

@router.post("/evaluate-zip")
async def evaluate_zip(
    file: UploadFile = File(...),
    traffic_tier: str = Form("medium"),
    target_region: str = Form("us-east-1"),
    custom_notes: Optional[str] = Form(None)
):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="El archivo debe ser un .zip")

    content = await file.read()
    source_dir = project_fetcher.extract_zip(content, file.filename)
    return await enterprise_aws_evaluator.evaluate_from_source(
        source_dir=source_dir,
        traffic_tier=traffic_tier,
        target_region=target_region,
        custom_notes=custom_notes
    )

@router.post("/evaluate-github")
async def evaluate_github(data: GitEvaluationRequest):
    try:
        source_dir = await project_fetcher.clone_github_repo(
            repo_url=data.repo_url,
            token=data.github_token
        )
        return await enterprise_aws_evaluator.evaluate_from_source(
            source_dir=source_dir,
            traffic_tier=data.traffic_tier,
            target_region=data.target_region,
            custom_notes=data.custom_notes
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))