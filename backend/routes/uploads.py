from fastapi import APIRouter, File, UploadFile

from models.schemas import UploadAnswerResponse
from services.ocr_service import extract_text


router = APIRouter(tags=["uploads"])


@router.post("/upload-answer", response_model=UploadAnswerResponse)
async def upload_answer(file: UploadFile = File(...)) -> UploadAnswerResponse:
    extracted_text, _ = await extract_text(file)
    return UploadAnswerResponse(extracted_text=extracted_text)

