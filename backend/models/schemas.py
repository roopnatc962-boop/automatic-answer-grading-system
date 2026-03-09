from typing import List, Optional
from datetime import datetime

from pydantic import BaseModel, Field
from pydantic.config import ConfigDict


class DeductionItem(BaseModel):
    category: str
    marks_deducted: float = Field(..., ge=0)
    reason: str


class GradingRequest(BaseModel):
    question: str
    model_answer: str
    student_answer: str
    marking_scheme: str
    total_marks: float
    student_name: Optional[str] = None
    question_id: Optional[int] = None


class GradingResponse(BaseModel):
    score: float
    percentage: float
    missing_points: List[str]
    strong_points: List[str]
    deduction_map: List[DeductionItem]
    overall_feedback: str


class UploadAnswerResponse(BaseModel):
    extracted_text: str


class QuestionCreate(BaseModel):
    title: str
    question_text: str
    model_answer: str
    marking_scheme: str
    total_marks: int


class QuestionOut(BaseModel):
    id: int
    title: str
    question_text: str
    model_answer: str
    marking_scheme: str
    total_marks: int

    model_config = ConfigDict(from_attributes=True)


class SubmissionOut(BaseModel):
    id: int
    question_id: Optional[int]
    student_name: Optional[str]
    raw_answer: str
    score: Optional[float]
    feedback_json: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

