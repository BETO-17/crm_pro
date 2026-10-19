from pydantic import BaseModel, Field
from typing import List, Optional

class AWSServiceItem(BaseModel):
    service_name: str = Field(description="Nombre exacto del servicio (ej. Amazon ECS Fargate, Amazon Aurora PostgreSQL, AWS ALB)")
    category: str = Field(description="Compute | Database | Networking | Storage | Security | Messaging | Monitoring")
    role: str = Field(description="Función en la arquitectura (ej. API Gateway, Base Transaccional, Ingesta de Eventos)")
    specs: str = Field(description="Dimensionamiento técnico (ej. db.r6g.xlarge Multi-AZ, 4 vCPU / 8 GB RAM, 500 GB io2)")
    quantity: int = Field(default=1, description="Número de instancias o unidades")
    estimated_unit_cost_usd: float = Field(description="Costo unitario mensual base en USD")
    reason: str = Field(description="Justificación técnica de la elección")

class ArchitectureScenario(BaseModel):
    scenario_type: str = Field(description="Cost-Optimized | Recommended-Production | High-Availability-Enterprise")
    scenario_summary: str = Field(description="Explicación del enfoque y compromisos (SLA, resiliencia vs costo)")
    services: List[AWSServiceItem]

class EnterpriseEvaluationResult(BaseModel):
    current_platform_analysis: str = Field(description="Diagnóstico exhaustivo de la plataforma legacy detectada")
    detected_architecture_pattern: str = Field(description="Monolith | Microservices | Serverless Jamstack | Event-Driven")
    migration_strategy: str = Field(description="Rehost | Replatform | Refactor | Repurchase")
    well_architected_notes: List[str] = Field(description="Observaciones clave de seguridad, confiabilidad y rendimiento")
    scenarios: List[ArchitectureScenario]