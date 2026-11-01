"""Pruebas de la API con el agente simulado (no gastan cuota de Gemini)."""
import os

os.environ["DATABASE_PATH"] = ":memory:"

import pytest
from fastapi.testclient import TestClient

from app import agent, storage
from app.main import app


@pytest.fixture(autouse=True)
def fake_agent(tmp_path, monkeypatch):
    monkeypatch.setenv("DATABASE_PATH", str(tmp_path / "test.db"))

    monkeypatch.setattr(agent, "generate_questions", lambda *a: [
        {"id": i, "text": f"Pregunta {i}", "category": "tecnica"} for i in range(1, 6)
    ])
    monkeypatch.setattr(agent, "evaluate_answer", lambda *a: {
        "criteria": {"claridad": 8, "estructura": 6, "relevancia": 7, "ejemplos": 5},
        "strengths": ["Buena claridad"], "improvements": ["Usa metodo STAR"],
        "improved_answer": "Version mejorada [agrega tu metrica]",
    })
    monkeypatch.setattr(agent, "summarize_session", lambda *a: {
        "summary": "Buen desempeno.", "top_strengths": ["Claridad"],
        "top_improvements": ["Metricas"], "practice_plan": ["a", "b", "c"],
    })


client = TestClient(app)
START = {"job_title": "Analista de datos", "job_description": "",
         "experience_level": "junior", "interview_type": "mixta"}


def test_flow_completo():
    r = client.post("/api/interview/start", json=START)
    assert r.status_code == 200
    sid = r.json()["session_id"]
    assert len(r.json()["questions"]) == 5

    r = client.post("/api/interview/answer", json={"session_id": sid, "question_id": 1, "answer": "Mi respuesta"})
    assert r.status_code == 200
    assert r.json()["score"] == 6.5

    r = client.post("/api/interview/summary", json={"session_id": sid})
    assert r.status_code == 200
    body = r.json()
    assert body["overall_score"] == 6.5
    assert len(body["question_reviews"]) == 1


def test_validacion_datos():
    bad = {**START, "experience_level": "experto"}
    assert client.post("/api/interview/start", json=bad).status_code == 422
    assert client.post("/api/interview/answer",
                       json={"session_id": "x", "question_id": 1, "answer": "   "}).status_code == 422


def test_sesion_inexistente():
    r = client.post("/api/interview/answer", json={"session_id": "nope", "question_id": 1, "answer": "hola"})
    assert r.status_code == 404


def test_resumen_sin_respuestas():
    sid = client.post("/api/interview/start", json=START).json()["session_id"]
    assert client.post("/api/interview/summary", json={"session_id": sid}).status_code == 400


def test_error_del_agente(monkeypatch):
    def boom(*a):
        raise agent.AgentError("fallo")
    monkeypatch.setattr(agent, "generate_questions", boom)
    assert client.post("/api/interview/start", json=START).status_code == 502


def test_cuota_agotada(monkeypatch):
    def limit(*a):
        raise agent.AgentRateLimit("429")
    monkeypatch.setattr(agent, "generate_questions", limit)
    assert client.post("/api/interview/start", json=START).status_code == 429
