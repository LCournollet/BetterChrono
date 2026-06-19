/**
 * Modèle de données BetterChrono.
 * Toutes les durées sont exprimées en secondes.
 */

export interface Exercise {
  id: string
  name: string
  workDurationSeconds: number
  restDurationSeconds: number
  notes?: string
}

export interface Workout {
  id: string
  name: string
  exercises: Exercise[]
  notes?: string
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

export type SessionStatus = 'completed' | 'interrupted'

export interface WorkoutSession {
  id: string
  workoutId: string
  workoutName: string
  date: string // YYYY-MM-DD (jour local de la séance)
  startedAt: string // ISO 8601
  endedAt: string // ISO 8601
  totalDurationSeconds: number
  completed: boolean
  interrupted: boolean
  /** Nombre d'exercices effectivement réalisés (phase de travail terminée). */
  exercisesCompleted: number
  /** Nombre total d'exercices prévus dans l'entraînement. */
  exercisesTotal: number
  status: SessionStatus
}

/** Page de navigation actuelle. */
export type Page =
  | 'dashboard'
  | 'workouts'
  | 'workout-edit'
  | 'session'
  | 'calendar'
  | 'statistics'
  | 'settings'

/** Phase d'un exercice pendant une séance. */
export type PhaseKind = 'work' | 'rest'

export interface SessionPhase {
  exerciseIndex: number
  exerciseId: string
  exerciseName: string
  kind: PhaseKind
  durationSeconds: number
  notes?: string
}
