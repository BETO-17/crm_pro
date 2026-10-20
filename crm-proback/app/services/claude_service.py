import os
import json
import logging
from typing import Optional, Dict, Any
# pyrefly: ignore[missing-import]
import anthropic
from app.core.config import settings

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY") or getattr(settings, "CLAUDE_API_KEY", "")
        self.model_name = os.getenv("CLAUDE_MODEL") or getattr(settings, "CLAUDE_MODEL", "claude-sonnet-5-5")
        self._client: Optional[anthropic.Anthropic] = None

    def _get_client(self) -> Optional[anthropic.Anthropic]:
        if not self._client and self.api_key:
            self._client = anthropic.Anthropic(api_key=self.api_key)
        return self._client

    def generate_sql_and_analysis(self, table_name: str, schema: str, question: str) -> Dict[str, Any]:
        """Genera SQL y explicación con Claude Sonnet 5.5 optimizando tokens."""
        client = self._get_client()
        if not client:
            return {
                "sql": None,
                "explanation": "No se encontró CLAUDE_API_KEY en la configuración."
            }

        prompt = f"""Eres un analista de datos y experto en PostgreSQL sobre Supabase.
Tabla: {table_name}
Esquema: {schema}
Pregunta del usuario: {question}

Responde estrictamente con un objeto JSON (sin markdown ni explicaciones adicionales) con dos claves:
"sql": la sentencia SQL PostgreSQL en texto crudo.
"explanation": explicación clara y concisa en español (máximo 2 párrafos)."""

        try:
            msg = client.messages.create(
                model=self.model_name,
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )
            raw_text = "".join(getattr(b, "text", "") for b in msg.content if hasattr(b, "text") or getattr(b, "type", None) == "text").strip()
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            return json.loads(raw_text)
        except Exception as e:
            logger.error(f"Error en generate_sql_and_analysis con Claude: {e}")
            return {
                "sql": None,
                "explanation": f"Error conectando con Claude ({self.model_name}): {str(e)}"
            }

    def compare_datasets(
        self,
        table_a: str,
        schema_a: str,
        summary_a: dict,
        table_b: str,
        schema_b: str,
        summary_b: dict,
        question: str = ""
    ) -> str:
        """Comparativa concisa de métricas y retail con Claude Sonnet 5.5."""
        client = self._get_client()
        if not client:
            return "CLAUDE_API_KEY no configurada."

        prompt = f"""Eres un analista ejecutivo de retail y métricas de negocio.
Tabla A: {table_a} (Datos: {json.dumps(summary_a, default=str)})
Tabla B: {table_b} (Datos: {json.dumps(summary_b, default=str)})
Contexto: {question or "Comparar precios, márgenes y tendencias clave."}

Genera un informe comparativo ejecutivo en español, conciso (máximo 3 párrafos y viñetas)."""

        try:
            msg = client.messages.create(
                model=self.model_name,
                max_tokens=1500,
                messages=[{"role": "user", "content": prompt}]
            )
            return "".join(getattr(b, "text", "") for b in msg.content if hasattr(b, "text") or getattr(b, "type", None) == "text").strip()
        except Exception as e:
            return f"Error generando comparativa con Claude: {str(e)}"

claude_service = ClaudeService()
