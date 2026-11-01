# EntrevistaPro

Aplicación web para practicar entrevistas de trabajo con un agente de IA (Gemini).

## Estructura

- `backend/`  API en FastAPI + agente de IA
- `frontend/` Interfaz en React (Vite + Tailwind), basada en el diseño de Stitch

## Backend (desarrollo local)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # y pon tu GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Documentación interactiva: http://localhost:8000/docs

## Frontend (desarrollo local)

En otra terminal, con el backend corriendo:

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Las llamadas a `/api` se redirigen al backend
(puerto 8000) con el proxy de Vite, así que no hay problemas de CORS.

## Pruebas

```bash
cd backend && pytest -v      # API con el agente simulado
cd frontend && npm test      # flujo completo de la interfaz con la API simulada
```

## Producción (AWS EC2)

```bash
cd frontend && npm run build   # genera frontend/dist
```

Nginx sirve `frontend/dist` y redirige `/api` a FastAPI (puerto 8000).
