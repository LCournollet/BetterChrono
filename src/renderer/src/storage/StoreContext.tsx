import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Workout, WorkoutSession } from '../types'
import { createId } from '../utils/id'
import { STORAGE_KEYS, readFlag, readJson, writeFlag, writeJson } from './localStorage'
import { buildSeedSessions, buildSeedWorkouts } from './seed'

interface StoreContextValue {
  workouts: Workout[]
  sessions: WorkoutSession[]
  // Workouts
  getWorkout: (id: string) => Workout | undefined
  addWorkout: (workout: Workout) => void
  updateWorkout: (workout: Workout) => void
  deleteWorkout: (id: string) => void
  duplicateWorkout: (id: string) => Workout | undefined
  importWorkouts: (workouts: Workout[]) => void
  // Sessions
  addSession: (session: WorkoutSession) => void
  deleteSession: (id: string) => void
  // Maintenance
  clearAllData: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    // Amorçage des données de démonstration au tout premier lancement.
    if (!readFlag(STORAGE_KEYS.seeded)) {
      const seedWorkouts = buildSeedWorkouts()
      const seedSessions = buildSeedSessions(seedWorkouts)
      writeJson(STORAGE_KEYS.workouts, seedWorkouts)
      writeJson(STORAGE_KEYS.sessions, seedSessions)
      writeFlag(STORAGE_KEYS.seeded, true)
      return seedWorkouts
    }
    return readJson<Workout[]>(STORAGE_KEYS.workouts, [])
  })

  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    readJson<WorkoutSession[]>(STORAGE_KEYS.sessions, [])
  )

  // Persistance automatique. On évite d'écrire au tout premier rendu inutilement
  // mais l'écriture est idempotente donc sans risque.
  const firstRender = useRef(true)
  useEffect(() => {
    writeJson(STORAGE_KEYS.workouts, workouts)
  }, [workouts])

  useEffect(() => {
    writeJson(STORAGE_KEYS.sessions, sessions)
  }, [sessions])

  useEffect(() => {
    firstRender.current = false
  }, [])

  const getWorkout = useCallback(
    (id: string) => workouts.find((w) => w.id === id),
    [workouts]
  )

  const addWorkout = useCallback((workout: Workout) => {
    setWorkouts((prev) => [...prev, workout])
  }, [])

  const updateWorkout = useCallback((workout: Workout) => {
    setWorkouts((prev) =>
      prev.map((w) => (w.id === workout.id ? { ...workout, updatedAt: new Date().toISOString() } : w))
    )
  }, [])

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const duplicateWorkout = useCallback(
    (id: string): Workout | undefined => {
      const original = workouts.find((w) => w.id === id)
      if (!original) return undefined
      const now = new Date().toISOString()
      const copy: Workout = {
        ...original,
        id: createId('wk'),
        name: `${original.name} (copie)`,
        createdAt: now,
        updatedAt: now,
        exercises: original.exercises.map((ex) => ({ ...ex, id: createId('ex') }))
      }
      setWorkouts((prev) => [...prev, copy])
      return copy
    },
    [workouts]
  )

  const importWorkouts = useCallback((incoming: Workout[]) => {
    setWorkouts((prev) => [...prev, ...incoming])
  }, [])

  const addSession = useCallback((session: WorkoutSession) => {
    setSessions((prev) => [...prev, session])
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const clearAllData = useCallback(() => {
    setWorkouts([])
    setSessions([])
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      workouts,
      sessions,
      getWorkout,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      duplicateWorkout,
      importWorkouts,
      addSession,
      deleteSession,
      clearAllData
    }),
    [
      workouts,
      sessions,
      getWorkout,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      duplicateWorkout,
      importWorkouts,
      addSession,
      deleteSession,
      clearAllData
    ]
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore doit être utilisé dans un <StoreProvider>')
  return ctx
}
