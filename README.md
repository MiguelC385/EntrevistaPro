# EntrevistaPro

Aplicacion web para practicar entrevistas de trabajo con un agente de IA (Gemini).

## Estructura

- `backend/`  API en FastAPI + agente de IA
- `frontend/` Interfaz en React (Vite)

## Backend (desarrollo local)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # y pon tu GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Documentacion interactiva: http://localhost:8000/docs

## Pruebas

```bash
cd backend
pytest -v
```
