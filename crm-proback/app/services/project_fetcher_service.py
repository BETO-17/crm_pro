import os
import shutil
import tempfile
import zipfile
import asyncio
import subprocess
from typing import Optional

class ProjectFetcherService:
    @staticmethod
    def extract_zip(file_bytes: bytes, filename: str) -> str:
        """Extrae un archivo .zip subido a una carpeta temporal."""
        temp_dir = tempfile.mkdtemp(prefix="eval_zip_")
        zip_path = os.path.join(temp_dir, filename)

        with open(zip_path, "wb") as f:
            f.write(file_bytes)

        extract_dir = os.path.join(temp_dir, "source")
        os.makedirs(extract_dir, exist_ok=True)
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_dir)

        return extract_dir

    @staticmethod
    async def clone_github_repo(repo_url: str, token: Optional[str] = None) -> str:
        """Clona un repositorio público o privado de GitHub con clonación ligera."""
        temp_dir = tempfile.mkdtemp(prefix="eval_git_")
        target_dir = os.path.join(temp_dir, "source")

        # Inyectar token si es un repositorio privado
        clean_url = repo_url.strip()
        if token and "github.com" in clean_url:
            clean_url = clean_url.replace("https://", f"https://{token}@")

        cmd = f'git clone --depth 1 "{clean_url}" "{target_dir}"'

        def _do_clone():
            return subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="ignore"
            )

        # Ejecución segura en hilo de fondo para compatibilidad total con Windows y uvicorn
        result = await asyncio.to_thread(_do_clone)

        if result.returncode != 0:
            shutil.rmtree(temp_dir, ignore_errors=True)
            err_msg = result.stderr.strip() or result.stdout.strip() or "Código de salida distinto de 0"
            raise RuntimeError(f"Error al clonar repositorio de GitHub: {err_msg}")

        return target_dir

project_fetcher = ProjectFetcherService()