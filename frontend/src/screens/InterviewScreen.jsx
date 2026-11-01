import { useState } from 'react'
import Icon from '../components/Icon'
import ErrorBanner from '../components/ErrorBanner'
import FeedbackView from './FeedbackView'
import { CATEGORY_LABEL, TYPES, stagger } from '../utils'
import { getSummary, sendAnswer } from '../api'

const MAX_ANSWER = 2000

export default function InterviewScreen({ session, config, onFinished, initial }) {
  const { questions } = session
  const total = questions.length

  const [index, setIndex] = useState(initial?.index ?? 0)
  const [text, setText] = useState(initial?.text ?? '')
  const [phase, setPhase] = useState(initial?.phase ?? 'writing') // writing | loading | feedback
  const [error, setError] = useState(initial?.error ?? '')
  const [result, setResult] = useState(initial?.result ?? null)
  const [answers, setAnswers] = useState(initial?.answers ?? {})
  const [finishing, setFinishing] = useState(false)

  const question = questions[index]
  const isLast = index === total - 1
  const typeLabel = TYPES.find((t) => t.value === config.type)?.label ?? ''

  async function submit() {
    const answer = text.trim()
    if (!answer || phase === 'loading') return
    setPhase('loading')
    setError('')
    try {
      const r = await sendAnswer({ session_id: session.id, question_id: question.id, answer })
      setResult(r)
      setAnswers((prev) => ({ ...prev, [question.id]: { answer, result: r } }))
      setPhase('feedback')
      window.scrollTo({ top: 0 })
    } catch (e) {
      setError(e.message)
      setPhase('writing') // el texto se conserva
    }
  }

  async function next() {
    setError('')
    if (!isLast) {
      setIndex((i) => i + 1)
      setText('')
      setResult(null)
      setPhase('writing')
      window.scrollTo({ top: 0 })
      return
    }
    setFinishing(true)
    try {
      const summary = await getSummary({ session_id: session.id })
      onFinished(summary, answers)
    } catch (e) {
      setError(e.message)
      setFinishing(false)
    }
  }

  if (phase === 'feedback') {
    return (
      <>
        {error && (
          <div className="max-w-[1280px] w-full mx-auto px-margin-mobile sm:px-margin pt-space-lg">
            <ErrorBanner message={error} onRetry={next} retrying={finishing} />
          </div>
        )}
        <FeedbackView
          question={question}
          index={index}
          total={total}
          answer={answers[question.id].answer}
          result={result}
          isLast={isLast}
          onNext={next}
          busy={finishing}
        />
      </>
    )
  }

  const loading = phase === 'loading'
  const pct = Math.round((index / total) * 100)
  const nearLimit = text.length >= MAX_ANSWER * 0.9

  return (
    <section key={index} className="animate-fade-in max-w-[1280px] w-full mx-auto px-margin-mobile sm:px-margin py-space-xl">
      <div className="flex flex-col gap-space-xs max-w-xl mb-space-lg">
        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {CATEGORY_LABEL[question.category]}
          </span>
          <span className="text-on-surface-variant font-label-md text-label-md">
            {config.jobTitle} • Entrevista {typeLabel}
          </span>
        </div>
        <div className="flex items-center gap-space-md mt-1">
          <span className="font-headline-sm text-headline-sm text-on-surface">Pregunta {index + 1} de {total}</span>
          <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-2.5 py-0.5 rounded-full">
            {pct}% completado
          </span>
        </div>
        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden mt-1 shadow-inner">
          <div className="h-full bg-primary rounded-full transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={submit} retrying={loading} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-5 animate-fade-up" style={stagger(1)}>
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-container to-surface-variant" />
            <div className="flex items-center justify-between mb-space-md">
              <span className="px-3 py-1 bg-surface-container-high text-primary font-label-sm text-label-sm rounded-full font-semibold">
                {CATEGORY_LABEL[question.category]}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider font-semibold">
                Pregunta {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight">{question.text}</h2>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-space-md animate-fade-up" style={stagger(2)}>
          <div className="bg-surface-container-lowest p-space-xl rounded-xl shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-space-sm">
              <label htmlFor="interview-answer" className="font-headline-sm text-headline-sm text-on-surface">
                Tu respuesta
              </label>
              <div
                className={`font-label-sm text-label-sm tabular-nums font-semibold px-2 py-1 rounded-lg ${
                  nearLimit ? 'text-error bg-error-container' : 'text-on-surface-variant bg-surface-container-low'
                }`}
              >
                {text.length} / {MAX_ANSWER}
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Describe el problema, tus acciones y el resultado final. Si puedes, sigue el método STAR.
            </p>
            <div className="relative w-full rounded-xl">
              <textarea
                id="interview-answer"
                rows={12}
                maxLength={MAX_ANSWER}
                value={text}
                readOnly={loading}
                onChange={(e) => setText(e.target.value)}
                placeholder="Describe detalladamente el escenario, tus acciones y el resultado..."
                className="w-full bg-surface-container-low/60 rounded-xl p-space-md font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all resize-y leading-relaxed shadow-inner"
              />
              {loading && (
                <div
                  role="status"
                  className="animate-fade-in absolute inset-0 bg-surface-container-lowest/85 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-space-lg text-center z-10"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-surface-container border-t-primary animate-spin mb-space-md" />
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Analizando tu respuesta...</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                    Procesando metodología, estructura de resolución y precisión conceptual.
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-space-lg pt-space-md">
              <button
                type="button"
                onClick={submit}
                disabled={loading || !text.trim()}
                className="w-full sm:w-auto px-space-lg py-3 bg-btn text-on-primary rounded-xl font-label-lg text-label-lg font-semibold flex items-center justify-center gap-space-sm shadow-md hover:bg-btn/90 active:scale-[0.98] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:hover:translate-y-0 disabled:bg-surface-container disabled:text-on-surface-variant disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span>Analizando tu respuesta...</span>
                    <Icon name="progress_activity" className="text-[20px] animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Enviar respuesta</span>
                    <Icon name="arrow_forward" className="text-[20px]" />
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex items-center gap-space-sm text-on-surface-variant">
            <Icon name="security" className="text-[20px] text-primary" />
            <span className="font-body-sm text-body-sm">Sesión individual confidencial para desarrollo formativo profesional.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
