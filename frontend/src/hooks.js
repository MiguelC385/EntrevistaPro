import { useEffect, useState } from 'react'

export function prefersReducedMotion() {
  return typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Pasa a true poco despues de montarse: sirve para que las barras y anillos "se llenen" con transicion CSS.
export function useMounted(delay = 50) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return mounted
}

// Numero que sube de 0 hasta su valor. Con "reducir movimiento" muestra el valor final de inmediato.
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0)
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target)
      return undefined
    }
    let raf
    let start
    const tick = (t) => {
      if (start === undefined) start = t
      const p = Math.min((t - start) / duration, 1)
      setValue(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

// Modo claro / oscuro. La clase "dark" vive en <html>; el script de index.html la pone antes de pintar
// para evitar un parpadeo, y aqui se guarda la preferencia del usuario.
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  // Al imprimir siempre se usa el tema claro (texto oscuro sobre papel blanco)
  useEffect(() => {
    const before = () => document.documentElement.classList.remove('dark')
    const after = () => document.documentElement.classList.toggle('dark', dark)
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [dark])

  function toggle() {
    const html = document.documentElement
    const next = !dark
    if (!prefersReducedMotion()) {
      html.classList.add('theme-transition')
      setTimeout(() => html.classList.remove('theme-transition'), 400)
    }
    html.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      /* sin almacenamiento: el tema solo dura esta visita */
    }
    setDark(next)
  }

  return [dark, toggle]
}
