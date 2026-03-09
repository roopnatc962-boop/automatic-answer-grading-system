from sqlalchemy import Column, Integer, String, Text

from .database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    question_text = Column(Text, nullable=False)
    model_answer = Column(Text, nullable=False)
    marking_scheme = Column(Text, nullable=True)
    total_marks = Column(Integer, nullable=False, default=10)

