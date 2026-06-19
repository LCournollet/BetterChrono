import React from 'react'
import type { PhaseKind } from '../types'
import { formatDuration } from '../utils/time'
import { cn } from '../utils/cn'

export interface TimerDisplayProps {
  remainingSeconds: number
  /** Durée totale de la phase, pour calculer la progression de l'anneau. */
  phaseDurationSeconds: number
  kind: PhaseKind
  exerciseName: string
  progressLabel: string // ex. "Exercice 3 / 8"
  /** Phase de travail sans chronomètre (basée sur les répétitions). */
  untimed?: boolean
  /** Nombre de répétitions visé (optionnel). */
  reps?: number
}

/**
 * Affichage central du chronomètre : anneau de progression + grand temps restant.
 * Pensé pour être lisible à distance sur un écran de bureau.
 */
export function TimerDisplay({
  remainingSeconds,
  phaseDurationSeconds,
  kind,
  exerciseName,
  progressLabel,
  untimed = false,
  reps
}: TimerDisplayProps): React.JSX.Element {
  const size = 340
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = phaseDurationSeconds > 0 ? remainingSeconds / phaseDurationSeconds : 0
  // Anneau plein et statique pour une phase en répétitions (pas de décompte).
  const clamped = untimed ? 1 : Math.min(1, Math.max(0, ratio))
  const dashOffset = circumference * (1 - clamped)

  const isWork = kind === 'work'
  const ringColor = isWork ? 'stroke-accent-500' : 'stroke-amber-500'
  const phaseText = isWork ? 'Travail' : 'Pause'
  const phaseTone = isWork ? 'text-accent-600' : 'text-amber-600'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-line"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={cn('transition-[stroke-dashoffset] duration-300 ease-linear', ringColor)}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <span
          className={cn(
            'mb-2 rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wider',
            isWork ? 'border-accent-100 bg-accent-50' : 'border-amber-100 bg-amber-50',
            phaseTone
          )}
        >
          {phaseText}
        </span>
        {untimed ? (
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[4.2rem] font-semibold leading-none text-ink tabular-nums">
              ×{reps ?? '—'}
            </span>
            <span className="text-lg font-medium text-ink-faint">reps</span>
          </div>
        ) : (
          <span className="font-mono text-[4.2rem] font-semibold leading-none text-ink tabular-nums">
            {formatDuration(remainingSeconds)}
          </span>
        )}
        <span className="mt-3 line-clamp-2 max-w-[240px] text-base font-medium text-ink-soft">
          {exerciseName}
        </span>
        <span className="mt-1 text-sm text-ink-faint tabular-nums">{progressLabel}</span>
        {untimed ? (
          <span className="mt-2 text-xs text-ink-faint">Appuyez sur « Suivant » une fois terminé</span>
        ) : (
          reps !== undefined && (
            <span className="mt-2 text-xs text-ink-faint tabular-nums">Objectif : {reps} répétitions</span>
          )
        )}
      </div>
    </div>
  )
}
