import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException, status
from app.config import settings
from app.utils.logger import app_logger

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}


async def save_upload_file(file: UploadFile, subfolder: str = "") -> str:
    """Save an uploaded file and return its path."""
    if file.size and file.size > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB",
        )

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File type not supported. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    unique_name = f"{uuid.uuid4()}{ext}"
    save_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
    os.makedirs(save_dir, exist_ok=True)
    file_path = os.path.join(save_dir, unique_name)

    content = await file.read()
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    app_logger.info(f"File saved: {file_path}")
    return file_path


def delete_file(file_path: str) -> bool:
    """Delete a file if it exists."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        app_logger.error(f"Failed to delete file {file_path}: {e}")
    return False
