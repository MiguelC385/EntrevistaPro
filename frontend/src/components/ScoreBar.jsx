import { useMounted } from '../hooks'
import { barColor } from '../utils'

export default function ScoreBar({ value, delay = 0, track = 'bg-surface-container-high' }) {
  const mounted = useMounted()
  return (
    <div className={`h-2 w-full ${track} rounded-full overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-out ${barColor(value)}`}
        style={{ width: mounted ? `${value * 10}%` : '0%', transitionDelay: `${delay}ms` }}
      />
    </div>
  )
}
