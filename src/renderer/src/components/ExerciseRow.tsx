import React from 'react'
import type { Exercise } from '../types'
import { Input } from './ui/Input'
import { DurationField } from './ui/DurationField'
import { IconButton } from './ui/Button'
import { IconArrowUp, IconArrowDown, IconTrash } from './Icons'
import { cn } from '../utils/cn'

export interface ExerciseRowProps {
  exercise: Exercise
  index: number
  total: number
  onChange: (exercise: Exercise) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onDelete: (index: number) => void
  nameError?: string
}

/** Ligne d'édition d'un exercice dans le formulaire d'entraînement. */
export function ExerciseRow({
  exercise,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
  nameError
}: ExerciseRowProps): React.JSX.Element {
  const update = (patch: Partial<Exercise>): void => onChange({ ...exercise, ...patch })

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-sm font-semibold text-accent-600 tabular-nums">
          {index + 1}
        </div>

        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
            <Input
              label="Nom de l'exercice"
              placeholder="ex. Pompes"
              value={exercise.name}
              onChange={(e) => update({ name: e.target.value })}
              error={nameError}
              required
            />
            <DurationField
              label="Travail"
              value={exercise.workDurationSeconds}
              min={1}
              onChange={(s) => update({ workDurationSeconds: s })}
              className="lg:w-44"
            />
            <DurationField
              label="Pause après"
              value={exercise.restDurationSeconds}
              min={0}
              onChange={(s) => update({ restDurationSeconds: s })}
              className="lg:w-44"
            />
          </div>
          <Input
            label="Notes (optionnel)"
            placeholder="Consignes, tempo, amplitude…"
            value={exercise.notes ?? ''}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <IconButton
            label="Monter"
            size="sm"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
          >
            <IconArrowUp width={16} height={16} />
          </IconButton>
          <IconButton
            label="Descendre"
            size="sm"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
          >
            <IconArrowDown width={16} height={16} />
          </IconButton>
          <IconButton
            label="Supprimer l'exercice"
            size="sm"
            variant="danger"
            onClick={() => onDelete(index)}
            className={cn(total === 1 && 'opacity-50')}
            disabled={total === 1}
          >
            <IconTrash width={16} height={16} />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
