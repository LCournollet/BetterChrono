import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { Workout, WorkoutSession } from '../types'
import { useTimer } from '../hooks/useTimer'
import { useStore } from '../storage/StoreContext'
import { TimerDisplay } from './TimerDisplay'
import { Card } from './ui/Card'
import { Button, IconButton } from './ui/Button'
import { Badge } from './ui/Badge'
import { ConfirmDialog } from './ui/ConfirmDialog'
import {
  IconPlay,
  IconPause,
  IconStop,
  IconNext,
  IconPrev,
  IconCheck,
  IconClock
} from './Icons'
import { createId } from '../utils/id'
import { toDateKey, formatHumanDuration, formatDuration, formatTime } from '../utils/time'
import { cn } from '../utils/cn'

export interface SessionRunnerProps {
  workout: Workout
  onExit: () => void
}

export function SessionRunner({ workout, onExit }: SessionRunnerProps): React.JSX.Element {
  const { addSession } = useStore()
  const timer = useTimer(workout)
  const { controls, status } = timer

  const [confirmStop, setConfirmStop] = useState(false)
  const stoppedManually = useRef(false)
  const recordedRef = useRef(false)
  const [summary, setSummary] = useState<WorkoutSession | null>(null)

  const adjustDisabled =
    status === 'idle' || status === 'finished' || Boolean(timer.currentPhase?.untimed)

  // Enregistrement automatique de la séance à la fin (terminée ou interrompue).
  useEffect(() => {
    if (status !== 'finished' || recordedRef.current) return
    recordedRef.current = true
    const start = timer.startedAt ? new Date(timer.startedAt) : new Date()
    const end = new Date()
    const completed = !stoppedManually.current
    const session: WorkoutSession = {
      id: createId('ses'),
      workoutId: workout.id,
      workoutName: workout.name || 'Entraînement sans nom',
      date: toDateKey(start),
      startedAt: start.toISOString(),
      endedAt: end.toISOString(),
      totalDurationSeconds: timer.elapsedSeconds,
      completed,
      interrupted: !completed,
      exercisesCompleted: completed ? workout.exercises.length : timer.exercisesCompleted,
      exercisesTotal: workout.exercises.length,
      status: completed ? 'completed' : 'interrupted'
    }
    addSession(session)
    setSummary(session)
  }, [status, timer, workout, addSession])

  const handleStop = useCallback(() => {
    stoppedManually.current = true
    controls.stop()
    setConfirmStop(false)
  }, [controls])

  // Raccourcis clavier : espace = pause/reprise, flèches = navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (status === 'finished') return
      if (e.code === 'Space') {
        e.preventDefault()
        if (status === 'idle') controls.start()
        else if (status === 'running') controls.pause()
        else if (status === 'paused') controls.resume()
      } else if (e.code === 'ArrowRight') {
        controls.next()
      } else if (e.code === 'ArrowLeft') {
        controls.previous()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, controls])

  // -------- Écran de résumé --------
  if (summary) {
    return (
      <SessionSummary
        session={summary}
        onClose={onExit}
      />
    )
  }

  const phase = timer.currentPhase
  const phaseDuration = phase?.durationSeconds ?? 0
  const progressLabel =
    timer.totalExercises > 0
      ? `Exercice ${Math.min(timer.currentExerciseNumber || 1, timer.totalExercises)} / ${timer.totalExercises}`
      : ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink-faint">Séance en cours</p>
          <h1 className="text-xl font-semibold tracking-tight text-ink">{workout.name}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
          <IconClock width={16} height={16} className="text-ink-faint" />
          <span className="text-sm text-ink-soft">Temps total</span>
          <span className="text-sm font-semibold text-ink tabular-nums">
            {formatDuration(timer.elapsedSeconds)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Colonne centrale : timer + contrôles */}
        <Card className="flex flex-col items-center gap-8 py-10">
          <TimerDisplay
            remainingSeconds={timer.remainingSeconds}
            phaseDurationSeconds={phaseDuration}
            kind={phase?.kind ?? 'work'}
            exerciseName={phase?.exerciseName ?? workout.exercises[0]?.name ?? ''}
            progressLabel={progressLabel}
            untimed={phase?.untimed}
            reps={phase?.reps}
          />

          {/* Prochaine étape */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-faint">À suivre :</span>
            {timer.nextPhase ? (
              <span className="font-medium text-ink-soft">
                {timer.nextPhase.kind === 'work' ? 'Travail' : 'Pause'} — {timer.nextPhase.exerciseName}
                <span className="ml-1 text-ink-faint tabular-nums">
                  (
                  {timer.nextPhase.untimed
                    ? `×${timer.nextPhase.reps} reps`
                    : formatDuration(timer.nextPhase.durationSeconds)}
                  )
                </span>
              </span>
            ) : (
              <span className="font-medium text-ink-soft">Fin de la séance</span>
            )}
          </div>

          {/* Ajustements de temps */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={adjustDisabled} onClick={() => controls.adjust(-10)}>
              −10 s
            </Button>
            <Button variant="secondary" size="sm" disabled={adjustDisabled} onClick={() => controls.adjust(-5)}>
              −5 s
            </Button>
            <Button variant="secondary" size="sm" disabled={adjustDisabled} onClick={() => controls.adjust(5)}>
              +5 s
            </Button>
            <Button variant="secondary" size="sm" disabled={adjustDisabled} onClick={() => controls.adjust(10)}>
              +10 s
            </Button>
          </div>

          {/* Contrôles principaux */}
          <div className="flex items-center gap-3">
            <IconButton
              label="Exercice précédent"
              variant="secondary"
              size="lg"
              disabled={status === 'idle'}
              onClick={controls.previous}
            >
              <IconPrev width={22} height={22} />
            </IconButton>

            {status === 'idle' ? (
              <Button
                variant="primary"
                size="lg"
                iconLeft={<IconPlay width={20} height={20} />}
                onClick={controls.start}
                className="min-w-[150px]"
              >
                Démarrer
              </Button>
            ) : status === 'running' ? (
              <Button
                variant="primary"
                size="lg"
                iconLeft={<IconPause width={20} height={20} />}
                onClick={controls.pause}
                className="min-w-[150px]"
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="success"
                size="lg"
                iconLeft={<IconPlay width={20} height={20} />}
                onClick={controls.resume}
                className="min-w-[150px]"
              >
                Reprendre
              </Button>
            )}

            <IconButton
              label="Exercice suivant"
              variant="secondary"
              size="lg"
              disabled={status === 'idle'}
              onClick={controls.next}
            >
              <IconNext width={22} height={22} />
            </IconButton>

            <IconButton
              label="Arrêter la séance"
              variant="danger"
              size="lg"
              disabled={status === 'idle'}
              onClick={() => setConfirmStop(true)}
            >
              <IconStop width={20} height={20} />
            </IconButton>
          </div>

          <p className="text-xs text-ink-faint">
            Espace : pause / reprise · ← → : exercice précédent / suivant
          </p>
        </Card>

        {/* Colonne latérale : liste des exercices et leur statut */}
        <Card padded={false} className="flex flex-col overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-sm font-semibold text-ink">Déroulé de la séance</h2>
          </div>
          <ul className="max-h-[560px] flex-1 overflow-y-auto p-2">
            {workout.exercises.map((ex, i) => {
              const isCurrent = phase?.exerciseIndex === i && status !== 'idle'
              const isDone =
                status !== 'idle' &&
                (phase ? i < phase.exerciseIndex : false)
              return (
                <li
                  key={ex.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5',
                    isCurrent && 'bg-accent-50'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                      isDone
                        ? 'bg-sage-500 text-white'
                        : isCurrent
                          ? 'bg-accent-500 text-white'
                          : 'bg-canvas text-ink-faint'
                    )}
                  >
                    {isDone ? <IconCheck width={14} height={14} /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'truncate text-sm',
                        isCurrent ? 'font-semibold text-ink' : 'text-ink-soft'
                      )}
                    >
                      {ex.name || 'Exercice'}
                    </p>
                    <p className="text-xs text-ink-faint tabular-nums">
                      {ex.workDurationSeconds > 0 ? `${ex.workDurationSeconds}s travail` : null}
                      {ex.workDurationSeconds > 0 && ex.reps ? ' · ' : null}
                      {ex.reps ? `${ex.reps} reps` : null}
                      {ex.restDurationSeconds > 0 && ` · ${ex.restDurationSeconds}s pause`}
                    </p>
                  </div>
                  {isCurrent && (
                    <Badge tone={phase?.kind === 'rest' ? 'rest' : 'work'} dot>
                      {phase?.kind === 'rest' ? 'Pause' : 'Travail'}
                    </Badge>
                  )}
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmStop}
        title="Arrêter la séance ?"
        message="La séance sera enregistrée comme interrompue. Votre progression actuelle sera conservée dans l'historique."
        confirmLabel="Arrêter et enregistrer"
        cancelLabel="Continuer"
        onConfirm={handleStop}
        onCancel={() => setConfirmStop(false)}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------

function SessionSummary({
  session,
  onClose
}: {
  session: WorkoutSession
  onClose: () => void
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-xl space-y-6 py-6">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'mb-4 flex h-16 w-16 items-center justify-center rounded-full',
            session.completed ? 'bg-sage-50 text-sage-600' : 'bg-amber-50 text-amber-600'
          )}
        >
          {session.completed ? <IconCheck width={30} height={30} /> : <IconStop width={26} height={26} />}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {session.completed ? 'Séance terminée' : 'Séance interrompue'}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{session.workoutName}</p>
      </div>

      <Card className="divide-y divide-line">
        <SummaryRow label="Statut">
          <Badge tone={session.completed ? 'completed' : 'interrupted'} dot>
            {session.completed ? 'Terminé' : 'Interrompu'}
          </Badge>
        </SummaryRow>
        <SummaryRow label="Durée totale">
          <span className="font-semibold tabular-nums">
            {formatHumanDuration(session.totalDurationSeconds)}
          </span>
        </SummaryRow>
        <SummaryRow label="Exercices réalisés">
          <span className="font-semibold tabular-nums">
            {session.exercisesCompleted} / {session.exercisesTotal}
          </span>
        </SummaryRow>
        <SummaryRow label="Heure de début">
          <span className="tabular-nums">{formatTime(session.startedAt)}</span>
        </SummaryRow>
        <SummaryRow label="Heure de fin">
          <span className="tabular-nums">{formatTime(session.endedAt)}</span>
        </SummaryRow>
      </Card>

      <div className="flex justify-center gap-3">
        <Button variant="primary" onClick={onClose}>
          Terminer
        </Button>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="text-sm text-ink">{children}</span>
    </div>
  )
}
