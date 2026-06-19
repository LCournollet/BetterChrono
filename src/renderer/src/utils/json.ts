import type { Exercise, Workout } from '../types'
import { createId } from './id'

export const JSON_FORMAT_VERSION = 1

/** Forme d'un exercice dans le format d'échange JSON (sans id ni métadonnées). */
export interface WorkoutJsonExercise {
  name: string
  workDurationSeconds: number
  restDurationSeconds: number
  notes?: string
}

/** Forme d'un entraînement dans le format d'échange JSON. */
export interface WorkoutJsonPayload {
  name: string
  notes?: string
  exercises: WorkoutJsonExercise[]
}

/** Document JSON pour un entraînement unique. */
export interface SingleWorkoutDocument {
  version: number
  type: 'workout'
  workout: WorkoutJsonPayload
}

/** Document JSON pour plusieurs entraînements (bonus). */
export interface MultiWorkoutDocument {
  version: number
  type: 'workout-collection'
  workouts: WorkoutJsonPayload[]
}

/** Résultat de validation : succès avec données nettoyées, ou liste d'erreurs lisibles. */
export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: string[] }

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

function toJsonExercise(ex: Exercise): WorkoutJsonExercise {
  const payload: WorkoutJsonExercise = {
    name: ex.name,
    workDurationSeconds: ex.workDurationSeconds,
    restDurationSeconds: ex.restDurationSeconds
  }
  if (ex.notes && ex.notes.trim().length > 0) payload.notes = ex.notes
  return payload
}

function toJsonWorkout(workout: Workout): WorkoutJsonPayload {
  const payload: WorkoutJsonPayload = {
    name: workout.name,
    exercises: workout.exercises.map(toJsonExercise)
  }
  if (workout.notes && workout.notes.trim().length > 0) payload.notes = workout.notes
  return payload
}

/** Sérialise un entraînement unique vers une chaîne JSON lisible. */
export function exportWorkoutToJson(workout: Workout): string {
  const doc: SingleWorkoutDocument = {
    version: JSON_FORMAT_VERSION,
    type: 'workout',
    workout: toJsonWorkout(workout)
  }
  return JSON.stringify(doc, null, 2)
}

/** Sérialise plusieurs entraînements vers une chaîne JSON lisible (bonus). */
export function exportWorkoutsToJson(workouts: Workout[]): string {
  const doc: MultiWorkoutDocument = {
    version: JSON_FORMAT_VERSION,
    type: 'workout-collection',
    workouts: workouts.map(toJsonWorkout)
  }
  return JSON.stringify(doc, null, 2)
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Valide la forme d'un payload d'entraînement (sans le convertir).
 * Ne fait jamais confiance aux données entrantes : vérifie chaque type et valeur.
 */
export function validateWorkoutPayload(
  value: unknown,
  pathLabel = 'workout'
): ValidationResult<WorkoutJsonPayload> {
  const errors: string[] = []

  if (!isObject(value)) {
    return { ok: false, errors: [`Le champ « ${pathLabel} » est manquant ou invalide.`] }
  }

  const name = value.name
  if (typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Le nom de l\'entraînement est manquant ou vide.')
  }

  const rawExercises = value.exercises
  if (!Array.isArray(rawExercises)) {
    errors.push('La liste des exercices est manquante.')
  } else if (rawExercises.length === 0) {
    errors.push('Aucun exercice détecté dans l\'entraînement.')
  } else {
    rawExercises.forEach((rawEx, i) => {
      const label = `Exercice ${i + 1}`
      if (!isObject(rawEx)) {
        errors.push(`${label} : format invalide.`)
        return
      }
      if (typeof rawEx.name !== 'string' || rawEx.name.trim().length === 0) {
        errors.push(`${label} : nom manquant.`)
      }
      const work = rawEx.workDurationSeconds
      if (typeof work !== 'number' || !Number.isFinite(work)) {
        errors.push(`${label} : durée de travail invalide.`)
      } else if (work < 0) {
        errors.push(`${label} : la durée de travail ne peut pas être négative.`)
      } else if (work === 0) {
        errors.push(`${label} : la durée de travail doit être supérieure à zéro.`)
      }
      const rest = rawEx.restDurationSeconds
      if (typeof rest !== 'number' || !Number.isFinite(rest)) {
        errors.push(`${label} : durée de pause invalide.`)
      } else if (rest < 0) {
        errors.push(`${label} : la durée de pause ne peut pas être négative.`)
      }
      if (rawEx.notes !== undefined && typeof rawEx.notes !== 'string') {
        errors.push(`${label} : les notes doivent être du texte.`)
      }
    })
  }

  if (value.notes !== undefined && typeof value.notes !== 'string') {
    errors.push('Les notes de l\'entraînement doivent être du texte.')
  }

  if (errors.length > 0) return { ok: false, errors }

  const clean: WorkoutJsonPayload = {
    name: (name as string).trim(),
    exercises: (rawExercises as Record<string, unknown>[]).map((ex) => {
      const e: WorkoutJsonExercise = {
        name: (ex.name as string).trim(),
        workDurationSeconds: Math.round(ex.workDurationSeconds as number),
        restDurationSeconds: Math.round(ex.restDurationSeconds as number)
      }
      const notes = ex.notes as string | undefined
      if (notes && notes.trim().length > 0) e.notes = notes.trim()
      return e
    })
  }
  const wkNotes = value.notes as string | undefined
  if (wkNotes && wkNotes.trim().length > 0) clean.notes = wkNotes.trim()

  return { ok: true, data: clean }
}

/**
 * Analyse une chaîne JSON et renvoie un (ou plusieurs) payloads d'entraînement validés.
 * Accepte les documents { type: 'workout' } et { type: 'workout-collection' }.
 */
export function validateWorkoutJson(raw: string): ValidationResult<WorkoutJsonPayload[]> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, errors: ['JSON invalide : la syntaxe ne peut pas être analysée.'] }
  }

  if (!isObject(parsed)) {
    return { ok: false, errors: ['JSON invalide : un objet est attendu.'] }
  }

  // Version : on avertit mais on n'échoue pas (compatibilité ascendante).
  const errors: string[] = []
  if (parsed.version !== undefined && typeof parsed.version !== 'number') {
    errors.push('Le champ « version » doit être un nombre.')
  }

  // Collection de plusieurs entraînements.
  if (parsed.type === 'workout-collection' || Array.isArray(parsed.workouts)) {
    const list = parsed.workouts
    if (!Array.isArray(list) || list.length === 0) {
      return { ok: false, errors: ['Aucun entraînement détecté dans la collection.'] }
    }
    const payloads: WorkoutJsonPayload[] = []
    list.forEach((w, i) => {
      const res = validateWorkoutPayload(w, `workouts[${i}]`)
      if (res.ok) payloads.push(res.data)
      else errors.push(...res.errors.map((e) => `Entraînement ${i + 1} — ${e}`))
    })
    if (errors.length > 0) return { ok: false, errors }
    return { ok: true, data: payloads }
  }

  // Entraînement unique : soit { workout: {...} }, soit l'objet directement.
  const candidate = isObject(parsed.workout) ? parsed.workout : parsed
  const res = validateWorkoutPayload(candidate)
  if (!res.ok) return { ok: false, errors: [...errors, ...res.errors] }
  return { ok: true, data: [res.data] }
}

// ---------------------------------------------------------------------------
// Import (conversion payload -> entité interne)
// ---------------------------------------------------------------------------

/**
 * Convertit un payload validé en entité Workout complète.
 * Génère de nouveaux ids et ajoute createdAt / updatedAt automatiquement.
 */
export function payloadToWorkout(payload: WorkoutJsonPayload): Workout {
  const now = new Date().toISOString()
  const exercises: Exercise[] = payload.exercises.map((ex) => ({
    id: createId('ex'),
    name: ex.name,
    workDurationSeconds: ex.workDurationSeconds,
    restDurationSeconds: ex.restDurationSeconds,
    notes: ex.notes
  }))
  return {
    id: createId('wk'),
    name: payload.name,
    notes: payload.notes,
    exercises,
    createdAt: now,
    updatedAt: now
  }
}

/**
 * Importe un ou plusieurs entraînements depuis une chaîne JSON.
 * Renvoie des entités Workout prêtes à l'emploi (nouveaux ids, dates).
 */
export function importWorkoutsFromJson(raw: string): ValidationResult<Workout[]> {
  const res = validateWorkoutJson(raw)
  if (!res.ok) return res
  return { ok: true, data: res.data.map(payloadToWorkout) }
}
