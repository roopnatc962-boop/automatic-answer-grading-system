from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    student_name = Column(String(255), nullable=True)
    raw_answer = Column(Text, nullable=False)
    score = Column(Integer, nullable=True)
    feedback_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question")

