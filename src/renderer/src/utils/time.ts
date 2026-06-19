/** Formate un nombre de secondes en MM:SS (ou HH:MM:SS au-delà d'une heure). */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number): string => n.toString().padStart(2, '0')
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

/** Formate une durée de façon lisible : "12 min", "1 h 05", "45 s". */
export function formatHumanDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  if (s < 60) return `${s} s`
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  if (hours > 0) {
    return `${hours} h ${minutes.toString().padStart(2, '0')}`
  }
  const seconds = s % 60
  if (seconds === 0) return `${minutes} min`
  return `${minutes} min ${seconds.toString().padStart(2, '0')}`
}

/** Renvoie la date locale au format YYYY-MM-DD. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Heure locale au format HH:MM. */
export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Renvoie le lundi (00:00) de la semaine contenant `date`. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay() // 0 = dimanche, 1 = lundi...
  const diff = (day + 6) % 7 // nombre de jours depuis lundi
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Renvoie les 7 dates (lundi → dimanche) de la semaine contenant `date`. */
export function weekDays(date: Date): Date[] {
  const monday = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + i * DAY_MS))
}

/** Ajoute (ou retire) un nombre de semaines à une date. */
export function addWeeks(date: Date, weeks: number): Date {
  return new Date(date.getTime() + weeks * 7 * DAY_MS)
}

const WEEKDAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function weekdayLabel(date: Date): string {
  const day = date.getDay()
  const index = (day + 6) % 7
  return WEEKDAY_LABELS[index]
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatWeekRange(date: Date): string {
  const days = weekDays(date)
  const first = days[0]
  const last = days[6]
  const sameMonth = first.getMonth() === last.getMonth()
  const firstStr = first.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: sameMonth ? undefined : 'short'
  })
  const lastStr = last.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${firstStr} – ${lastStr}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}
