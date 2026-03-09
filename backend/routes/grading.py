from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.database import get_db, init_db
from models.schemas import GradingRequest, GradingResponse
from models.submission import Submission
from services.grading_service import grade_answer


router = APIRouter(tags=["grading"])


@router.on_event("startup")
def _on_startup() -> None:
    init_db()


@router.post("/submit-answer", response_model=GradingResponse)
def submit_answer(payload: GradingRequest, db: Session = Depends(get_db)) -> GradingResponse:
    result = grade_answer(payload)

    submission = Submission(
        question_id=payload.question_id,
        student_name=payload.student_name,
        raw_answer=payload.student_answer,
        score=result.score,
        feedback_json=result.json(),
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return result

