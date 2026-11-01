import Icon from './Icon'

export default function ErrorBanner({ message, onRetry, retrying = false }) {
  return (
    <div
      role="alert"
      className="animate-fade-up mb-space-lg p-space-md bg-error-container/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-space-md shadow-sm"
    >
      <div className="flex items-start gap-space-sm">
        <div className="w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0">
          <Icon name="error_outline" className="text-[20px]" />
        </div>
        <div>
          <h4 className="font-label-lg text-label-lg text-on-surface font-semibold">Algo salió mal. Intenta de nuevo.</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            {message} Tu texto se conservó intacto.
          </p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="px-4 py-2 bg-error text-on-error rounded-lg font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:opacity-95 shadow-sm active:scale-95 transition-transform shrink-0 disabled:opacity-60"
        >
          <Icon name="replay" className="text-[18px]" />
          Reintentar
        </button>
      )}
    </div>
  )
}
