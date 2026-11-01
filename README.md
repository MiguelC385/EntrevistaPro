# EntrevistaPro

Aplicación web para practicar entrevistas de trabajo con un agente de IA.
El usuario indica el cargo al que aplica, responde cinco preguntas generadas
para ese cargo y recibe retroalimentación por cada respuesta, más un informe
final con un plan de práctica.

Proyecto individual de la Electiva de Profundización II, por Miguel Caicedo.

## Cómo funciona

1. **Configuración:** cargo, descripción de la oferta (opcional), nivel de experiencia y tipo de entrevista.
2. **Entrevista:** el agente genera 5 preguntas y evalúa cada respuesta con 4 criterios
   (claridad, estructura, relevancia y ejemplos), con fortalezas, mejoras y una versión sugerida.
3. **Resultados:** puntaje global, promedios, plan de práctica y revisión de cada pregunta.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React, Vite y Tailwind CSS (diseño generado con Google Stitch) |
| Backend | Python con FastAPI |
| Agente de IA | API de Google Gemini |
| Base de datos | SQLite (sesiones temporales de 24 horas) |
| Nube | AWS EC2 con Nginx |

## Requisitos

- Python 3.10 o superior
- Node.js 18 o superior
- Una clave de API de Gemini (gratuita en https://aistudio.google.com)

## Cómo ejecutarlo en local

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Abre `backend/.env` y pon tu clave en `GEMINI_API_KEY`. Si Google cambia los modelos
disponibles, ajusta también `GEMINI_MODEL`. Luego:

```bash
uvicorn app.main:app --reload --port 8000
```

La documentación interactiva de la API queda en http://localhost:8000/docs

### Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Para probarlo desde el celular en la misma red,
usa `npm run dev -- --host`.

## API

Todos los endpoints son `POST` y usan JSON:

| Endpoint | Para qué sirve |
|---|---|
| `/api/interview/start` | Crea la sesión y genera las 5 preguntas |
| `/api/interview/answer` | Evalúa la respuesta a una pregunta |
| `/api/interview/summary` | Genera el informe final de la sesión |

## Pruebas

```bash
cd backend && pytest -v     # API con el agente simulado
cd frontend && npm test     # flujo completo de la interfaz
```

## Notas

- La clave de la API vive solo en `backend/.env`, que está en `.gitignore` y nunca se sube.
- Las respuestas del usuario se guardan en la base de datos hasta 24 horas y se envían
  a la API de Gemini para generar la retroalimentación.
- El nivel gratuito de Gemini tiene límites de uso: si se superan, la aplicación pide
  esperar unos segundos y reintentar.

## Despliegue

El proyecto se despliega en una instancia EC2 de AWS: Nginx sirve el frontend compilado
(`npm run build`) y redirige `/api` a FastAPI.