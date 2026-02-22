"""
Local file storage service.
Saves audio files to /uploads folder on disk.
"""
import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".webm", ".mp3", ".wav", ".ogg", ".m4a", ".mp4"}
MAX_FILE_SIZE_MB = 25


def get_upload_path(filename: str) -> Path:
    return UPLOAD_DIR / filename


def generate_audio_filename(user_id: str, extension: str = ".webm") -> str:
    return f"{user_id}_{uuid.uuid4().hex}{extension}"


async def save_audio_file(file: UploadFile, user_id: str) -> dict:
    original_name = file.filename or "audio.webm"
    ext = Path(original_name).suffix.lower() or ".webm"
    if ext not in ALLOWED_EXTENSIONS:
        ext = ".webm"

    filename = generate_audio_filename(user_id, ext)
    file_path = get_upload_path(filename)

    size_bytes = 0
    async with aiofiles.open(file_path, "wb") as out:
        while chunk := await file.read(1024 * 64):
            size_bytes += len(chunk)
            if size_bytes > MAX_FILE_SIZE_MB * 1024 * 1024:
                file_path.unlink(missing_ok=True)
                raise ValueError(f"File too large. Max {MAX_FILE_SIZE_MB}MB.")
            await out.write(chunk)

    return {
        "filename": filename,
        "path": str(file_path),
        "size_bytes": size_bytes,
        "extension": ext,
    }


def delete_audio_file(filename: str) -> bool:
    file_path = get_upload_path(filename)
    if file_path.exists():
        file_path.unlink()
        return True
    return False


def get_audio_file_path(filename: str) -> Path:
    path = get_upload_path(filename)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {filename}")
    return path
