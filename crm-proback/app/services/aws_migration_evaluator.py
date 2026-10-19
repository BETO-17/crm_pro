import os
import shutil
import json
from pathlib import Path
from typing import Dict, Any, Optional
from google import genai
from google.genai import types

from app.services.rea_service import rea_service
from app.services.project_fetcher_service import project_fetcher
from app.services.paas_detector_service import paas_detector
from app.schemas.enterprise_evaluation import EnterpriseEvaluationResult

class EnterpriseAWSMigrationEvaluator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        # Inicialización del cliente oficial google-genai
        self.ai = genai.Client(api_key=api_key) if api_key else None
        # Modelo insignia para arquitectura y razonamiento complejo
        self.model_name = "gemini-2.5-pro"

    async def evaluate_from_source(
        self,
        source_dir: str,
        traffic_tier: str = "medium",
        target_region: str = "us-east-1",
        custom_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evalúa proyectos medianos o empresariales desde código extraído,
        generando topologías y presupuestos en 3 escenarios de despliegue.
        """
        if not self.ai:
            raise RuntimeError("GEMINI_API_KEY no está configurada en las variables de entorno.")

        try:
            # 1. Detección de artefactos PaaS (Vercel, Render, Dockerfiles, etc.)
            paas_info = paas_detector.inspect_paas_artifacts(source_dir)

            # 2. Inspección técnica profunda con el CLI interno de REA
            rea_result = await rea_service.analyze_project(source_dir)
            tech_specs = rea_result.get("data") or rea_result.get("raw_data") if rea_result.get("success") else "Sin metadatos REA"

            # 3. Construcción del Prompt para Arquitecto Principal Cloud
            system_instruction = (
                "Eres un Principal Solutions Architect de AWS. Tu especialidad es auditar sistemas complejos, "
                "monolitos distribuidos, microservicios y aplicaciones en PaaS (Vercel, Render, Heroku) "
                "para diseñar su migración completa hacia AWS cumpliendo el AWS Well-Architected Framework."
            )

            prompt = f"""
            Audita el siguiente sistema empresarial y formula 3 escenarios completos de migración hacia AWS.

            DATOS TÉCNICOS EXTRAÍDOS POR REA Y DETECTORES:
            - Indicadores de plataforma previa: {json.dumps(paas_info, ensure_ascii=False)}
            - Evidencia técnica / Inferencia de código (dependencias, modelos, configs):
            {json.dumps(tech_specs, ensure_ascii=False) if isinstance(tech_specs, dict) else str(tech_specs)[:150000]}

            PARÁMETROS DE NEGOCIO:
            - Perfil de tráfico esperado: {traffic_tier} (ej. low: <10k/mes, medium: 100k-500k/mes, high: >1M req/mes).
            - Región de destino: {target_region}.
            - Notas adicionales del cliente: {custom_notes or "Ninguna"}.

            REGLAS DE ARQUITECTURA EMPRESARIAL:
            1. Considera siempre la infraestructura base: VPC con subnets públicas/privadas, NAT Gateways, Application Load Balancers (ALB) y seguridad (WAF, Secrets Manager).
            2. Computo: Si hay servicios web, dimensiona ECS Fargate, App Runner o EKS. Si hay tareas en background/cron, evalúa EventBridge + Lambda o Workers en Fargate.
            3. Base de Datos: Si detectas SQL relacional, evalúa Amazon RDS o Aurora (especificando si aplica Multi-AZ o Read Replicas). Si hay Redis, incluye ElastiCache.
            4. Almacenamiento: S3 para blobs/media y CloudFront para CDN.
            5. Debes generar exactamente 3 escenarios en 'scenarios':
               - 'Cost-Optimized': Enfocado en bajo costo para MVP o staging (Single-AZ, instancias pequeñas, serverless donde sea viable).
               - 'Recommended-Production': Balance ideal entre costo, resiliencia y SLA (Multi-AZ para bases de datos, autoscaling en contenedores, backups).
               - 'High-Availability-Enterprise': Cero tolerancia a caídas, Aurora Multi-Region/Global, WAF con reglas avanzadas, ElastiCache clusterizado.
            """

            # 4. Generación estructurada con Gemini 2.5 Pro
            response = self.ai.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2,
                    response_mime_type="application/json",
                    response_schema=EnterpriseEvaluationResult
                )
            )

            # Validación de salida estructurada
            structured_data: EnterpriseEvaluationResult = response.parsed

            # 5. Cálculo y balanceo de presupuestos para los 3 escenarios
            processed_scenarios = []
            for scenario in structured_data.scenarios:
                monthly_total = 0.0
                services_breakdown = []

                for svc in scenario.services:
                    cost = round(svc.estimated_unit_cost_usd * svc.quantity, 2)
                    monthly_total += cost
                    
                    svc_dict = svc.model_dump()
                    svc_dict["total_monthly_usd"] = cost
                    services_breakdown.append(svc_dict)

                processed_scenarios.append({
                    "scenario_type": scenario.scenario_type,
                    "summary": scenario.scenario_summary,
                    "services": services_breakdown,
                    "pricing": {
                        "monthly_total_usd": round(monthly_total, 2),
                        "annual_total_usd": round(monthly_total * 12, 2),
                        "currency": "USD"
                    }
                })

            return {
                "status": "success",
                "origin_detected": paas_info.get("origin_hint"),
                "detected_configs": paas_info.get("detected_configs"),
                "system_analysis": structured_data.current_platform_analysis,
                "architecture_pattern": structured_data.detected_architecture_pattern,
                "migration_strategy": structured_data.migration_strategy,
                "well_architected_notes": structured_data.well_architected_notes,
                "scenarios": processed_scenarios
            }

        finally:
            # Limpieza del directorio temporal padre del escaneo
            parent_temp = str(Path(source_dir).parent)
            if "eval_" in parent_temp:
                shutil.rmtree(parent_temp, ignore_errors=True)

enterprise_aws_evaluator = EnterpriseAWSMigrationEvaluator()