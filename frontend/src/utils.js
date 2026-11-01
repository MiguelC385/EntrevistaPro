export const LEVELS = [
  { value: 'sin_experiencia', label: 'Sin experiencia', summary: 'Sin experiencia', desc: 'Estudiantes o recién graduados', icon: 'school' },
  { value: 'junior', label: 'Junior', summary: 'Junior (0-2 años)', desc: '0 a 2 años de experiencia', icon: 'trending_up' },
  { value: 'intermedio', label: 'Intermedio', summary: 'Intermedio (3-5 años)', desc: '3 a 5 años de experiencia', icon: 'workspace_premium' },
]

export const TYPES = [
  { value: 'tecnica', label: 'Técnica', badge: 'Práctica', badgeText: 'text-primary', desc: 'Conocimientos específicos y resolución de problemas' },
  { value: 'comportamiento', label: 'De comportamiento', badge: 'STAR', badgeText: 'text-secondary', desc: 'Metodología STAR y competencias laborales' },
  { value: 'mixta', label: 'Mixta', badge: 'Recomendado', badgeText: 'text-primary', desc: 'Equilibrio entre técnica y conductual' },
]

export const CATEGORY_LABEL = { tecnica: 'Técnica', comportamiento: 'Comportamiento' }

export const CRITERIA = [
  { key: 'claridad', label: 'Claridad', icon: 'record_voice_over', hint: '¿Se entiende fácilmente lo que quisiste decir?' },
  { key: 'estructura', label: 'Estructura', icon: 'account_tree', hint: 'Orden de la respuesta (idealmente con el método STAR).' },
  { key: 'relevancia', label: 'Relevancia', icon: 'adjust', hint: 'Qué tan bien responde a lo que se preguntó.' },
  { key: 'ejemplos', label: 'Ejemplos', icon: 'cases', hint: 'Uso de ejemplos concretos y resultados.' },
]

export const fmt = (n) => Number(n).toFixed(1)

// Colores segun el desempeno (DESIGN.md): <6 mejorar, 6-7.9 competente, >=8 dominado
export function barColor(score) {
  if (score < 6) return 'bg-amber-500'
  if (score < 8) return 'bg-primary-container'
  return 'bg-secondary'
}

export function ringColor(score) {
  if (score < 6) return 'text-amber-500'
  if (score < 8) return 'text-primary-container'
  return 'text-secondary'
}

// Retraso escalonado para que los bloques aparezcan uno tras otro
export const stagger = (i, step = 70) => ({ animationDelay: `${i * step}ms` })

export function levelInfo(score) {
  if (score >= 8) return { label: 'Nivel Sobresaliente', text: 'Muy buena respuesta. Revisa los detalles para pulirla aún más.', short: 'Desempeño sobresaliente' }
  if (score >= 6) return { label: 'Nivel Competente', text: 'Buena base. Con algunos ajustes tu respuesta puede ser más sólida.', short: 'Desempeño competente' }
  if (score >= 4) return { label: 'En desarrollo', text: 'Tu respuesta tiene ideas útiles, pero aún necesita más estructura y ejemplos.', short: 'Desempeño en desarrollo' }
  return { label: 'Necesita práctica', text: 'Esta respuesta necesita más contenido. Revisa las sugerencias y vuelve a intentarlo.', short: 'Necesita más práctica' }
}
