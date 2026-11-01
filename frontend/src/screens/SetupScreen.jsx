import { useState } from 'react'
import Icon from '../components/Icon'
import ErrorBanner from '../components/ErrorBanner'
import { LEVELS, TYPES, stagger } from '../utils'
import { startInterview } from '../api'

const CHIPS = ['Frontend Junior', 'Diseñador UX/UI', 'Product Manager', 'Backend Node.js']
const MAX_DESC = 1200

function OptionIndicator({ selected }) {
  return (
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center ${
        selected ? 'bg-btn text-on-primary animate-pop' : 'bg-surface-container-highest'
      }`}
    >
      <Icon name="check" className={`text-[14px] ${selected ? '' : 'text-surface-container-highest'}`} />
    </div>
  )
}

export default function SetupScreen({ onStarted }) {
  const [role, setRole] = useState('')
  const [desc, setDesc] = useState('')
  const [level, setLevel] = useState('junior')
  const [type, setType] = useState('mixta')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canStart = role.trim().length >= 2 && !loading
  const levelInfo = LEVELS.find((l) => l.value === level)
  const typeInfo = TYPES.find((t) => t.value === type)

  async function start() {
    if (!canStart) return
    setLoading(true)
    setError('')
    try {
      const data = await startInterview({
        job_title: role.trim(),
        job_description: desc.trim(),
        experience_level: level,
        interview_type: type,
      })
      onStarted(
        { jobTitle: role.trim(), level, type },
        { id: data.session_id, questions: data.questions },
      )
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-margin-mobile sm:px-margin py-space-xl">
      <div className="animate-fade-up mb-space-xl">
        <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm tracking-widest uppercase mb-space-xs">
          <Icon name="tune" className="text-[16px]" />
          <span>Paso 1 • Personalización</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg sm:font-display-lg sm:text-display-lg text-on-surface tracking-tight">
          Configura tu entrevista
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-space-xs">
          Personaliza tu práctica seleccionando tu rol, nivel y tipo de evaluación.
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={start} retrying={loading} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <form className="lg:col-span-7 flex flex-col gap-space-lg" onSubmit={(e) => e.preventDefault()}>
          {/* Cargo */}
          <div className="animate-fade-up bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(1)}>
            <div>
              <label htmlFor="role-input" className="block font-headline-sm text-headline-sm text-on-surface mb-space-xs">
                Cargo al que aplicas
              </label>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Ingresa el título exacto de la vacante para calibrar el enfoque de las preguntas.
              </p>
            </div>
            <div className="relative">
              <Icon name="badge" className="absolute left-space-md top-1/2 -translate-y-1/2 text-outline text-[20px]" />
              <input
                id="role-input"
                type="text"
                value={role}
                maxLength={120}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ej: Analista de datos"
                className="w-full pl-11 pr-space-md py-space-sm bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs pt-space-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">Sugerencias rápidas:</span>
              <div className="flex flex-wrap gap-space-xs">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setRole(chip)}
                    className={`px-space-sm py-1 font-label-md text-label-md rounded-full transition-colors hover:bg-primary-container hover:text-on-primary ${
                      role === chip ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descripcion */}
          <div className="animate-fade-up bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(2)}>
            <div className="flex items-center justify-between">
              <label htmlFor="job-desc" className="font-headline-sm text-headline-sm text-on-surface">
                Descripción de la oferta laboral{' '}
                <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">(opcional)</span>
              </label>
              <Icon name="description" className="text-outline text-[20px]" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-space-xs">
              Permite ajustar las preguntas a los requisitos y desafíos particulares del puesto.
            </p>
            <div className="relative flex flex-col">
              <textarea
                id="job-desc"
                rows={4}
                maxLength={MAX_DESC}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Pega aquí el perfil solicitado, stack tecnológico o responsabilidades clave..."
                className="w-full p-space-md pb-space-lg bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest resize-y transition-all"
              />
              <div className="flex justify-between items-center px-space-xs pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  <Icon name="auto_awesome" className="text-[14px] text-primary" />
                  Contexto adicional para calibración
                </span>
                <span
                  className={`font-label-sm text-label-sm tabular-nums ${desc.length >= MAX_DESC * 0.9 ? 'text-error' : 'text-outline'}`}
                >
                  {desc.length} / {MAX_DESC}
                </span>
              </div>
            </div>
          </div>

          {/* Nivel */}
          <fieldset className="animate-fade-up bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(3)}>
            <div>
              <legend className="font-headline-sm text-headline-sm text-on-surface block">Nivel de experiencia</legend>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Selecciona tu grado de madurez profesional para este rol.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              {LEVELS.map((l) => {
                const selected = level === l.value
                return (
                  <label
                    key={l.value}
                    className={`cursor-pointer relative flex flex-col justify-between p-space-md rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm select-none focus-within:ring-2 focus-within:ring-primary-container ${
                      selected ? 'bg-primary-fixed/40' : 'bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experience"
                      value={l.value}
                      checked={selected}
                      onChange={() => setLevel(l.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-space-sm">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selected ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface'
                        }`}
                      >
                        <Icon name={l.icon} className="text-[18px]" />
                      </div>
                      <OptionIndicator selected={selected} />
                    </div>
                    <div>
                      <p className={`font-label-lg text-label-lg mb-0.5 ${selected ? 'text-primary' : 'text-on-surface'}`}>{l.label}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{l.desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {/* Tipo */}
          <fieldset className="animate-fade-up bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md" style={stagger(4)}>
            <div>
              <legend className="font-headline-sm text-headline-sm text-on-surface block">Tipo de entrevista</legend>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Define el balance de preguntas técnicas y situacionales.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              {TYPES.map((t) => {
                const selected = type === t.value
                const recommended = t.value === 'mixta'
                return (
                  <label
                    key={t.value}
                    className={`cursor-pointer relative flex flex-col justify-between p-space-md rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm select-none focus-within:ring-2 focus-within:ring-primary-container ${
                      selected ? 'bg-primary-fixed/40' : 'bg-surface-container-low hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.value}
                      checked={selected}
                      onChange={() => setType(t.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between mb-space-sm">
                      <span
                        className={`px-space-xs py-0.5 rounded-full font-label-sm text-label-sm ${
                          recommended ? 'bg-primary-container text-on-primary' : `bg-surface-container-highest ${t.badgeText}`
                        }`}
                      >
                        {t.badge}
                      </span>
                      <OptionIndicator selected={selected} />
                    </div>
                    <div>
                      <p className={`font-label-lg text-label-lg mb-0.5 ${selected ? 'text-primary' : 'text-on-surface'}`}>{t.label}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{t.desc}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </form>

        {/* Resumen */}
        <div className="animate-fade-up lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-space-md" style={stagger(2)}>
          <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col">
            <div className="flex items-center justify-between pb-space-md bg-surface-container-low -mx-space-lg -mt-space-lg px-space-lg pt-space-lg rounded-t-xl mb-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">Configuración activa</span>
                <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-0.5">Resumen de tu sesión</h2>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                <Icon name="assignment_turned_in" className="text-[24px]" />
              </div>
            </div>

            <div className="flex flex-col gap-space-sm py-space-sm">
              {[
                { label: 'Cargo', value: role.trim() || 'Sin especificar', icon: 'person', ok: role.trim().length >= 2 },
                { label: 'Nivel', value: levelInfo.summary, icon: 'signal_cellular_alt', ok: true },
                { label: 'Modalidad', value: typeInfo.label === 'De comportamiento' ? 'Comportamiento' : typeInfo.label, icon: 'category', ok: true },
              ].map((row) => (
                <div key={row.label} className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-space-sm min-w-0 pr-space-xs">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
                      <Icon name={row.icon} className="text-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wide">{row.label}</span>
                      <span className="font-label-lg text-label-lg text-on-surface truncate block font-semibold">{row.value}</span>
                    </div>
                  </div>
                  <Icon name="check_circle" className={`text-[18px] shrink-0 ${row.ok ? 'text-secondary' : 'text-outline'}`} />
                </div>
              ))}
            </div>

            <div className="pt-space-md mt-space-sm">
              <button
                type="button"
                onClick={start}
                disabled={!canStart}
                className="w-full py-space-md px-space-lg bg-primary-container hover:bg-btn text-on-primary rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] group disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary-container disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {loading ? (
                  <>
                    <span>Preparando tus preguntas...</span>
                    <Icon name="progress_activity" className="text-[20px] animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Comenzar entrevista</span>
                    <Icon name="arrow_forward" className="text-[20px] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex items-center gap-space-md">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary shrink-0">
              <Icon name="support_agent" className="text-[18px]" />
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Responde por texto durante el ejercicio. Tus respuestas se usan solo para generar la retroalimentación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
