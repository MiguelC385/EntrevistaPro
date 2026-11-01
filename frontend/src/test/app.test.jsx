import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'

const QUESTIONS = [
  { id: 1, text: 'Cuéntame sobre un trabajo en equipo.', category: 'comportamiento' },
  { id: 2, text: '¿Cómo explicarías un JOIN en SQL?', category: 'tecnica' },
]

const EVAL = {
  question_id: 1,
  score: 6.5,
  criteria: { claridad: 8, estructura: 6, relevancia: 7, ejemplos: 5 },
  strengths: ['Buena claridad'],
  improvements: ['Usa el método STAR'],
  improved_answer: 'Versión mejorada [agrega tu métrica]',
}

const SUMMARY = {
  overall_score: 6.5,
  summary: 'Buen desempeño general.',
  criteria_avg: { claridad: 8, estructura: 6, relevancia: 7, ejemplos: 5 },
  top_strengths: ['Claridad'],
  top_improvements: ['Métricas'],
  practice_plan: ['Paso uno', 'Paso dos', 'Paso tres'],
  question_reviews: [
    { question_id: 1, text: QUESTIONS[0].text, category: 'comportamiento', score: 6.5 },
    { question_id: 2, text: QUESTIONS[1].text, category: 'tecnica', score: 6.5 },
  ],
}

function mockFetch(handlers) {
  global.fetch = vi.fn((url) => {
    const handler = handlers[url]
    const out = typeof handler === 'function' ? handler() : handler
    return Promise.resolve({ ok: out.ok ?? true, status: out.status ?? 200, json: () => Promise.resolve(out.body) })
  })
}

describe('EntrevistaPro', () => {
  beforeEach(() => vi.restoreAllMocks())
  afterEach(() => vi.restoreAllMocks())

  it('recorre el flujo completo: configurar, responder y ver resultados', async () => {
    const user = userEvent.setup()
    mockFetch({
      '/api/interview/start': { body: { session_id: 'abc', questions: QUESTIONS } },
      '/api/interview/answer': { body: EVAL },
      '/api/interview/summary': { body: SUMMARY },
    })
    render(<App />)

    // Paso 1: el boton esta deshabilitado sin cargo
    const start = screen.getByRole('button', { name: /comenzar entrevista/i })
    expect(start).toBeDisabled()
    await user.type(screen.getByLabelText(/cargo al que aplicas/i), 'Analista de datos')
    expect(start).toBeEnabled()
    await user.click(start)

    // Paso 2: primera pregunta
    expect(await screen.findByText(QUESTIONS[0].text)).toBeInTheDocument()
    expect(screen.getByText(/pregunta 1 de 2/i)).toBeInTheDocument()
    const send = screen.getByRole('button', { name: /enviar respuesta/i })
    expect(send).toBeDisabled()
    await user.type(screen.getByLabelText(/tu respuesta/i), 'Mi respuesta de prueba')
    await user.click(send)

    // Retroalimentacion
    expect(await screen.findByText(/diagnóstico con ia/i)).toBeInTheDocument()
    expect(screen.getByText('6.5')).toBeInTheDocument()
    expect(screen.getByText('Usa el método STAR')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /siguiente pregunta/i }))

    // Segunda (ultima) pregunta
    expect(await screen.findByText(QUESTIONS[1].text)).toBeInTheDocument()
    await user.type(screen.getByLabelText(/tu respuesta/i), 'Otra respuesta')
    await user.click(screen.getByRole('button', { name: /enviar respuesta/i }))
    await user.click(await screen.findByRole('button', { name: /ver resultados/i }))

    // Paso 3: resultados
    expect(await screen.findByText(/resultados de la entrevista/i)).toBeInTheDocument()
    expect(screen.getByText('Buen desempeño general.')).toBeInTheDocument()
    expect(screen.getByText('Paso dos')).toBeInTheDocument()

    // Nueva entrevista vuelve al inicio
    await user.click(screen.getAllByRole('button', { name: /nueva entrevista/i })[0])
    expect(await screen.findByText(/configura tu entrevista/i)).toBeInTheDocument()
  })

  it('muestra el error y conserva el texto escrito cuando la IA falla', async () => {
    const user = userEvent.setup()
    let calls = 0
    mockFetch({
      '/api/interview/start': { body: { session_id: 'abc', questions: QUESTIONS } },
      '/api/interview/answer': () => (++calls === 1 ? { ok: false, status: 429, body: {} } : { body: EVAL }),
    })
    render(<App />)
    await user.type(screen.getByLabelText(/cargo al que aplicas/i), 'Analista')
    await user.click(screen.getByRole('button', { name: /comenzar entrevista/i }))
    await screen.findByText(QUESTIONS[0].text)

    await user.type(screen.getByLabelText(/tu respuesta/i), 'Texto que no debe perderse')
    await user.click(screen.getByRole('button', { name: /enviar respuesta/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/servicio de ia está ocupado/i)
    expect(screen.getByLabelText(/tu respuesta/i)).toHaveValue('Texto que no debe perderse')

    await user.click(screen.getByRole('button', { name: /reintentar/i }))
    expect(await screen.findByText(/diagnóstico con ia/i)).toBeInTheDocument()
  })

  it('muestra error si no hay conexion al iniciar', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn(() => Promise.reject(new TypeError('fail')))
    render(<App />)
    await user.type(screen.getByLabelText(/cargo al que aplicas/i), 'Analista')
    await user.click(screen.getByRole('button', { name: /comenzar entrevista/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo conectar/i))
  })

  it('cambia entre modo claro y oscuro y recuerda la preferencia', async () => {
    const user = userEvent.setup()
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    render(<App />)

    await user.click(screen.getByRole('button', { name: /cambiar a modo oscuro/i }))
    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')

    await user.click(screen.getByRole('button', { name: /cambiar a modo claro/i }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
  })
})
