from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging
import traceback
from app.services.project_fetcher_service import project_fetcher
from app.services.aws_migration_evaluator import enterprise_aws_evaluator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/migration-evaluator", tags=["AWS Enterprise Migration"])

class GitEvaluationRequest(BaseModel):
    repo_url: str
    github_token: Optional[str] = None
    traffic_tier: str = "medium"       # low, medium, high, enterprise
    target_region: str = "us-east-1"
    custom_notes: Optional[str] = None

@router.get("/status")
async def evaluator_status():
    """Verifica la disponibilidad del evaluador cloud y componentes de IA."""
    import os
    from app.core.config import settings
    claude_key = os.getenv("CLAUDE_API_KEY") or getattr(settings, "CLAUDE_API_KEY", "")
    claude_model = os.getenv("CLAUDE_MODEL") or getattr(settings, "CLAUDE_MODEL", "claude-sonnet-5-5")
    gemini_client = enterprise_aws_evaluator._get_client()

    engine_name = f"Claude Sonnet 5.5 + REA Static Analyzer" if claude_key else "Gemini + REA Static Analyzer"

    return {
        "status": "online",
        "service": "AWS Enterprise Migration Evaluator",
        "ai_engine": engine_name,
        "claude_active": bool(claude_key),
        "claude_model": claude_model if claude_key else None,
        "gemini_active": gemini_client is not None,
        "default_region": "us-east-1",
        "supported_traffic_tiers": ["low", "medium", "high", "enterprise"]
    }

@router.post("/evaluate-zip")
async def evaluate_zip(
    file: UploadFile = File(...),
    traffic_tier: str = Form("medium"),
    target_region: str = Form("us-east-1"),
    custom_notes: Optional[str] = Form(None)
):
    print(f"\n📥 [API ROUTE] Recibida petición POST /evaluate-zip: {file.filename}")
    if not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="El archivo proporcionado debe tener extensión .zip")

    try:
        content = await file.read()
        source_dir = project_fetcher.extract_zip(content, file.filename)
        return await enterprise_aws_evaluator.evaluate_from_source(
            source_dir=source_dir,
            traffic_tier=traffic_tier,
            target_region=target_region,
            custom_notes=custom_notes
        )
    except Exception as e:
        traceback.print_exc()
        err_msg = str(e).strip() or repr(e)
        logger.error(f"Error evaluando archivo ZIP: {err_msg}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error al evaluar proyecto ZIP: {err_msg}")

@router.post("/evaluate-github")
async def evaluate_github(data: GitEvaluationRequest):
    print(f"\n📥 [API ROUTE] Recibida petición POST /evaluate-github: {data.repo_url}")
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
        traceback.print_exc()
        err_msg = str(e).strip() or repr(e)
        logger.error(f"Error evaluando repositorio GitHub: {err_msg}", exc_info=True)
        raise HTTPException(status_code=400, detail=f"Error al evaluar repositorio GitHub: {err_msg}")