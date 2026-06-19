import type { Exercise, Workout, SessionPhase } from '../types'
import { createId } from './id'

/** Durée totale prévue d'un entraînement (travail + pauses), en secondes. */
export function workoutTotalSeconds(workout: Workout): number {
  return workout.exercises.reduce(
    (sum, ex) => sum + Math.max(0, ex.workDurationSeconds) + Math.max(0, ex.restDurationSeconds),
    0
  )
}

/** Durée de travail (hors pauses) d'un entraînement, en secondes. */
export function workoutWorkSeconds(workout: Workout): number {
  return workout.exercises.reduce((sum, ex) => sum + Math.max(0, ex.workDurationSeconds), 0)
}

/** Nombre de répétitions valide d'un exercice, ou undefined. */
export function exerciseReps(ex: Exercise): number | undefined {
  return ex.reps && ex.reps > 0 ? Math.round(ex.reps) : undefined
}

/**
 * Construit la liste séquentielle des phases d'une séance.
 * - Une phase de travail par exercice : chronométrée si `workDurationSeconds > 0`,
 *   sinon non chronométrée (basée sur les répétitions, on avance manuellement).
 * - Une phase de pause après chaque exercice (si durée > 0).
 * - La pause après le dernier exercice est ignorée pour terminer proprement.
 */
export function buildPhases(workout: Workout): SessionPhase[] {
  const phases: SessionPhase[] = []
  const exercises = workout.exercises
  exercises.forEach((ex, index) => {
    const work = Math.max(0, Math.round(ex.workDurationSeconds || 0))
    const reps = exerciseReps(ex)
    // On crée une phase de travail dès qu'il y a une durée OU des répétitions.
    if (work > 0 || reps) {
      phases.push({
        exerciseIndex: index,
        exerciseId: ex.id,
        exerciseName: ex.name,
        kind: 'work',
        durationSeconds: work,
        untimed: work === 0,
        reps,
        notes: ex.notes
      })
    }
    const rest = Math.max(0, Math.round(ex.restDurationSeconds))
    const isLast = index === exercises.length - 1
    if (rest > 0 && !isLast) {
      phases.push({
        exerciseIndex: index,
        exerciseId: ex.id,
        exerciseName: ex.name,
        kind: 'rest',
        durationSeconds: rest,
        untimed: false,
        notes: ex.notes
      })
    }
  })
  return phases
}

/** Crée un exercice vide avec des valeurs par défaut raisonnables. */
export function createEmptyExercise(): Exercise {
  return {
    id: createId('ex'),
    name: '',
    workDurationSeconds: 30,
    restDurationSeconds: 15,
    notes: ''
  }
}

/** Crée un entraînement vide. */
export function createEmptyWorkout(): Workout {
  const now = new Date().toISOString()
  return {
    id: createId('wk'),
    name: '',
    exercises: [createEmptyExercise()],
    notes: '',
    createdAt: now,
    updatedAt: now
  }
}
