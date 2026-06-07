from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

import shutil
import os

from app.services.assignment_service import (
    evaluate_assignment
)

from app.services.history_service import (
    save_history
)

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

    evaluation = evaluate_assignment(
    text[:5000]
)

    await save_history(
    user_email="anonymous",
    history_type="assignment_upload",
    question=file.filename,
    answer=evaluation
)

    return {
    "filename": file.filename,
    "evaluation": evaluation
}