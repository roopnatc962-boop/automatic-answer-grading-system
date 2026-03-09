from typing import Tuple

import pytesseract  # type: ignore
from fastapi import UploadFile, HTTPException
from PIL import Image  # type: ignore


async def extract_text_from_image(file: UploadFile) -> str:
    try:
        image = Image.open(file.file)
    except Exception as exc:  # pragma: no cover - runtime safeguard
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}")

    try:
        text = pytesseract.image_to_string(image)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"OCR failed: {exc}")

    return text.strip()


async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Basic PDF OCR pipeline.
    For production use you may want to use pdfplumber or pdf2image for better control.
    """
    try:
        import fitz  # type: ignore  # PyMuPDF
    except ImportError as exc:  # pragma: no cover
        raise HTTPException(
            status_code=500,
            detail="PDF OCR requires PyMuPDF (fitz) to be installed.",
        ) from exc

    try:
        file.file.seek(0)
        file_bytes = await file.read()
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=f"Invalid PDF file: {exc}")

    texts = []
    for page in doc:
        text = page.get_text()
        if not text:
            pix = page.get_pixmap()
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            text = pytesseract.image_to_string(img)
        if text:
            texts.append(text)

    if not texts:
        raise HTTPException(status_code=500, detail="No text could be extracted from PDF.")

    return "\n".join(t.strip() for t in texts if t).strip()


async def extract_text(file: UploadFile) -> Tuple[str, str]:
    content_type = (file.content_type or "").lower()
    if "image" in content_type:
        text = await extract_text_from_image(file)
        return text, "image"
    if "pdf" in content_type:
        text = await extract_text_from_pdf(file)
        return text, "pdf"

    raise HTTPException(status_code=400, detail="Unsupported file type for OCR.")

