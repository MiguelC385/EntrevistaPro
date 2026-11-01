import Icon from './Icon'
import { useTheme } from '../hooks'

const STEPS = ['Configuración', 'Entrevista en Vivo', 'Resultados']

export default function Header({ step }) {
  const [dark, toggleTheme] = useTheme()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant/40 print:hidden">
      <div className="h-16 max-w-[1280px] mx-auto px-margin-mobile sm:px-margin flex items-center justify-between">
        <div className="flex items-center gap-space-sm sm:w-64">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
            <Icon name="psychology" className="text-[20px]" />
          </div>
          <span className="font-headline-sm text-headline-sm text-primary tracking-tight">EntrevistaPro</span>
        </div>

        {/* Indicador de pasos (no clicable) */}
        <nav aria-label="Progreso" className="hidden sm:flex items-center justify-center flex-1">
          <ol className="flex items-center gap-space-md text-label-md font-label-md">
            {STEPS.map((name, i) => {
              const n = i + 1
              const done = n < step
              const current = n === step
              return (
                <li key={name} className="flex items-center gap-space-md">
                  {i > 0 && <span className="text-outline-variant">—</span>}
                  <div
                    className={`flex items-center gap-space-xs transition-colors duration-300 ${done ? 'text-secondary' : current ? 'text-primary' : 'text-on-surface-variant'}`}
                    aria-current={current ? 'step' : undefined}
                  >
                    <span
                      className={`flex items-center justify-center w-5 h-5 rounded-full text-label-sm font-label-sm transition-colors duration-300 ${
                        done
                          ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                          : current
                            ? 'bg-btn text-on-primary'
                            : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {done ? <Icon name="check" className="text-[14px]" /> : n}
                    </span>
                    <span>{name}</span>
                  </div>
                </li>
              )
            })}
          </ol>
        </nav>
        <div className="flex items-center justify-end gap-space-sm sm:w-64">
          <span className="sm:hidden text-label-md font-label-md text-on-surface-variant">Paso {step} de 3</span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={dark ? 'Modo claro' : 'Modo oscuro'}
            className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors duration-200"
          >
            <Icon name={dark ? 'light_mode' : 'dark_mode'} className="text-[20px]" />
          </button>
        </div>
      </div>
    </header>
  )
}
