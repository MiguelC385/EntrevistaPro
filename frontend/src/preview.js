// Modo de vista previa (solo desarrollo): http://localhost:5173/?vista=resultados
// Vistas: configuracion, entrevista, cargando, error, feedback, feedback-bajo, resultados, resultados-bajo

const QUESTIONS = [
  { id: 1, text: 'Cuéntame sobre una situación en la que trabajaste en equipo para resolver un problema.', category: 'comportamiento' },
  { id: 2, text: 'Describe una situación en la que tuviste que resolver un problema técnico bajo presión y explica cómo lo abordaste.', category: 'tecnica' },
  { id: 3, text: '¿Cuál es la diferencia entre un elemento de bloque y uno de línea en HTML?', category: 'tecnica' },
  { id: 4, text: 'Háblame de una ocasión en la que recibiste críticas constructivas.', category: 'comportamiento' },
  { id: 5, text: 'Describe un desacuerdo con un compañero y cómo lo resolviste.', category: 'comportamiento' },
]

const ANSWER =
  'Durante la semana previa a la demo del proyecto, el flujo de cobros empezó a arrojar errores 500 intermitentes. Analicé los logs del servidor y el inspector de red, y aislé el fallo en la sincronización de tokens de sesión. Implementé reintentos controlados en el frontend y coordiné con backend el ajuste de concurrencia.'

const RESULT_OK = {
  question_id: 2,
  score: 7,
  criteria: { claridad: 8, estructura: 6.5, relevancia: 7.5, ejemplos: 6 },
  strengths: [
    'Identificas con claridad el problema y el contexto de presión.',
    'Describes acciones concretas que tomaste tú mismo.',
    'Muestras coordinación con otras áreas del equipo.',
  ],
  improvements: [
    'Separa mejor Situación, Tarea, Acción y Resultado con el método STAR.',
    'Cierra con un resultado medible: [agrega tu métrica].',
    'Aclara qué hiciste tú y qué hizo el resto del equipo.',
  ],
  improved_answer:
    'Una semana antes de la demo, el flujo de cobros arrojó errores 500 intermitentes. Analicé los logs y el inspector de red, identifiqué una condición de carrera en los tokens de sesión e implementé reintentos controlados mientras coordinaba con backend. Resultado: [agrega tu métrica].',
}

const RESULT_LOW = {
  question_id: 2,
  score: 2.5,
  criteria: { claridad: 3, estructura: 2, relevancia: 3, ejemplos: 2 },
  strengths: [],
  improvements: [
    'Responde directamente a la pregunta con una situación real.',
    'Usa el método STAR para ordenar tu respuesta.',
    'Agrega un ejemplo concreto de lo que hiciste.',
  ],
  improved_answer:
    'Situación: [describe el contexto]. Tarea: [qué debías lograr]. Acción: [qué hiciste tú]. Resultado: [qué pasó].',
}

const answers = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, { answer: ANSWER, result: { ...RESULT_OK, question_id: q.id } }]),
)

const summary = (overall, strengths) => ({
  overall_score: overall,
  summary:
    overall < 6
      ? 'Tus respuestas necesitan más contenido y estructura. Practica con el método STAR y prepara ejemplos reales antes de la próxima simulación.'
      : 'Buen desempeño general, con claridad y buena actitud. Para subir de nivel, ordena tus historias con STAR y cierra con resultados medibles.',
  criteria_avg:
    overall < 6
      ? { claridad: 3, estructura: 2, relevancia: 3, ejemplos: 2 }
      : { claridad: 8.2, estructura: 6.8, relevancia: 7.6, ejemplos: 6.2 },
  top_strengths: strengths,
  top_improvements: ['Cuantificar los resultados', 'Aplicar STAR en cada respuesta', 'Aclarar tu rol dentro del equipo'],
  practice_plan: [
    'Escribe tres historias reales con el método STAR.',
    'Practica cerrar cada respuesta con un resultado medible.',
    'Ensaya tu presentación personal en menos de un minuto.',
  ],
  question_reviews: QUESTIONS.map((q, i) => ({
    question_id: q.id,
    text: q.text,
    category: q.category,
    score: overall < 6 ? 2 + i * 0.3 : 6 + i * 0.5,
  })),
})

export function getPreviewState() {
  if (!import.meta.env.DEV) return null
  const name = new URLSearchParams(window.location.search).get('vista')
  if (!name) return null

  const base = {
    session: { id: 'preview', questions: QUESTIONS },
    config: { jobTitle: 'Desarrollador Frontend Junior', level: 'junior', type: 'mixta' },
  }
  const interview = (extra) => ({ ...base, step: 2, interview: { index: 1, ...extra } })

  switch (name) {
    case 'configuracion':
      return { ...base, step: 1 }
    case 'entrevista':
      return interview({})
    case 'cargando':
      return interview({ phase: 'loading', text: ANSWER })
    case 'error':
      return interview({ text: ANSWER, error: 'El servicio de IA está ocupado. Espera unos segundos e intenta de nuevo.' })
    case 'feedback':
      return interview({ phase: 'feedback', result: RESULT_OK, answers: { 2: { answer: ANSWER, result: RESULT_OK } } })
    case 'feedback-bajo':
      return interview({ phase: 'feedback', result: RESULT_LOW, answers: { 2: { answer: 'No sé.', result: RESULT_LOW } } })
    case 'resultados':
      return { ...base, step: 3, results: { summary: summary(7.2, ['Claridad al explicar', 'Buena actitud', 'Colaboración con el equipo']), answers } }
    case 'resultados-bajo':
      return { ...base, step: 3, results: { summary: summary(2.4, []), answers } }
    default:
      return null
  }
}
