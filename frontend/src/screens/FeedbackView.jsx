import Icon from '../components/Icon'
import ScoreBar from '../components/ScoreBar'
import { useCountUp, useMounted } from '../hooks'
import { CATEGORY_LABEL, CRITERIA, fmt, levelInfo, ringColor, stagger } from '../utils'

export default function FeedbackView({ question, index, total, answer, result, isLast, onNext, busy }) {
  const info = levelInfo(result.score)
  const pct = Math.round(((index + 1) / total) * 100)
  const mounted = useMounted(150)
  const shownScore = useCountUp(result.score, 1000)

  return (
    <div className="max-w-[1280px] w-full mx-auto px-margin-mobile sm:px-margin py-space-lg flex flex-col gap-space-lg">
      {/* Progreso */}
      <div
        className="animate-fade-up bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md"
        style={stagger(0)}
      >
        <div className="flex items-center gap-space-md w-full sm:w-auto">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <Icon name="terminal" className="text-[24px]" />
          </div>
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm text-on-surface">Pregunta {index + 1} de {total}</span>
              <span className="px-2.5 py-0.5 rounded-full text-label-sm font-label-sm bg-primary-fixed text-on-primary-fixed-variant tracking-wide uppercase">
                {CATEGORY_LABEL[question.category]}
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{pct}% completado</p>
          </div>
        </div>
        <div className="w-full sm:w-72 flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant">
            <span>Progreso de sesión</span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-[width] duration-700 ease-out"
              style={{ width: mounted ? `${pct}%` : `${Math.round((index / total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Pregunta */}
      <div className="animate-fade-up bg-surface-container-lowest rounded-xl p-space-lg shadow-sm" style={stagger(1)}>
        <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm mb-space-xs uppercase tracking-wider">
          <Icon name="record_voice_over" className="text-[16px]" />
          <span>Consigna del entrevistador</span>
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface">“{question.text}”</h2>
      </div>

      {/* Respuesta enviada */}
      <div className="animate-fade-up bg-surface-container-lowest rounded-xl p-space-lg shadow-sm" style={stagger(2)}>
        <div className="flex items-center justify-between pb-space-sm mb-space-sm">
          <div className="flex items-center gap-space-xs text-on-surface font-label-lg text-label-lg">
            <Icon name="assignment_turned_in" className="text-primary text-[20px]" />
            <span>Tu respuesta enviada</span>
          </div>
          <span className="text-label-sm font-label-sm text-secondary flex items-center gap-1 bg-secondary-fixed/30 px-2.5 py-0.5 rounded-full">
            <Icon name="check_circle" className="text-[14px]" /> Enviada
          </span>
        </div>
        <div className="bg-surface-container-low p-space-md rounded-lg font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap">
          “{answer}”
        </div>
      </div>

      {/* Diagnostico */}
      <section
        className="animate-fade-up bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg"
        style={stagger(3)}
      >
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
            <Icon name="insights" className="text-[20px]" />
          </div>
          <div>
            <span className="font-headline-sm text-headline-sm text-on-surface">Diagnóstico con IA</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Evaluación cualitativa y estructural de tu respuesta</p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row items-center gap-space-lg">
          <div className="flex items-center gap-space-md shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-surface-container-high" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                <path
                  className={ringColor(result.score)}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                  style={{
                    strokeDasharray: `${mounted ? result.score * 10 : 0}, 100`,
                    transition: 'stroke-dasharray 1s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline-lg text-headline-lg text-on-surface leading-none tabular-nums">{fmt(shownScore)}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">de 10</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-label-lg text-label-lg text-primary">{info.label}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Puntaje global balanceado</span>
            </div>
          </div>
          <p className="flex-1 font-body-lg text-body-lg text-on-surface font-medium leading-relaxed">{info.text}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-space-lg gap-y-space-md">
          {CRITERIA.map((c, i) => {
            const value = result.criteria[c.key]
            return (
              <div key={c.key} className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-label-lg text-label-lg text-on-surface">{c.label}</span>
                  <span className="font-label-lg text-label-lg text-primary font-semibold tabular-nums">{fmt(value)} / 10</span>
                </div>
                <ScoreBar value={value} delay={300 + i * 120} />
                <span className="font-body-sm text-body-sm text-on-surface-variant">{c.hint}</span>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs text-secondary font-headline-sm text-headline-sm">
              <Icon name="check_circle" className="text-[22px]" />
              <span>Fortalezas</span>
            </div>
            {result.strengths.length ? (
              <ul className="flex flex-col gap-space-sm font-body-md text-body-md text-on-surface">
                {result.strengths.map((s, i) => (
                  <li key={i} className="animate-fade-up flex items-start gap-space-xs" style={stagger(i + 6, 90)}>
                    <Icon name="done" className="text-secondary text-[18px] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body-md text-body-md text-on-surface-variant">Aún no hay fortalezas claras en esta respuesta.</p>
            )}
          </div>
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs text-primary font-headline-sm text-headline-sm">
              <Icon name="published_with_changes" className="text-[22px]" />
              <span>A mejorar</span>
            </div>
            <ul className="flex flex-col gap-space-sm font-body-md text-body-md text-on-surface">
              {result.improvements.map((s, i) => (
                <li key={i} className="animate-fade-up flex items-start gap-space-xs" style={stagger(i + 7, 90)}>
                  <Icon name="arrow_forward" className="text-primary text-[18px] shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-space-lg flex flex-col gap-space-sm">
          <div className="flex items-center gap-space-xs text-primary">
            <Icon name="auto_awesome" className="text-[22px]" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Versión sugerida</h3>
          </div>
          <p className="font-body-md text-body-md text-on-surface leading-relaxed italic bg-surface-container-lowest p-space-md rounded-lg shadow-sm whitespace-pre-wrap">
            “{result.improved_answer}”
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
            <Icon name="info" className="text-[14px]" />
            Completa los datos entre [corchetes] con tu experiencia real.
          </p>
        </div>
      </section>

      <div className="animate-fade-up flex justify-end pt-space-sm pb-space-lg" style={stagger(5)}>
        <button
          type="button"
          onClick={onNext}
          disabled={busy}
          className="w-full sm:w-auto px-space-xl py-3.5 bg-btn text-on-primary font-label-lg text-label-lg rounded-lg shadow-md hover:bg-btn/95 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-space-xs disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {busy ? (
            <>
              <span>Generando tu informe...</span>
              <Icon name="progress_activity" className="text-[20px] animate-spin" />
            </>
          ) : (
            <>
              <span>{isLast ? 'Ver resultados' : 'Siguiente pregunta'}</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
