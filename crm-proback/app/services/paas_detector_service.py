import os
from pathlib import Path
from typing import Dict, Any

class PaaSDetectorService:
    @staticmethod
    def inspect_paas_artifacts(source_path: str) -> Dict[str, Any]:
        """Detecta si el proyecto está configurado para Vercel, Render u otro PaaS."""
        path = Path(source_path)
        findings = {
            "origin_hint": "Desconocido / On-Premise",
            "vercel_detected": False,
            "render_detected": False,
            "detected_configs": []
        }

        # Detección de Vercel
        if (path / "vercel.json").exists() or (path / ".vercel").exists():
            findings["vercel_detected"] = True
            findings["origin_hint"] = "Vercel (Jamstack / Serverless)"
            findings["detected_configs"].append("vercel.json")

        # Detección de Render
        if (path / "render.yaml").exists():
            findings["render_detected"] = True
            findings["origin_hint"] = "Render (Web Services / Managed Databases / Workers)"
            findings["detected_configs"].append("render.yaml")

        # Detección de Dockerfile (común en despliegues PaaS)
        if (path / "Dockerfile").exists():
            findings["detected_configs"].append("Dockerfile")

        return findings

paas_detector = PaaSDetectorService()