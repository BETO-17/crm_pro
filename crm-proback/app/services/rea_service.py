import os
import sys
import json
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional

class REAService:
    """
    Servicio de Ingeniería Inversa y Auditoría Estática de Arquitectura.
    Integra herramientas del motor REA (tools/rea) y análisis heurístico profundo
    de código fuente, dependencias, frameworks, bases de datos y configuraciones PaaS/Cloud.
    """

    def __init__(self):
        # Localiza la carpeta tools/rea relativa a crm-proback
        base_dir = Path(__file__).resolve().parent.parent.parent
        self.rea_tools_dir = base_dir / "tools" / "rea"
        self.rea_cli_path = self.rea_tools_dir / "dist" / "cli" / "javascriptApplicationAnalysis.js"

    async def analyze_project(self, source_dir: str) -> Dict[str, Any]:
        """
        Ejecuta un análisis exhaustivo del proyecto:
        1. Intenta ejecutar el extractor estático de REA (si aplica y Node está disponible).
        2. Realiza un escaneo heurístico de dependencias, lenguajes, ORMs y arquitectura.
        """
        source_path = Path(source_dir)
        if not source_path.exists():
            return {
                "success": False,
                "error": f"El directorio {source_dir} no existe.",
                "data": {}
            }

        # 1. Análisis Heurístico Estático
        heuristic_data = self._inspect_codebase(source_path)

        # 2. Análisis con REA si es proyecto JS/TS/Node
        rea_engine_data = await self._run_rea_subagent(source_path)
        if rea_engine_data:
            heuristic_data["rea_engine_findings"] = rea_engine_data

        return {
            "success": True,
            "data": heuristic_data,
            "raw_data": heuristic_data
        }

    async def _run_rea_subagent(self, source_path: Path) -> Optional[Dict[str, Any]]:
        """Invoca el motor REA vía Node.js con tiempo de espera seguro."""
        try:
            if not self.rea_cli_path.exists():
                return None

            # Script en línea para invocar runCliJavaScriptApplicationAnalysis de forma aislada
            node_script = (
                "import('./dist/cli/javascriptApplicationAnalysis.js').then(async m => {"
                f"  const res = await m.runCliJavaScriptApplicationAnalysis({{"
                f"    input_path: {json.dumps(str(source_path))},"
                f"    format: 'directory',"
                f"    integrity_policy: 'record-and-continue'"
                f"  }});"
                "  console.log('__REA_JSON_START__' + JSON.stringify(res) + '__REA_JSON_END__');"
                "}).catch(err => {"
                "  console.error(err.message);"
                "  process.exit(1);"
                "});"
            )

            def _run_node():
                return subprocess.run(
                    ["node", "-e", node_script],
                    cwd=str(self.rea_tools_dir),
                    capture_output=True,
                    text=True,
                    encoding="utf-8",
                    errors="ignore",
                    timeout=10.0
                )

            res = await asyncio.to_thread(_run_node)
            out_str = res.stdout
            if "__REA_JSON_START__" in out_str:
                json_part = out_str.split("__REA_JSON_START__")[1].split("__REA_JSON_END__")[0]
                parsed = json.loads(json_part)
                if isinstance(parsed, dict) and not parsed.get("error"):
                    return {
                        "summary": parsed.get("summary"),
                        "statistics": parsed.get("statistics"),
                        "electron_boundaries": parsed.get("electron_boundaries")
                    }
        except Exception:
            pass
        return None

    def _inspect_codebase(self, source_path: Path) -> Dict[str, Any]:
        """Audita el árbol de directorios identificando dependencias, patrones y configs."""
        files_found = []
        languages = set()
        dependencies = []
        frameworks = set()
        databases = set()
        queues_and_workers = set()
        cloud_assets = set()
        configs = []

        ignore_dirs = {
            ".git", "node_modules", "__pycache__", "venv", ".venv", "env",
            "dist", "build", ".next", ".nuxt", "coverage", ".idea", ".vscode"
        }

        total_files = 0
        for root, dirs, files in os.walk(source_path):
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            for file in files:
                total_files += 1
                rel_path = os.path.relpath(os.path.join(root, file), source_path).replace("\\", "/")
                files_found.append(rel_path)

                # Clasificación de lenguaje
                ext = Path(file).suffix.lower()
                if ext in [".js", ".jsx", ".mjs"]:
                    languages.add("JavaScript")
                elif ext in [".ts", ".tsx"]:
                    languages.add("TypeScript")
                elif ext in [".py"]:
                    languages.add("Python")
                elif ext in [".go"]:
                    languages.add("Go")
                elif ext in [".java"]:
                    languages.add("Java")
                elif ext in [".php"]:
                    languages.add("PHP")
                elif ext in [".rb"]:
                    languages.add("Ruby")
                elif ext in [".cs"]:
                    languages.add(".NET / C#")
                elif ext in [".rs"]:
                    languages.add("Rust")

                # Archivos de configuración conocidos
                if file in [
                    "package.json", "requirements.txt", "pyproject.toml", "Pipfile",
                    "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yaml",
                    "render.yaml", "vercel.json", "netlify.toml", "Procfile", "fly.toml",
                    "serverless.yml", "template.yaml", "cdk.json", "main.tf", "schema.prisma"
                ]:
                    configs.append(rel_path)

        # Inspección de package.json
        pkg_json_path = source_path / "package.json"
        if pkg_json_path.exists():
            try:
                with open(pkg_json_path, "r", encoding="utf-8", errors="ignore") as f:
                    pkg = json.load(f)
                    all_deps = {
                        **pkg.get("dependencies", {}),
                        **pkg.get("devDependencies", {})
                    }
                    dependencies.extend(list(all_deps.keys())[:50])

                    # Detección de frameworks JS
                    if "next" in all_deps:
                        frameworks.add("Next.js (SSR / Static)")
                    if "react" in all_deps:
                        frameworks.add("React")
                    if "vue" in all_deps or "nuxt" in all_deps:
                        frameworks.add("Vue / Nuxt")
                    if "@nestjs/core" in all_deps:
                        frameworks.add("NestJS (Backend Microservices)")
                    if "express" in all_deps:
                        frameworks.add("Express (Node.js API)")
                    if "fastify" in all_deps:
                        frameworks.add("Fastify")

                    # Detección de Bases de Datos
                    if any(k in all_deps for k in ["pg", "pg-promise", "postgres", "typeorm", "prisma", "@prisma/client"]):
                        databases.add("PostgreSQL")
                    if any(k in all_deps for k in ["mysql", "mysql2"]):
                        databases.add("MySQL")
                    if any(k in all_deps for k in ["mongoose", "mongodb"]):
                        databases.add("MongoDB")
                    if any(k in all_deps for k in ["redis", "ioredis"]):
                        databases.add("Redis Cache")
                    if "@supabase/supabase-js" in all_deps:
                        databases.add("Supabase (PostgreSQL Cloud)")

                    # Colas / Workers
                    if any(k in all_deps for k in ["bull", "bullmq", "bee-queue", "amqplib", "kafkajs"]):
                        queues_and_workers.add("BullMQ / Mensajería asíncrona")
            except Exception:
                pass

        # Inspección de requirements.txt / pyproject.toml
        req_path = source_path / "requirements.txt"
        if req_path.exists():
            try:
                with open(req_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read().lower()
                    if "fastapi" in content:
                        frameworks.add("FastAPI (Python REST)")
                    if "django" in content:
                        frameworks.add("Django (Python Monolith/API)")
                    if "flask" in content:
                        frameworks.add("Flask")
                    if "psycopg2" in content or "asyncpg" in content or "sqlalchemy" in content:
                        databases.add("PostgreSQL")
                    if "pymongo" in content:
                        databases.add("MongoDB")
                    if "redis" in content:
                        databases.add("Redis Cache")
                    if "celery" in content:
                        queues_and_workers.add("Celery Background Workers")
                    if "boto3" in content:
                        cloud_assets.add("AWS SDK (boto3)")
            except Exception:
                pass

        # Detección de contenedores
        has_docker = (source_path / "Dockerfile").exists()
        has_compose = (source_path / "docker-compose.yml").exists() or (source_path / "docker-compose.yaml").exists()

        # Deducción de patrón arquitectónico
        if len(frameworks) >= 2 or ("NestJS" in str(frameworks) and "React" in str(frameworks)):
            inferred_pattern = "Microservicios / Aplicación Desacoplada (Frontend SPA + API Backend)"
        elif "Next.js" in str(frameworks) or "Nuxt" in str(frameworks):
            inferred_pattern = "Serverless Jamstack con SSR / Edge Rendering"
        elif "Django" in str(frameworks) or "Laravel" in str(frameworks):
            inferred_pattern = "Monolito Modular Clásico"
        elif any("FastAPI" in f or "Express" in f for f in frameworks):
            inferred_pattern = "Servicio de API REST de Alto Rendimiento"
        else:
            inferred_pattern = "Arquitectura Web Multicapa"

        return {
            "total_files": total_files,
            "primary_languages": list(languages),
            "inferred_pattern": inferred_pattern,
            "frameworks": list(frameworks),
            "databases": list(databases),
            "queues_and_workers": list(queues_and_workers),
            "cloud_assets": list(cloud_assets),
            "has_docker": has_docker,
            "has_docker_compose": has_compose,
            "detected_configs": configs,
            "sample_files": files_found[:30]
        }

rea_service = REAService()
