import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SessionPhase, Workout } from '../types'
import { buildPhases } from '../utils/workout'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface TimerState {
  status: TimerStatus
  phases: SessionPhase[]
  currentPhaseIndex: number
  currentPhase: SessionPhase | undefined
  nextPhase: SessionPhase | undefined
  remainingSeconds: number
  /** Numéro de l'exercice en cours (1-based), tous exercices confondus. */
  currentExerciseNumber: number
  totalExercises: number
  /** Nombre d'exercices dont la phase de travail a été menée à terme. */
  exercisesCompleted: number
  /** Horodatage ISO du démarrage de la séance (undefined si pas démarrée). */
  startedAt: string | undefined
  /** Durée écoulée depuis le démarrage, en secondes (temps réel). */
  elapsedSeconds: number
}

export interface TimerControls {
  start: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  previous: () => void
  /** Ajoute (n>0) ou retire (n<0) des secondes au temps restant. */
  adjust: (delta: number) => void
}

interface Snapshot {
  workoutId: string
  currentPhaseIndex: number
  remainingSeconds: number
  status: TimerStatus
  startedAt: string
  completed: number[]
}

const ACTIVE_KEY = 'betterchrono.activeSession'

function loadSnapshot(workoutId: string): Snapshot | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_KEY)
    if (!raw) return null
    const snap = JSON.parse(raw) as Snapshot
    if (snap.workoutId !== workoutId) return null
    if (snap.status === 'finished' || snap.status === 'idle') return null
    return snap
  } catch {
    return null
  }
}

function saveSnapshot(snap: Snapshot): void {
  try {
    sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(snap))
  } catch {
    /* ignore */
  }
}

function clearSnapshot(): void {
  try {
    sessionStorage.removeItem(ACTIVE_KEY)
  } catch {
    /* ignore */
  }
}

/**
 * Hook gérant toute la logique du chronomètre de séance.
 * Logique métier isolée de l'interface : enchaînement travail/pause,
 * pause/reprise, navigation, ajustements ±secondes, persistance au rechargement.
 */
export function useTimer(workout: Workout | undefined): TimerState & { controls: TimerControls } {
  const phases = useMemo<SessionPhase[]>(
    () => (workout ? buildPhases(workout) : []),
    [workout]
  )

  const [status, setStatus] = useState<TimerStatus>('idle')
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(phases[0]?.durationSeconds ?? 0)
  const [startedAt, setStartedAt] = useState<string | undefined>(undefined)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const completedRef = useRef<Set<number>>(new Set())
  const [completedCount, setCompletedCount] = useState(0)

  // Échéance absolue de la phase courante (ms epoch) tant qu'on tourne.
  const phaseEndAtRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalExercises = workout?.exercises.length ?? 0

  // Restaure une séance en cours après rechargement de page.
  useEffect(() => {
    if (!workout) return
    const snap = loadSnapshot(workout.id)
    if (snap && snap.currentPhaseIndex < phases.length) {
      setCurrentPhaseIndex(snap.currentPhaseIndex)
      setRemainingSeconds(snap.remainingSeconds)
      setStartedAt(snap.startedAt)
      completedRef.current = new Set(snap.completed)
      setCompletedCount(snap.completed.length)
      // On reprend toujours en pause pour laisser l'utilisateur décider.
      setStatus('paused')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout?.id, phases.length])

  const syncCompleted = useCallback(() => {
    setCompletedCount(completedRef.current.size)
  }, [])

  const markWorkDone = useCallback(
    (phaseIndex: number) => {
      const phase = phases[phaseIndex]
      if (phase && phase.kind === 'work') {
        completedRef.current.add(phase.exerciseIndex)
        syncCompleted()
      }
    },
    [phases, syncCompleted]
  )

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const finish = useCallback(() => {
    stopInterval()
    phaseEndAtRef.current = null
    setStatus('finished')
  }, [stopInterval])

  // Passe à la phase d'index donné, ou termine si hors limites.
  const goToPhase = useCallback(
    (index: number, autoRun: boolean) => {
      if (index >= phases.length) {
        finish()
        return
      }
      const clamped = Math.max(0, index)
      const phase = phases[clamped]
      setCurrentPhaseIndex(clamped)
      setRemainingSeconds(phase.durationSeconds)
      // Une phase non chronométrée (répétitions) n'a pas d'échéance : on attend « Suivant ».
      if (autoRun && !phase.untimed && phase.durationSeconds > 0) {
        phaseEndAtRef.current = Date.now() + phase.durationSeconds * 1000
      } else {
        phaseEndAtRef.current = null
      }
    },
    [phases, finish]
  )

  // Boucle de décompte basée sur l'horloge (sans dérive).
  useEffect(() => {
    if (status !== 'running') {
      stopInterval()
      return
    }
    intervalRef.current = setInterval(() => {
      const end = phaseEndAtRef.current
      if (end === null) return
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000))
      setRemainingSeconds(remaining)
      if (remaining <= 0) {
        // Fin de la phase courante : on enchaîne automatiquement.
        setCurrentPhaseIndex((idx) => {
          markWorkDone(idx)
          const nextIndex = idx + 1
          if (nextIndex >= phases.length) {
            finish()
            return idx
          }
          const nextPhase = phases[nextIndex]
          if (nextPhase.untimed || nextPhase.durationSeconds <= 0) {
            // Phase en répétitions : pas de décompte, on attend une action manuelle.
            phaseEndAtRef.current = null
            setRemainingSeconds(0)
          } else {
            phaseEndAtRef.current = Date.now() + nextPhase.durationSeconds * 1000
            setRemainingSeconds(nextPhase.durationSeconds)
          }
          return nextIndex
        })
      }
    }, 200)
    return stopInterval
  }, [status, phases, markWorkDone, finish, stopInterval])

  // Met à jour le temps total écoulé chaque seconde tant que la séance est active.
  useEffect(() => {
    if (!startedAt || status === 'idle' || status === 'finished') return
    const tick = (): void =>
      setElapsedSeconds(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt, status])

  // Persistance de la séance active (pour survivre à un rechargement).
  useEffect(() => {
    if (!workout) return
    if (status === 'running' || status === 'paused') {
      saveSnapshot({
        workoutId: workout.id,
        currentPhaseIndex,
        remainingSeconds,
        status,
        startedAt: startedAt ?? new Date().toISOString(),
        completed: Array.from(completedRef.current)
      })
    } else {
      clearSnapshot()
    }
  }, [workout, status, currentPhaseIndex, remainingSeconds, startedAt])

  // ----- Contrôles -----

  const start = useCallback(() => {
    if (phases.length === 0) return
    completedRef.current = new Set()
    setCompletedCount(0)
    setStartedAt(new Date().toISOString())
    setElapsedSeconds(0)
    setCurrentPhaseIndex(0)
    const first = phases[0]
    setRemainingSeconds(first.durationSeconds)
    if (!first.untimed && first.durationSeconds > 0) {
      phaseEndAtRef.current = Date.now() + first.durationSeconds * 1000
    } else {
      phaseEndAtRef.current = null
    }
    setStatus('running')
  }, [phases])

  const pause = useCallback(() => {
    setStatus((prev) => {
      if (prev !== 'running') return prev
      // Fige le temps restant à l'instant de la pause.
      const end = phaseEndAtRef.current
      if (end !== null) {
        setRemainingSeconds(Math.max(0, Math.ceil((end - Date.now()) / 1000)))
      }
      phaseEndAtRef.current = null
      return 'paused'
    })
  }, [])

  const resume = useCallback(() => {
    setStatus((prev) => {
      if (prev !== 'paused') return prev
      const phase = phases[currentPhaseIndex]
      if (phase && !phase.untimed) {
        setRemainingSeconds((r) => {
          phaseEndAtRef.current = Date.now() + r * 1000
          return r
        })
      } else {
        // Reprise sur une phase en répétitions : aucune échéance à reprogrammer.
        phaseEndAtRef.current = null
      }
      return 'running'
    })
  }, [phases, currentPhaseIndex])

  const stop = useCallback(() => {
    finish()
  }, [finish])

  const next = useCallback(() => {
    if (status === 'idle' || status === 'finished') return
    markWorkDone(currentPhaseIndex)
    const running = status === 'running'
    goToPhase(currentPhaseIndex + 1, running)
  }, [status, currentPhaseIndex, markWorkDone, goToPhase])

  const previous = useCallback(() => {
    if (status === 'idle' || status === 'finished') return
    const running = status === 'running'
    goToPhase(Math.max(0, currentPhaseIndex - 1), running)
  }, [status, currentPhaseIndex, goToPhase])

  const adjust = useCallback(
    (delta: number) => {
      if (status === 'idle' || status === 'finished') return
      // Pas d'ajustement de temps sur une phase en répétitions (non chronométrée).
      if (phases[currentPhaseIndex]?.untimed) return
      setRemainingSeconds((r) => {
        const updated = Math.max(0, r + delta)
        if (status === 'running' && phaseEndAtRef.current !== null) {
          phaseEndAtRef.current = Date.now() + updated * 1000
        }
        return updated
      })
    },
    [status, phases, currentPhaseIndex]
  )

  const currentPhase = phases[currentPhaseIndex]
  const nextPhase = phases[currentPhaseIndex + 1]
  const currentExerciseNumber = currentPhase ? currentPhase.exerciseIndex + 1 : 0

  return {
    status,
    phases,
    currentPhaseIndex,
    currentPhase,
    nextPhase,
    remainingSeconds,
    currentExerciseNumber,
    totalExercises,
    exercisesCompleted: completedCount,
    startedAt,
    elapsedSeconds,
    controls: { start, pause, resume, stop, next, previous, adjust }
  }
}
