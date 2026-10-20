import os
from pathlib import Path
from typing import Dict, Any, List

class PaaSDetectorService:
    @staticmethod
    def inspect_paas_artifacts(source_path: str) -> Dict[str, Any]:
        """
        Detecta si el proyecto está configurado para Vercel, Render, Heroku, Netlify,
        Railway, Fly.io, Supabase, Firebase u otros proveedores PaaS/IaaS.
        """
        path = Path(source_path)
        detected_configs: List[str] = []
        platforms_detected: List[str] = []
        origin_hint = "Desconocido / On-Premise"

        # 1. Vercel
        if (path / "vercel.json").exists() or (path / ".vercel").exists():
            platforms_detected.append("Vercel")
            detected_configs.append("vercel.json")
            origin_hint = "Vercel (Jamstack / Edge Serverless Functions)"

        # 2. Render
        if (path / "render.yaml").exists():
            platforms_detected.append("Render")
            detected_configs.append("render.yaml")
            origin_hint = "Render (Web Services / Managed Databases / Workers)"

        # 3. Heroku
        if (path / "Procfile").exists() or (path / "app.json").exists():
            platforms_detected.append("Heroku")
            if (path / "Procfile").exists():
                detected_configs.append("Procfile")
            if (path / "app.json").exists():
                detected_configs.append("app.json")
            if origin_hint.startswith("Desconocido"):
                origin_hint = "Heroku (Dynos / PostgreSQL Add-on)"

        # 4. Netlify
        if (path / "netlify.toml").exists() or (path / "_redirects").exists():
            platforms_detected.append("Netlify")
            detected_configs.append("netlify.toml")
            if origin_hint.startswith("Desconocido"):
                origin_hint = "Netlify (Static Assets / Serverless Functions)"

        # 5. Railway
        if (path / "railway.json").exists() or (path / "railway.toml").exists():
            platforms_detected.append("Railway")
            detected_configs.append("railway.json")
            if origin_hint.startswith("Desconocido"):
                origin_hint = "Railway (Containerized Managed Services)"

        # 6. Fly.io
        if (path / "fly.toml").exists():
            platforms_detected.append("Fly.io")
            detected_configs.append("fly.toml")
            if origin_hint.startswith("Desconocido"):
                origin_hint = "Fly.io (MicroVMs en el Edge)"

        # 7. Supabase
        if (path / "supabase").exists() or (path / "supabase" / "config.toml").exists():
            platforms_detected.append("Supabase")
            detected_configs.append("supabase/config.toml")

        # 8. Firebase
        if (path / "firebase.json").exists():
            platforms_detected.append("Firebase")
            detected_configs.append("firebase.json")
            if origin_hint.startswith("Desconocido"):
                origin_hint = "Firebase (Hosting / Cloud Functions / Firestore)"

        # 9. Docker / Docker Compose
        has_dockerfile = (path / "Dockerfile").exists()
        has_compose = (path / "docker-compose.yml").exists() or (path / "docker-compose.yaml").exists()
        if has_dockerfile:
            detected_configs.append("Dockerfile")
        if has_compose:
            detected_configs.append("docker-compose.yml")

        if origin_hint.startswith("Desconocido"):
            if has_compose:
                origin_hint = "Docker Compose (Multi-contenedor Local / VPS)"
            elif has_dockerfile:
                origin_hint = "Contenedor Docker Autónomo"

        return {
            "origin_hint": origin_hint,
            "platforms_detected": platforms_detected,
            "vercel_detected": "Vercel" in platforms_detected,
            "render_detected": "Render" in platforms_detected,
            "heroku_detected": "Heroku" in platforms_detected,
            "has_dockerfile": has_dockerfile,
            "has_docker_compose": has_compose,
            "detected_configs": detected_configs
        }

paas_detector = PaaSDetectorService()