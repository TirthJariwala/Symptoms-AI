import shutil
import uuid
from pathlib import Path
from typing import BinaryIO

from app.core.config import settings
from app.core.logger import logger


class LocalStorageService:
    def __init__(self, base_path: Path = settings.local_storage_path) -> None:
        self.base_path = base_path
        (self.base_path / "raw").mkdir(parents=True, exist_ok=True)

    def save(self, file_obj: BinaryIO, filename: str) -> str:
        ext = Path(filename).suffix
        unique_name = f"{uuid.uuid4().hex}{ext}"
        dest = self.base_path / "raw" / unique_name

        with open(dest, "wb") as out:
            shutil.copyfileobj(file_obj, out)

        logger.info(f"File saved locally → {dest}")
        return str(dest)

    def delete(self, file_path: str) -> None:
        p = Path(file_path)
        if p.exists():
            p.unlink()
            logger.debug(f"File deleted: {file_path}")


# ── Factory function ──────────────────────────────────────────────

def get_storage_service() -> LocalStorageService:
    if settings.storage_backend == "local":
        return LocalStorageService()
    # TODO: return S3StorageService() for s3 backend
    raise NotImplementedError(f"Storage backend '{settings.storage_backend}' not yet implemented.")


storage_service = get_storage_service()