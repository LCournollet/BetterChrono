import type { Workout, WorkoutSession } from '../types'
import { createId } from '../utils/id'
import { toDateKey } from '../utils/time'

/** Données de démonstration créées au premier lancement pour tester l'app. */
export function buildSeedWorkouts(): Workout[] {
  const now = new Date().toISOString()
  return [
    {
      id: createId('wk'),
      name: 'Haut du corps',
      notes: 'Séance de renforcement — pompes, dips et gainage.',
      createdAt: now,
      updatedAt: now,
      exercises: [
        {
          id: createId('ex'),
          name: 'Pompes',
          workDurationSeconds: 45,
          restDurationSeconds: 30,
          notes: 'Tempo contrôlé, gainage actif.'
        },
        {
          id: createId('ex'),
          name: 'Dips',
          workDurationSeconds: 30,
          restDurationSeconds: 45,
          notes: 'Amplitude propre.'
        },
        {
          id: createId('ex'),
          name: 'Gainage planche',
          workDurationSeconds: 60,
          restDurationSeconds: 30,
          notes: 'Ne pas creuser le dos.'
        },
        {
          id: createId('ex'),
          name: 'Pompes diamant',
          workDurationSeconds: 30,
          restDurationSeconds: 0,
          notes: 'Coudes près du corps.'
        }
      ]
    },
    {
      id: createId('wk'),
      name: 'Mobilité & récupération',
      notes: 'Routine douce de mobilité articulaire.',
      createdAt: now,
      updatedAt: now,
      exercises: [
        {
          id: createId('ex'),
          name: 'Rotation des épaules',
          workDurationSeconds: 40,
          restDurationSeconds: 15
        },
        {
          id: createId('ex'),
          name: 'Étirement ischio-jambiers',
          workDurationSeconds: 50,
          restDurationSeconds: 15
        },
        {
          id: createId('ex'),
          name: 'Ouverture de hanches',
          workDurationSeconds: 50,
          restDurationSeconds: 0
        }
      ]
    }
  ]
}

/** Quelques séances passées pour peupler le calendrier et les statistiques. */
export function buildSeedSessions(workouts: Workout[]): WorkoutSession[] {
  if (workouts.length === 0) return []
  const main = workouts[0]
  const sessions: WorkoutSession[] = []
  // Trois séances réparties sur les jours précédents.
  const offsets = [0, 2, 4]
  offsets.forEach((daysAgo, i) => {
    const start = new Date()
    start.setDate(start.getDate() - daysAgo)
    start.setHours(8 + i, 30, 0, 0)
    const interrupted = i === 1
    const totalSeconds = interrupted ? 240 : 600
    const end = new Date(start.getTime() + totalSeconds * 1000)
    const workout = workouts[i % workouts.length]
    sessions.push({
      id: createId('ses'),
      workoutId: workout.id,
      workoutName: workout.name,
      date: toDateKey(start),
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      totalDurationSeconds: totalSeconds,
      completed: !interrupted,
      interrupted,
      exercisesCompleted: interrupted ? 2 : workout.exercises.length,
      exercisesTotal: workout.exercises.length,
      status: interrupted ? 'interrupted' : 'completed'
    })
  })
  // Évite une variable inutilisée si la liste ne contient qu'un entraînement.
  void main
  return sessions
}
