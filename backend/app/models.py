"""Esquemas de entrada y salida de la API (validacion con Pydantic)."""
from typing import Literal

from pydantic import BaseModel, Field, field_validator

Level = Literal["sin_experiencia", "junior", "intermedio"]
InterviewType = Literal["comportamiento", "tecnica", "mixta"]
Category = Literal["comportamiento", "tecnica"]


# ---------- POST /api/interview/start ----------
class StartRequest(BaseModel):
    job_title: str = Field(min_length=2, max_length=120)
    job_description: str = Field(default="", max_length=1200)
    experience_level: Level
    interview_type: InterviewType

    @field_validator("job_title", "job_description")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()


class Question(BaseModel):
    id: int
    text: str
    category: Category


class StartResponse(BaseModel):
    session_id: str
    questions: list[Question]


# ---------- POST /api/interview/answer ----------
class AnswerRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=64)
    question_id: int = Field(ge=1)
    answer: str = Field(min_length=1, max_length=2000)

    @field_validator("answer")
    @classmethod
    def not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("La respuesta no puede estar vacia")
        return v


class Criteria(BaseModel):
    claridad: float
    estructura: float
    relevancia: float
    ejemplos: float


class AnswerResponse(BaseModel):
    question_id: int
    score: float
    criteria: Criteria
    strengths: list[str]
    improvements: list[str]
    improved_answer: str


# ---------- POST /api/interview/summary ----------
class SummaryRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=64)


class QuestionReview(BaseModel):
    question_id: int
    text: str
    category: Category
    score: float


class SummaryResponse(BaseModel):
    overall_score: float
    summary: str
    criteria_avg: Criteria
    top_strengths: list[str]
    top_improvements: list[str]
    practice_plan: list[str]
    question_reviews: list[QuestionReview]
