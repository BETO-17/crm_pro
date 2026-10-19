import os
import shutil
import tempfile
import zipfile
import asyncio
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
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_dir)

        return extract_dir

    @staticmethod
    async def clone_github_repo(repo_url: str, token: Optional[str] = None) -> str:
        """Clona un repositorio público o privado de GitHub con clonación ligera."""
        temp_dir = tempfile.mkdtemp(prefix="eval_git_")
        target_dir = os.path.join(temp_dir, "source")

        # Inyectar token si es un repositorio privado
        if token and "github.com" in repo_url:
            repo_url = repo_url.replace("https://", f"https://{token}@")

        cmd = f'git clone --depth 1 "{repo_url}" "{target_dir}"'

        process = await asyncio.create_subprocess_shell(
            cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        _, stderr = await process.communicate()

        if process.returncode != 0:
            shutil.rmtree(temp_dir, ignore_errors=True)
            raise RuntimeError(f"Error al clonar repositorio de GitHub: {stderr.decode('utf-8', errors='ignore')}")

        return target_dir

project_fetcher = ProjectFetcherService()