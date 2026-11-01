"""API de EntrevistaPro (FastAPI)."""
import os
import time
from collections import defaultdict, deque

from dotenv import load_dotenv

load_dotenv()

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from . import agent, storage  # noqa: E402
from .models import (  # noqa: E402
    AnswerRequest,
    AnswerResponse,
    Criteria,
    Question,
    QuestionReview,
    StartRequest,
    StartResponse,
    SummaryRequest,
    SummaryResponse,
)

app = FastAPI(title="EntrevistaPro API", version="1.0.0")

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# ------------------------------------------------ limite de solicitudes por IP
_hits: dict[str, deque] = defaultdict(deque)


def rate_limit(request: Request) -> None:
    limit = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    q = _hits[ip]
    while q and now - q[0] > 60:
        q.popleft()
    if len(q) >= limit:
        raise HTTPException(status_code=429, detail="Demasiadas solicitudes. Espera un momento.")
    q.append(now)


router = APIRouter(prefix="/api", dependencies=[Depends(rate_limit)])


def _run_agent(fn, *args):
    """Ejecuta una funcion del agente y traduce sus errores a HTTP."""
    try:
        return fn(*args)
    except agent.AgentRateLimit as e:
        print("AGENTE 429:", repr(e), repr(e.__cause__))
        raise HTTPException(status_code=429, detail="El servicio de IA esta ocupado. Intenta de nuevo en unos segundos.")
    except agent.AgentError as e:
        print("AGENTE ERROR:", repr(e), repr(e.__cause__))
        raise HTTPException(status_code=502, detail="Fallo el servicio de IA. Intenta de nuevo.")

def _load(session_id: str) -> dict:
    session = storage.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Sesion no encontrada o expirada.")
    return session


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/interview/start", response_model=StartResponse)
def start_interview(req: StartRequest):
    questions = _run_agent(
        agent.generate_questions,
        req.job_title, req.job_description, req.experience_level, req.interview_type,
    )
    session_id = storage.create_session(
        {
            "job_title": req.job_title,
            "experience_level": req.experience_level,
            "interview_type": req.interview_type,
            "questions": questions,
            "answers": {},
        }
    )
    return StartResponse(session_id=session_id, questions=[Question(**q) for q in questions])


@router.post("/interview/answer", response_model=AnswerResponse)
def answer_question(req: AnswerRequest):
    session = _load(req.session_id)
    question = next((q for q in session["questions"] if q["id"] == req.question_id), None)
    if question is None:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada en esta sesion.")

    result = _run_agent(
        agent.evaluate_answer,
        session["job_title"], session["experience_level"], question["text"], req.answer,
    )
    c = result["criteria"]
    score = round(sum(c.values()) / 4, 1)

    session["answers"][str(req.question_id)] = {
        "answer": req.answer,
        "score": score,
        **result,
    }
    storage.save_session(req.session_id, session)

    return AnswerResponse(
        question_id=req.question_id,
        score=score,
        criteria=Criteria(**c),
        strengths=result["strengths"],
        improvements=result["improvements"],
        improved_answer=result["improved_answer"],
    )


@router.post("/interview/summary", response_model=SummaryResponse)
def interview_summary(req: SummaryRequest):
    session = _load(req.session_id)
    answered = []
    for q in session["questions"]:
        a = session["answers"].get(str(q["id"]))
        if a:
            answered.append((q, a))
    if not answered:
        raise HTTPException(status_code=400, detail="Aun no hay respuestas para resumir.")

    items = [
        {"id": q["id"], "question": q["text"], "answer": a["answer"], "score": a["score"],
         "strengths": a["strengths"], "improvements": a["improvements"]}
        for q, a in answered
    ]
    coach = _run_agent(agent.summarize_session, session["job_title"], session["experience_level"], items)

    n = len(answered)
    avg = {k: round(sum(a["criteria"][k] for _, a in answered) / n, 1)
           for k in ("claridad", "estructura", "relevancia", "ejemplos")}
    overall = round(sum(a["score"] for _, a in answered) / n, 1)

    return SummaryResponse(
        overall_score=overall,
        summary=coach["summary"],
        criteria_avg=Criteria(**avg),
        top_strengths=coach["top_strengths"],
        top_improvements=coach["top_improvements"],
        practice_plan=coach["practice_plan"],
        question_reviews=[
            QuestionReview(question_id=q["id"], text=q["text"], category=q["category"], score=a["score"])
            for q, a in answered
        ],
    )


app.include_router(router)
