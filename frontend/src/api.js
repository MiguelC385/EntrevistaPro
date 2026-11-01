// Comunicacion con el backend (FastAPI). Ver docs en /docs del backend.
const BASE = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

const MESSAGES = {
  0: 'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.',
  404: 'Tu sesión expiró. Inicia una nueva entrevista.',
  422: 'Revisa los datos ingresados e intenta de nuevo.',
  429: 'El servicio de IA está ocupado. Espera unos segundos e intenta de nuevo.',
  502: 'Falló el servicio de IA. Intenta de nuevo.',
}

// Gemini a veces responde con formato markdown (`codigo`, **negrita**). La interfaz muestra texto plano.
const strip = (v) =>
  typeof v === 'string'
    ? v.replace(/`|\*\*/g, '')
    : Array.isArray(v)
      ? v.map(strip)
      : v && typeof v === 'object'
        ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, strip(x)]))
        : v

async function post(path, body) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(MESSAGES[0], 0)
  }
  if (!res.ok) {
    throw new ApiError(MESSAGES[res.status] || 'Algo salió mal. Intenta de nuevo.', res.status)
  }
  return strip(await res.json())
}

export const startInterview = (payload) => post('/interview/start', payload)
export const sendAnswer = (payload) => post('/interview/answer', payload)
export const getSummary = (payload) => post('/interview/summary', payload)
