import os
import shutil
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
# pyrefly: ignore[missing-import]
from google import genai
# pyrefly: ignore[missing-import]
from google.genai import types

from app.core.config import settings
from app.services.rea_service import rea_service
from app.services.paas_detector_service import paas_detector
from app.schemas.enterprise_evaluation import (
    EnterpriseEvaluationResult,
    ArchitectureScenario,
    AWSServiceItem
)

logger = logging.getLogger(__name__)

def safe_log(msg: str):
    try:
        print(msg)
    except Exception:
        try:
            print(msg.encode("ascii", errors="replace").decode("ascii"))
        except Exception:
            pass

class EnterpriseAWSMigrationEvaluator:
    def _get_client(self) -> Optional[genai.Client]:
        api_key = os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", "")
        if api_key:
            return genai.Client(api_key=api_key)
        return None

    @property
    def ai(self) -> Optional[genai.Client]:
        return self._get_client()

    async def evaluate_from_source(
        self,
        source_dir: str,
        traffic_tier: str = "medium",
        target_region: str = "us-east-1",
        custom_notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evalúa proyectos medianos o empresariales desde código extraído,
        generando topologías y presupuestos en 3 escenarios de despliegue:
        Cost-Optimized, Recommended-Production y High-Availability-Enterprise.
        """
        safe_log("\n=======================================================")
        safe_log("[AWS EVALUATOR] Iniciando evaluacion tecnica del proyecto")
        safe_log(f"Carpeta de codigo: {source_dir}")
        safe_log(f"Region destino: {target_region} | Trafico: {traffic_tier}")
        safe_log("=======================================================")

        try:
            # 1. Detección de artefactos PaaS (Vercel, Render, Heroku, Dockerfiles, etc.)
            paas_info = paas_detector.inspect_paas_artifacts(source_dir)
            safe_log(f"[PaaS DETECTOR] Origen detectado: {paas_info.get('origin_hint')}")
            if paas_info.get("detected_configs"):
                safe_log(f"   Archivos de despliegue: {', '.join(paas_info.get('detected_configs', []))}")

            # 2. Inspección técnica profunda con el motor REA y análisis heurístico
            safe_log("[REA AGENT] Ejecutando analisis estatico y de ingenieria inversa...")
            rea_result = await rea_service.analyze_project(source_dir)
            tech_specs = rea_result.get("data") or {}
            safe_log(f"   Lenguajes: {', '.join(tech_specs.get('primary_languages', []))}")
            safe_log(f"   Frameworks: {', '.join(tech_specs.get('frameworks', []))}")
            safe_log(f"   Bases de datos: {', '.join(tech_specs.get('databases', []))}")
            safe_log(f"   Patron inferido: {tech_specs.get('inferred_pattern')}")

            # 3. Evaluación con Claude Sonnet 5.5 (prioritario para ahorrar tokens con 1 sola consulta)
            structured_data: Optional[EnterpriseEvaluationResult] = None
            claude_key = os.getenv("CLAUDE_API_KEY") or getattr(settings, "CLAUDE_API_KEY", "")
            if claude_key:
                try:
                    claude_model = os.getenv("CLAUDE_MODEL") or getattr(settings, "CLAUDE_MODEL", "claude-sonnet-5-5")
                    safe_log(f"[CLAUDE AI] Generando evaluacion y 3 escenarios con {claude_model} (1 sola consulta)...")
                    structured_data = await self._generate_claude_evaluation(
                        api_key=claude_key,
                        model_name=claude_model,
                        paas_info=paas_info,
                        tech_specs=tech_specs,
                        traffic_tier=traffic_tier,
                        target_region=target_region,
                        custom_notes=custom_notes
                    )
                    safe_log("[CLAUDE AI] Arquitectura y presupuestos estructurados generados con exito.")
                except Exception as c_err:
                    safe_log(f"[CLAUDE AI] Error con Claude ({c_err}). Probando alternativa...")
                    logger.warning(f"Error generando evaluacion con Claude: {c_err}")

            # Fallback a Gemini si Claude no estuviese disponible
            if not structured_data:
                client = self._get_client()
                if client:
                    try:
                        safe_log("[GEMINI AI] Consultando modelos Gemini con API Key de .env...")
                        structured_data = await self._generate_llm_evaluation(
                            client=client,
                            paas_info=paas_info,
                            tech_specs=tech_specs,
                            traffic_tier=traffic_tier,
                            target_region=target_region,
                            custom_notes=custom_notes
                        )
                        safe_log("[GEMINI AI] Arquitectura y presupuestos estructurados generados con exito.")
                    except Exception as llm_err:
                        safe_log(f"[GEMINI AI] No se pudo completar llamada LLM ({llm_err}). Activando motor determinista experto.")
                        logger.warning(f"Error generando evaluacion con Gemini LLM: {llm_err}.")
                else:
                    safe_log("[AI ADVISOR] Usando motor determinista experto de respaldo...")

            # 4. Fallback experto si las IAs no están configuradas o fallaron
            if not structured_data:
                safe_log("[EXPERT ENGINE] Generando 3 escenarios de migracion Well-Architected...")
                structured_data = self._build_deterministic_evaluation(
                    paas_info=paas_info,
                    tech_specs=tech_specs,
                    traffic_tier=traffic_tier,
                    target_region=target_region,
                    custom_notes=custom_notes
                )

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
                "origin_detected": paas_info.get("origin_hint", "Desconocido / On-Premise"),
                "detected_configs": paas_info.get("detected_configs", []),
                "system_analysis": structured_data.current_platform_analysis,
                "architecture_pattern": structured_data.detected_architecture_pattern,
                "migration_strategy": structured_data.migration_strategy,
                "well_architected_notes": structured_data.well_architected_notes,
                "scenarios": processed_scenarios,
                "technical_evidence": {
                    "languages": tech_specs.get("primary_languages", []),
                    "frameworks": tech_specs.get("frameworks", []),
                    "databases": tech_specs.get("databases", []),
                    "has_docker": tech_specs.get("has_docker", False),
                    "total_files": tech_specs.get("total_files", 0)
                }
            }

        finally:
            # Limpieza del directorio temporal padre del escaneo
            parent_temp = str(Path(source_dir).parent)
            if "eval_zip_" in parent_temp or "eval_git_" in parent_temp or "eval_" in parent_temp:
                shutil.rmtree(parent_temp, ignore_errors=True)

    async def _generate_claude_evaluation(
        self,
        api_key: str,
        model_name: str,
        paas_info: Dict[str, Any],
        tech_specs: Dict[str, Any],
        traffic_tier: str,
        target_region: str,
        custom_notes: Optional[str]
    ) -> EnterpriseEvaluationResult:
        """Genera los 3 escenarios con Claude Sonnet 5.5 en una sola consulta optimizada para ahorrar tokens."""
        # pyrefly: ignore[missing-import]
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        schema_json = json.dumps(EnterpriseEvaluationResult.model_json_schema())

        prompt = f"""Eres un Principal Solutions Architect de AWS certificado (Enterprise Advisory).
Audita el siguiente sistema detectado por ingenieria inversa y formula 3 escenarios de migracion hacia AWS con presupuestos precisos.

EVIDENCIA TECNICA:
- Plataforma origen / PaaS: {json.dumps(paas_info, ensure_ascii=False)}
- Evidencia tecnica de codigo: {json.dumps(tech_specs, ensure_ascii=False)}

PARAMETROS:
- Nivel de trafico esperado: {traffic_tier} (low: <25k/mes, medium: 100k-500k/mes, high: >1M req/mes, enterprise: multi-region)
- Region destino AWS: {target_region}
- Requerimientos adicionales: {custom_notes or "Alta disponibilidad y costos justos"}

REGLAS DE EFICIENCIA (Ahorro estricto de tokens y prevencion de truncamiento):
- Limita cada escenario a exactamente 3 o 4 servicios esenciales de AWS (Compute, Database, Storage, Networking).
- Escribe razones y especificaciones muy cortas (maximo 1 linea).
- Formula los 3 escenarios obligatorios:
  1. 'Cost-Optimized' (MVP / Staging Single-AZ, ~$45-$95 USD/mes)
  2. 'Recommended-Production' (Produccion balanceada Multi-AZ con ECS Fargate, ALB, RDS, ElastiCache, ~$320-$550 USD/mes)
  3. 'High-Availability-Enterprise' (Mision critica tolerante a fallos, Aurora Multi-AZ, WAF, KMS, SQS/SNS, ~$1,100-$2,200 USD/mes)

Responde UNICAMENTE con un JSON valido que cumpla este esquema sin explicaciones adicionales:
{schema_json}"""

        def _do_claude_call():
            return client.messages.create(
                model=model_name,
                max_tokens=8192,
                messages=[{"role": "user", "content": prompt}]
            )

        msg = await asyncio.to_thread(_do_claude_call)
        raw_text = ""
        for block in msg.content:
            if hasattr(block, "text"):
                raw_text += block.text
            elif getattr(block, "type", None) == "text":
                raw_text += getattr(block, "text", "")
        raw_text = raw_text.strip()
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()
        return EnterpriseEvaluationResult.model_validate_json(raw_text)

    async def _generate_llm_evaluation(
        self,
        client: genai.Client,
        paas_info: Dict[str, Any],
        tech_specs: Dict[str, Any],
        traffic_tier: str,
        target_region: str,
        custom_notes: Optional[str]
    ) -> EnterpriseEvaluationResult:
        """Invoca a Gemini estructurado con los principios de AWS Well-Architected."""
        system_instruction = (
            "Eres un Principal Solutions Architect de AWS certificado (Enterprise Cloud Advisory). "
            "Tu misión es evaluar sistemas corporativos basados en evidencia técnica extraída por herramientas "
            "de ingeniería inversa (REA) y diseñar su migración completa hacia AWS cumpliendo el AWS Well-Architected Framework."
        )

        prompt = f"""
        Audita el siguiente sistema empresarial y formula 3 escenarios completos de migración hacia AWS con presupuestos precisos.

        DATOS TÉCNICOS EXTRAÍDOS POR REA Y DETECTORES:
        - Indicadores de plataforma previa / PaaS: {json.dumps(paas_info, ensure_ascii=False)}
        - Evidencia técnica de código (lenguajes, frameworks, bases de datos):
        {json.dumps(tech_specs, ensure_ascii=False)}

        PARÁMETROS DE NEGOCIO:
        - Perfil de tráfico esperado: {traffic_tier} (low: <25k/mes, medium: 100k-500k/mes, high: >1M req/mes, enterprise: multi-región).
        - Región de destino AWS: {target_region}.
        - Requerimientos adicionales: {custom_notes or "Cumplir alta disponibilidad y costos justos."}.

        REGLAS PARA ESCENARIOS Y PRESUPUESTOS (Valores reales aproximados en USD):
        1. 'Cost-Optimized': Enfocado en desarrollo/MVP con Single-AZ.
           - Cómputo: ECS Fargate o App Runner con dimensionamiento liviano (0.5 vCPU / 1GB RAM) (~$20-$40/mes).
           - Base de datos: RDS PostgreSQL/MySQL db.t4g.micro o db.t4g.small Single-AZ (~$18-$35/mes).
           - Almacenamiento & Red: S3 Standard + CloudFront CDN + Route 53 (~$10-$20/mes).
           - Presupuesto mensual total típico: $50 - $110 USD/mes.

        2. 'Recommended-Production': Balance óptimo de alta disponibilidad, SLA y costo.
           - Cómputo: ECS Fargate con autoscaling (2-4 tareas distribuidas) (~$70-$130/mes).
           - Red: Application Load Balancer (ALB) (~$22-$35/mes) + VPC con NAT Gateway (~$35/mes).
           - Base de datos: Amazon RDS Multi-AZ db.t4g.large (~$140-$220/mes) o Aurora Serverless v2.
           - Caché: Amazon ElastiCache Redis cache.t4g.medium (~$28-$50/mes).
           - Seguridad & CDN: AWS WAF + CloudFront + Secrets Manager (~$25-$45/mes).
           - Monitoreo: Amazon CloudWatch métricas y logs (~$15-$25/mes).
           - Presupuesto mensual total típico: $320 - $550 USD/mes.

        3. 'High-Availability-Enterprise': Misión crítica con tolerancia a desastres (99.99% SLA).
           - Clúster multi-AZ ECS Fargate / EKS con réplicas activas (~$250-$450/mes).
           - Amazon Aurora PostgreSQL Multi-AZ / Global Database con auto-scaling (~$400-$800/mes).
           - Redis ElastiCache Multi-AZ Clusterizado (~$90-$180/mes).
           - Balanceo ALB dual + Route 53 enrutamiento por latencia / failover (~$60/mes).
           - AWS WAF Advanced Bot Control + AWS KMS + Secrets Manager + GuardDuty (~$120-$200/mes).
           - Desacoplamiento asíncrono con Amazon SQS + SNS + EventBridge (~$20-$40/mes).
           - Presupuesto mensual total típico: $1,100 - $2,200 USD/mes.
        """

        user_model = os.getenv("GEMINI_MODEL") or getattr(settings, "GEMINI_MODEL", None)
        model_candidates = []
        if user_model and user_model.strip():
            model_candidates.append(user_model.strip())
        
        # Modelos activos en producción probados y funcionales
        for m in [
            "gemini-flash-latest",
            "gemini-3.8-flash",
            "gemini-3.6-flash",
            "gemini-3.1-pro-preview",
            "gemini-pro-latest"
        ]:
            if m not in model_candidates:
                model_candidates.append(m)

        last_err = None
        for model in model_candidates:
            try:
                safe_log(f"[GEMINI AI] Consultando modelo: {model}...")
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.2,
                        response_mime_type="application/json",
                        response_schema=EnterpriseEvaluationResult
                    )
                )
                if response.parsed:
                    safe_log(f"[GEMINI AI] Modelo {model} genero la arquitectura y presupuestos con exito.")
                    return response.parsed
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    safe_log(f"[GEMINI AI] Modelo {model}: Cuota de API agotada (429 Quota Exceeded). Probando alternativa...")
                elif "503" in err_str or "UNAVAILABLE" in err_str:
                    safe_log(f"[GEMINI AI] Modelo {model}: Alta demanda temporal (503 High Demand). Probando alternativa...")
                elif "404" in err_str or "NOT_FOUND" in err_str:
                    safe_log(f"[GEMINI AI] Modelo {model}: No disponible en la API v1beta (404 Not Found). Probando alternativa...")
                else:
                    safe_log(f"[GEMINI AI] Modelo {model}: Error ({err_str[:90]}). Probando alternativa...")
                last_err = e
                continue
        raise last_err or RuntimeError("No se pudo generar respuesta estructurada con los modelos de Gemini.")

    def _build_deterministic_evaluation(
        self,
        paas_info: Dict[str, Any],
        tech_specs: Dict[str, Any],
        traffic_tier: str,
        target_region: str,
        custom_notes: Optional[str]
    ) -> EnterpriseEvaluationResult:
        """
        Generador heurístico de alta fidelidad que formula la evaluación empresarial
        y los 3 presupuestos cuando la IA no se encuentra disponible.
        """
        origin = paas_info.get("origin_hint", "Desconocido / On-Premise")
        pattern = tech_specs.get("inferred_pattern", "Microservicios / Aplicación Desacoplada")
        databases = tech_specs.get("databases", ["PostgreSQL"])
        frameworks = tech_specs.get("frameworks", ["FastAPI / Node.js"])
        has_docker = tech_specs.get("has_docker", True)

        db_name = databases[0] if databases else "PostgreSQL"
        fw_str = ", ".join(frameworks) if frameworks else "Servicio Web"

        analysis_desc = (
            f"El sistema analizado fue detectado originario de {origin}, estructurado bajo un patrón "
            f"de '{pattern}'. Utiliza tecnologías clave como {fw_str} con persistencia en {db_name}. "
            f"Contenedorización Docker detectada: {'Sí' if has_docker else 'Pendiente'}. "
            f"La infraestructura de destino en AWS ({target_region}) se ha dimensionado para un perfil de tráfico '{traffic_tier}'."
        )

        strategy = "Replatform (Modernización hacia Contenedores Administrados y Bases Gestionadas)"
        if "Serverless" in pattern:
            strategy = "Refactor (Migración Serverless con Event-Driven Architecture)"
        elif not has_docker and "Monolito" in pattern:
            strategy = "Rehost & Replatform (Contenedorización y Despliegue en AWS ECS Fargate)"

        well_architected = [
            "Seguridad: Implementación obligatoria de IAM Roles para ECS Tasks evitando credenciales estáticas en código.",
            "Confiabilidad: Base de datos desacoplada en subredes privadas aisladas sin IP pública directa.",
            "Eficiencia de Rendimiento: Distribución perimetral de contenido con Amazon CloudFront y compresión Brotli.",
            "Optimización de Costos: Dimensionamiento elástico con políticas de escalado según consumo de CPU y memoria.",
            "Sostenibilidad: Uso de procesadores AWS Graviton (instancias serie t4g / c7g) con hasta 40% de mejora en relación precio-rendimiento."
        ]

        # 1. Escenario Cost-Optimized
        cost_optimized_services = [
            AWSServiceItem(
                service_name="Amazon ECS Fargate (Single Container)",
                service_code="ECS",
                category="Compute",
                role="Servicio Web / API Backend",
                specs="1 Tarea Fargate (0.5 vCPU / 1 GB RAM, Linux Graviton)",
                quantity=1,
                estimated_unit_cost_usd=16.80,
                reason="Permite ejecutar la aplicación en contenedor sin administrar servidores EC2 subyacentes."
            ),
            AWSServiceItem(
                service_name=f"Amazon RDS {db_name} (Single-AZ)",
                service_code="RDS",
                category="Database",
                role="Persistencia Relacional Transaccional",
                specs="db.t4g.micro (2 vCPU burstable / 1 GB RAM, 20 GB gp3)",
                quantity=1,
                estimated_unit_cost_usd=21.50,
                reason="Costo mínimo de base de datos relacional administrada para fase inicial o testing."
            ),
            AWSServiceItem(
                service_name="Amazon S3 Standard",
                service_code="S3",
                category="Storage",
                role="Almacenamiento de Archivos y Backups",
                specs="50 GB de almacenamiento Standard con cifrado SSE-S3",
                quantity=1,
                estimated_unit_cost_usd=1.15,
                reason="Custodia duradera de comprobantes, media y volcados de base de datos."
            ),
            AWSServiceItem(
                service_name="Amazon CloudFront",
                service_code="CloudFront",
                category="Networking",
                role="CDN y Aceleración Perimetral",
                specs="Tráfico saliente global, capa de caché estática y SSL gratuito",
                quantity=1,
                estimated_unit_cost_usd=5.00,
                reason="Acelera la respuesta global del frontend y reduce peticiones directas al backend."
            ),
            AWSServiceItem(
                service_name="AWS Secrets Manager",
                service_code="SecretsManager",
                category="Security",
                role="Custodia de Variables de Entorno",
                specs="3 Secretos gestionados con rotación básica",
                quantity=1,
                estimated_unit_cost_usd=1.20,
                reason="Inyección segura de claves de base de datos y JWT sin hardcodear en repositorios."
            )
        ]

        # 2. Escenario Recommended-Production
        recommended_services = [
            AWSServiceItem(
                service_name="Amazon ECS Fargate (Auto-scaling Multi-AZ)",
                service_code="ECS",
                category="Compute",
                role="Cúmulo de Contenedores de Alta Disponibilidad",
                specs="2 Tareas mínimas elásticas (1 vCPU / 2 GB RAM cada una)",
                quantity=2,
                estimated_unit_cost_usd=33.60,
                reason="Garantiza cero caída de servicio durante despliegues y auto-escalado horizontal ante picos."
            ),
            AWSServiceItem(
                service_name="Elastic Load Balancing (ALB)",
                service_code="ALB",
                category="Networking",
                role="Balanceador de Carga Capa 7 HTTP/HTTPS",
                specs="1 ALB activo con 2 Target Groups y terminación ACM SSL",
                quantity=1,
                estimated_unit_cost_usd=22.50,
                reason="Reparte el tráfico entre zonas de disponibilidad y ejecuta chequeos de salud automatizados."
            ),
            AWSServiceItem(
                service_name=f"Amazon RDS {db_name} Multi-AZ",
                service_code="RDS",
                category="Database",
                role="Base de Datos Primaria con Failover Automático",
                specs="db.t4g.large Multi-AZ (2 vCPU / 8 GB RAM, 100 GB gp3 encriptado)",
                quantity=1,
                estimated_unit_cost_usd=185.00,
                reason="Réplica sincronizada en segunda zona de disponibilidad con conmutación en menos de 60 segundos."
            ),
            AWSServiceItem(
                service_name="Amazon ElastiCache Redis",
                service_code="ElastiCache",
                category="Database",
                role="Caché en Memoria y Sesiones",
                specs="cache.t4g.medium (2 vCPU / 3.09 GB RAM)",
                quantity=1,
                estimated_unit_cost_usd=38.40,
                reason="Acelera consultas repetitivas de API, tasas de conversión y tokens de autenticación."
            ),
            AWSServiceItem(
                service_name="Amazon S3 + CloudFront CDN",
                service_code="S3",
                category="Storage",
                role="Almacenamiento y Entrega Global",
                specs="200 GB almacenamiento + 500 GB transferencia saliente CDN",
                quantity=1,
                estimated_unit_cost_usd=35.00,
                reason="Entrega inmediata con ultra baja latencia y protección contra picos de tráfico."
            ),
            AWSServiceItem(
                service_name="AWS WAF (Web Application Firewall)",
                service_code="WAF",
                category="Security",
                role="Protección Perimetral OWASP",
                specs="1 Web ACL con reglas gestionadas de AWS (SQLi, XSS, IP Reputation)",
                quantity=1,
                estimated_unit_cost_usd=15.00,
                reason="Bloqueo proactivo de escaneos automáticos e intentos de vulneración al API."
            ),
            AWSServiceItem(
                service_name="Amazon CloudWatch & Alarms",
                service_code="CloudWatch",
                category="Monitoring",
                role="Monitoreo, Logs Centralizados y Alarmas",
                specs="10 Métricas detalladas + 15 GB ingesta de logs",
                quantity=1,
                estimated_unit_cost_usd=18.50,
                reason="Detección de anomalías en tiempo real y disparadores de auto-recuperación."
            )
        ]

        # 3. Escenario High-Availability-Enterprise
        enterprise_services = [
            AWSServiceItem(
                service_name="Amazon ECS Fargate Enterprise Cluster",
                service_code="ECS",
                category="Compute",
                role="Cómputo Crítico Distribuido en 3 Zonas (AZs)",
                specs="4 Tareas base escalables a 12 (2 vCPU / 4 GB RAM, Graviton3)",
                quantity=4,
                estimated_unit_cost_usd=67.20,
                reason="Resiliencia total ante fallo de una zona entera de AWS con alta concurrencia transaccional."
            ),
            AWSServiceItem(
                service_name="Application Load Balancer Dual Multi-Zone",
                service_code="ALB",
                category="Networking",
                role="Puntos de Entrada Redundantes con WAF Integrado",
                specs="2 ALBs para tráfico público y servicios internos",
                quantity=2,
                estimated_unit_cost_usd=32.00,
                reason="Separación de tráfico perimetral de usuarios y tráfico este-oeste entre microservicios."
            ),
            AWSServiceItem(
                service_name="Amazon Aurora PostgreSQL Serverless v2 (Multi-AZ)",
                service_code="Aurora",
                category="Database",
                role="Base de Datos Transaccional Autogestionada de Escala Instantánea",
                specs="Clúster Multi-AZ con auto-scaling dinámico (2-16 ACUs, 250 GB io2)",
                quantity=1,
                estimated_unit_cost_usd=480.00,
                reason="Hasta 5x el rendimiento de PostgreSQL estándar, backups continuos y clonación instantánea."
            ),
            AWSServiceItem(
                service_name="Amazon ElastiCache Redis Cluster (Multi-AZ)",
                service_code="ElastiCache",
                category="Database",
                role="Clúster Redis con Réplicas de Lectura",
                specs="2 Nodos cache.r6g.large con Failover Multi-AZ",
                quantity=2,
                estimated_unit_cost_usd=96.00,
                reason="Cero pérdida de caché y soporte para millones de operaciones de lectura concurrentes."
            ),
            AWSServiceItem(
                service_name="AWS WAF Enterprise + Shield Standard",
                service_code="WAF",
                category="Security",
                role="Mitigación DDoS Avanzada y Control de Bots",
                specs="Reglas avanzadas de reputación IP, Account Takeover y Rate Limiting",
                quantity=1,
                estimated_unit_cost_usd=85.00,
                reason="Blindaje corporativo para transacciones financieras y cumplimiento normativo."
            ),
            AWSServiceItem(
                service_name="Amazon SQS + SNS Event Pipeline",
                service_code="SQS",
                category="Messaging",
                role="Desacoplamiento Asíncrono de Eventos",
                specs="Colas FIFO y Topics de difusión de alta capacidad",
                quantity=1,
                estimated_unit_cost_usd=25.00,
                reason="Aislamiento de fallos para procesamiento de facturación y eventos sin bloquear las APIs."
            ),
            AWSServiceItem(
                service_name="Amazon CloudWatch Observability + X-Ray",
                service_code="CloudWatch",
                category="Monitoring",
                role="Trazabilidad Distribuida y APM Completo",
                specs="Logs centralizados con retención de 90 días y mapas de servicio X-Ray",
                quantity=1,
                estimated_unit_cost_usd=45.00,
                reason="Diagnóstico en milisegundos de latencias de red y cuellos de botella en bases de datos."
            ),
            AWSServiceItem(
                service_name="AWS KMS + Secrets Manager Multi-Region",
                service_code="KMS",
                category="Security",
                role="Cifrado con Claves CMK y Rotación Automática",
                specs="Claves administradas con políticas KMS y rotación cada 30 días",
                quantity=1,
                estimated_unit_cost_usd=18.00,
                reason="Cumplimiento con estándares bancarios y de protección de datos sensibles."
            )
        ]

        return EnterpriseEvaluationResult(
            current_platform_analysis=analysis_desc,
            detected_architecture_pattern=pattern,
            migration_strategy=strategy,
            well_architected_notes=well_architected,
            scenarios=[
                ArchitectureScenario(
                    scenario_type="Cost-Optimized",
                    scenario_summary="Presupuesto ultra-optimizado para fases de desarrollo, pruebas o MVP. Instancias mínimas en Single-AZ manteniendo modernización sin sobrecostes.",
                    services=cost_optimized_services
                ),
                ArchitectureScenario(
                    scenario_type="Recommended-Production",
                    scenario_summary="Arquitectura equilibrada recomendada por AWS. Redundancia Multi-AZ en cómputo y persistencia, balanceo L7 con ALB, caché en memoria y WAF.",
                    services=recommended_services
                ),
                ArchitectureScenario(
                    scenario_type="High-Availability-Enterprise",
                    scenario_summary="Infraestructura corporativa de máxima resiliencia (99.99% SLA). Aurora Serverless v2, ElastiCache clúster, seguridad perimetral avanzada y desacoplamiento asíncrono.",
                    services=enterprise_services
                )
            ]
        )

enterprise_aws_evaluator = EnterpriseAWSMigrationEvaluator()