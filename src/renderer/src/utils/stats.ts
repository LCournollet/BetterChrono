import type { WorkoutSession } from '../types'
import { toDateKey, weekDays } from './time'

export interface WeekStats {
  sessionCount: number
  totalSeconds: number
  completedCount: number
  interruptedCount: number
  /** Entraînements les plus fréquents (nom + nombre), triés décroissant. */
  topWorkouts: { name: string; count: number }[]
  /** Sessions de la semaine considérée. */
  sessions: WorkoutSession[]
}

/** Calcule les statistiques pour la semaine contenant `referenceDate`. */
export function computeWeekStats(
  sessions: WorkoutSession[],
  referenceDate: Date
): WeekStats {
  const keys = new Set(weekDays(referenceDate).map(toDateKey))
  const weekSessions = sessions.filter((s) => keys.has(s.date))

  const totalSeconds = weekSessions.reduce((sum, s) => sum + s.totalDurationSeconds, 0)
  const completedCount = weekSessions.filter((s) => s.completed).length
  const interruptedCount = weekSessions.filter((s) => s.interrupted).length

  const counts = new Map<string, number>()
  weekSessions.forEach((s) => counts.set(s.workoutName, (counts.get(s.workoutName) ?? 0) + 1))
  const topWorkouts = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return {
    sessionCount: weekSessions.length,
    totalSeconds,
    completedCount,
    interruptedCount,
    topWorkouts,
    sessions: weekSessions
  }
}
