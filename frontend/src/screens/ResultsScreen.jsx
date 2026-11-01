import { useState } from 'react'
import Icon from '../components/Icon'
import ScoreBar from '../components/ScoreBar'
import { useCountUp, useMounted } from '../hooks'
import { CATEGORY_LABEL, CRITERIA, fmt, levelInfo, ringColor, stagger } from '../utils'

function Actions({ onRestart }) {
  return (
    <div className="flex items-center gap-space-sm print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container rounded-lg font-label-lg text-label-lg text-on-surface hover:bg-surface-container-high hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
      >
        <Icon name="download" className="text-[18px]" />
        <span>Descargar informe</span>
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-space-xs px-space-md py-space-sm bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg hover:opacity-95 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm"
      >
        <Icon name="restart_alt" className="text-[18px]" />
        <span>Nueva entrevista</span>
      </button>
    </div>
  )
}

export default function ResultsScreen({ results, onRestart }) {
  const { summary, answers } = results
  const [open, setOpen] = useState(null)
  const info = levelInfo(summary.overall_score)
  const mounted = useMounted(150)
  const shownScore = useCountUp(summary.overall_score, 1200)
  const low = summary.overall_score < 6
  const offset = 314.159 * (1 - summary.overall_score / 10)

  return (
    <div className="max-w-[1280px] w-full mx-auto px-margin-mobile sm:px-margin py-space-xl flex flex-col gap-space-xl">
      <div className="animate-fade-up flex flex-col md:flex-row md:items-end justify-between gap-space-md" style={stagger(0)}>
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md">
            <Icon name="verified" className="text-[18px]" />
            <span>Diagnóstico completado</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg sm:font-display-lg sm:text-display-lg text-on-surface tracking-tight">
            Resultados de la entrevista
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Evaluación integral basada en tus respuestas y áreas prioritarias de desarrollo.
          </p>
        </div>
        <Actions onRestart={onRestart} />
      </div>

      {/* Puntuacion global + criterios */}
      <div
        className="animate-fade-up grid grid-cols-1 lg:grid-cols-12 gap-gutter bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-xl shadow-sm"
        style={stagger(1)}
      >
        <div className="lg:col-span-5 flex flex-col justify-between gap-space-lg bg-surface-container-low p-space-lg rounded-xl">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Desempeño general</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Puntuación Global</h2>
          </div>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-space-lg py-space-sm">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle className="text-surface-container-high" cx="60" cy="60" fill="none" r="50" stroke="currentColor" strokeWidth="10" />
                <circle
                  className={ringColor(summary.overall_score)}
                  cx="60"
                  cy="60"
                  fill="none"
                  r="50"
                  stroke="currentColor"
                  strokeDasharray="314.159"
                  strokeLinecap="round"
                  strokeWidth="10"
                  style={{
                    strokeDashoffset: mounted ? offset : 314.159,
                    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none tabular-nums">{fmt(shownScore)}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">de 10</span>
              </div>
            </div>
            <div className="flex flex-col gap-space-xs text-center sm:text-left">
              <span
                className={`inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full font-label-sm text-label-sm w-fit mx-auto sm:mx-0 ${
                  low ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${low ? 'bg-amber-500' : 'bg-secondary'}`} />
                {info.short}
              </span>
              <p className="font-body-md text-body-md text-on-surface font-medium leading-relaxed">{summary.summary}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col justify-start gap-space-md">
          <div className="flex items-center justify-between pb-space-xs">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Criterios de Evaluación</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Promedio de cada criterio en toda la sesión</p>
            </div>
            <span className="font-label-md text-label-md text-primary font-medium bg-primary-fixed px-space-sm py-1 rounded-full">
              Diagnóstico con IA
            </span>
          </div>
          <div className="flex flex-col gap-space-md justify-center py-space-xs">
            {CRITERIA.map((c, i) => {
              const v = summary.criteria_avg[c.key]
              return (
                <div key={c.key} className="flex flex-col gap-space-xs p-space-sm rounded-lg hover:bg-surface-container-low transition-colors duration-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-space-xs">
                      <Icon name={c.icon} className="text-primary text-[18px]" />
                      <span className="font-label-lg text-label-lg text-on-surface">{c.label}</span>
                    </div>
                    <span className="font-label-lg text-label-lg text-on-surface tabular-nums">
                      {fmt(v)} <span className="font-body-sm text-body-sm text-on-surface-variant">/ 10</span>
                    </span>
                  </div>
                  <ScoreBar value={v} delay={300 + i * 120} track="bg-surface-container" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{c.hint}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fortalezas / mejoras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="animate-fade-up bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(2)}>
          <div className="flex items-center gap-space-sm pb-space-xs">
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Icon name="thumb_up" className="text-[20px]" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Fortalezas principales</h3>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Puntos consolidados en tus respuestas</span>
            </div>
          </div>
          {summary.top_strengths.length ? (
            <ul className="flex flex-col gap-space-sm">
              {summary.top_strengths.map((s, i) => (
                <li key={i} className="animate-fade-up p-space-md bg-surface-container-low rounded-lg flex items-start gap-space-sm" style={stagger(i + 4, 90)}>
                  <Icon name="check_circle" className="text-secondary text-[20px] shrink-0 mt-0.5" />
                  <span className="font-body-md text-body-md text-on-surface">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant">Aún no hay fortalezas consolidadas. ¡Sigue practicando!</p>
          )}
        </div>
        <div className="animate-fade-up bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(3)}>
          <div className="flex items-center gap-space-sm pb-space-xs">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <Icon name="trending_up" className="text-[20px]" />
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Oportunidades de mejora</h3>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Factores clave para elevar tu impacto</span>
            </div>
          </div>
          <ul className="flex flex-col gap-space-sm">
            {summary.top_improvements.map((s, i) => (
              <li key={i} className="animate-fade-up p-space-md bg-surface-container-low rounded-lg flex items-start gap-space-sm" style={stagger(i + 5, 90)}>
                <Icon name="error_outline" className="text-primary text-[20px] shrink-0 mt-0.5" />
                <span className="font-body-md text-body-md text-on-surface">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Plan de practica */}
      <div className="animate-fade-up bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(4)}>
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md">
            <Icon name="checklist" className="text-[18px]" />
            <span>Guía práctica sugerida</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Plan de práctica</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Acciones estructuradas para preparar tu próxima simulación.</p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
          {summary.practice_plan.map((step, i) => (
            <li
              key={i}
              className="animate-fade-up flex flex-col gap-space-sm p-space-md bg-surface-container-low rounded-lg hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200"
              style={stagger(i + 6, 100)}
            >
              <div className="w-7 h-7 rounded-full bg-btn text-on-primary flex items-center justify-center font-label-md text-label-md shrink-0">
                {i + 1}
              </div>
              <p className="font-body-md text-body-md text-on-surface font-medium leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Revision por pregunta */}
      <div className="animate-fade-up bg-surface-container-lowest p-space-lg sm:p-space-xl rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(5)}>
        <div className="flex flex-col gap-space-xs">
          <h2 className="font-headline-md text-headline-md text-on-surface">Revisión detallada de preguntas</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Calificación individual y retroalimentación por cada pregunta respondida
          </p>
        </div>
        <div className="flex flex-col gap-space-xs">
          {summary.question_reviews.map((q) => {
            const detail = answers[q.question_id]
            const isOpen = open === q.question_id
            return (
              <div key={q.question_id} className="rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors duration-200">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : q.question_id)}
                  className="w-full p-space-md flex items-center justify-between gap-space-md text-left"
                >
                  <div className="flex items-center gap-space-md min-w-0">
                    <span className="inline-flex px-space-xs py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-on-surface-variant shrink-0">
                      P{q.question_id}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">{q.text}</span>
                  </div>
                  <div className="flex items-center gap-space-md shrink-0">
                    <span className={`font-label-lg text-label-lg font-semibold tabular-nums ${q.score >= 8 ? 'text-secondary' : q.score < 6 ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`}>
                      {fmt(q.score)} <span className="font-body-sm text-body-sm text-on-surface-variant">/ 10</span>
                    </span>
                    <Icon name="expand_more" className={`text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {/* Despliegue con altura animada (truco grid 0fr -> 1fr) */}
                <div
                  aria-hidden={!isOpen}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out print:grid-rows-[1fr] print:opacity-100 ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-space-md pb-space-md pt-space-xs">
                      <div className="p-space-md bg-surface-container-lowest rounded-lg flex flex-col gap-space-sm">
                        <span className="font-label-md text-label-md text-primary font-medium">
                          {CATEGORY_LABEL[q.category]} • Diagnóstico de la respuesta
                        </span>
                        {detail ? (
                          <>
                            <ul className="flex flex-col gap-space-xs font-body-md text-body-md text-on-surface list-disc pl-5">
                              {detail.result.improvements.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                            <div>
                              <span className="font-label-md text-label-md text-on-surface-variant block mb-1">Versión sugerida</span>
                              <p className="font-body-md text-body-md text-on-surface italic whitespace-pre-wrap">“{detail.result.improved_answer}”</p>
                            </div>
                          </>
                        ) : (
                          <p className="font-body-md text-body-md text-on-surface-variant">Sin detalle disponible.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-end pt-space-md">
          <Actions onRestart={onRestart} />
        </div>
      </div>
    </div>
  )
}
