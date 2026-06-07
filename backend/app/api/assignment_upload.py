from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

import shutil
import os

from app.services.file_parser_service import (
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_txt
)

router = APIRouter()


@router.post("/")
async def upload_assignment(
    file: UploadFile = File(...)
):

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    file_path = f"uploads/{file.filename}"

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    extension = file.filename.split(".")[-1].lower()

    if extension == "pdf":
        text = extract_text_from_pdf(
            file_path
        )

    elif extension == "docx":
        text = extract_text_from_docx(
            file_path
        )

    elif extension == "txt":
        text = extract_text_from_txt(
            file_path
        )

    else:
        return {
            "error":
            "Unsupported file type"
        }

    return {
        "filename": file.filename,
        "text": text[:2000]
    }