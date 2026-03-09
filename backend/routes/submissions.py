from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.database import get_db
from models.question import Question
from models.schemas import QuestionCreate, QuestionOut, SubmissionOut
from models.submission import Submission


router = APIRouter(tags=["submissions"])


@router.get("/submissions", response_model=List[SubmissionOut])
def list_submissions(db: Session = Depends(get_db)) -> List[SubmissionOut]:
    return db.query(Submission).order_by(Submission.created_at.desc()).all()


@router.post("/questions", response_model=QuestionOut)
def create_question(payload: QuestionCreate, db: Session = Depends(get_db)) -> QuestionOut:
    question = Question(
        title=payload.title,
        question_text=payload.question_text,
        model_answer=payload.model_answer,
        marking_scheme=payload.marking_scheme,
        total_marks=payload.total_marks,
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.get("/questions", response_model=List[QuestionOut])
def list_questions(db: Session = Depends(get_db)) -> List[QuestionOut]:
    return db.query(Question).all()

