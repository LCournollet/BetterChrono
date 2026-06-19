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

/**
 * Construit la liste séquentielle des phases d'une séance.
 * - Une phase de travail par exercice (si durée > 0).
 * - Une phase de pause après chaque exercice (si durée > 0).
 * - La pause après le dernier exercice est ignorée pour terminer proprement.
 */
export function buildPhases(workout: Workout): SessionPhase[] {
  const phases: SessionPhase[] = []
  const exercises = workout.exercises
  exercises.forEach((ex, index) => {
    const work = Math.max(0, Math.round(ex.workDurationSeconds))
    if (work > 0) {
      phases.push({
        exerciseIndex: index,
        exerciseId: ex.id,
        exerciseName: ex.name,
        kind: 'work',
        durationSeconds: work,
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
