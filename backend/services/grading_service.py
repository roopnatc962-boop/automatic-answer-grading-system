import json
import os
from typing import Any, Dict

from fastapi import HTTPException

from models.schemas import GradingRequest, GradingResponse


GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta"


def _get_gemini_api_key() -> str:
    """
    Prefer GEMINI_API_KEY, but fall back to OPENAI_API_KEY for convenience
    (many users already set it in their terminal during setup).
    """
    return os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or ""


def _get_gemini_model() -> str:
    return os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"


def _call_gemini(prompt: str) -> str:
    api_key = _get_gemini_api_key()
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Missing API key. Set GEMINI_API_KEY (recommended).",
        )

    try:
        import httpx  # type: ignore
    except ImportError as exc:  # pragma: no cover
        raise HTTPException(
            status_code=500,
            detail="httpx is not installed (required to call Gemini over HTTP).",
        ) from exc

    model = _get_gemini_model()
    url = f"{GEMINI_API_BASE}/models/{model}:generateContent"
    params = {"key": api_key}

    body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "topP": 0.95,
            "maxOutputTokens": 2048,
        },
    }

    try:
        with httpx.Client(timeout=60.0) as client:
            resp = client.post(url, params=params, json=body)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=502, detail=f"Gemini API request failed: {exc}")

    if resp.status_code >= 400:
        # Don't echo keys; include provider error payload if present.
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error ({resp.status_code}): {detail}",
        )

    data = resp.json()
    try:
        return (
            data["candidates"][0]["content"]["parts"][0].get("text", "")  # type: ignore[index]
            or ""
        )
    except Exception:  # pragma: no cover
        raise HTTPException(status_code=502, detail="Unexpected Gemini response format.")


def build_grading_prompt(payload: GradingRequest) -> str:
    return (
        "You are an expert examiner. Grade the following student answer.\n\n"
        f"Question:\n{payload.question}\n\n"
        f"Model Answer:\n{payload.model_answer}\n\n"
        f"Student Answer:\n{payload.student_answer}\n\n"
        f"Marking Scheme:\n{payload.marking_scheme}\n\n"
        f"Total Marks:\n{payload.total_marks}\n\n"
        "Return ONLY a valid JSON object with exactly these fields:\n"
        "{\n"
        '  "score": number (out of total marks),\n'
        "  \"percentage\": number,\n"
        "  \"missing_points\": string[],\n"
        "  \"strong_points\": string[],\n"
        "  \"deduction_map\": { \"category\": string, \"marks_deducted\": number, \"reason\": string }[],\n"
        "  \"overall_feedback\": string\n"
        "}\n\n"
        "IMPORTANT: Return ONLY the JSON object, no markdown, no explanations, no additional text. "
        "Ensure all strings are properly escaped and the JSON is complete and valid."
    )


def grade_answer(payload: GradingRequest) -> GradingResponse:
    prompt = build_grading_prompt(payload)
    content = _call_gemini(
        "You are a strict but fair examiner for academic answers.\n\n" + prompt
    )
    
    # Debug: log the raw response
    print(f"Raw Gemini response: {content}")
    
    try:
        # Robust JSON extraction from Gemini response
        # 1. Try raw JSON
        # 2. Try extraction from markdown code blocks
        # 3. Try finding the first '{' and last '}'
        
        json_str = content.strip()
        
        if "```json" in json_str:
            parts = json_str.split("```json")
            if len(parts) > 1:
                json_str = parts[1].split("```")[0].strip()
        elif "```" in json_str:
            parts = json_str.split("```")
            if len(parts) > 1:
                json_str = parts[1].strip()
        
        if not (json_str.startswith("{") and json_str.endswith("}")):
            start = json_str.find("{")
            end = json_str.rfind("}")
            if start != -1 and end != -1:
                json_str = json_str[start : end + 1]
        
        data: Dict[str, Any] = json.loads(json_str)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse grading JSON: {str(exc)}. Raw response: {content[:200]}...",
        )

    # Fallbacks for robustness
    score = float(data.get("score", 0))
    percentage = float(data.get("percentage", (score / payload.total_marks) * 100))

    missing_points = data.get("missing_points") or []
    strong_points = data.get("strong_points") or []
    deduction_map = data.get("deduction_map") or []
    overall_feedback = data.get("overall_feedback") or ""

    return GradingResponse(
        score=score,
        percentage=percentage,
        missing_points=missing_points,
        strong_points=strong_points,
        deduction_map=deduction_map,
        overall_feedback=overall_feedback,
    )

