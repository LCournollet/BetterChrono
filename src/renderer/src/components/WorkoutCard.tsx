import React from 'react'
import type { Workout } from '../types'
import { Card } from './ui/Card'
import { Button, IconButton } from './ui/Button'
import { Badge } from './ui/Badge'
import { IconPlay, IconEdit, IconCopy, IconTrash, IconDownload, IconClock } from './Icons'
import { formatHumanDuration } from '../utils/time'
import { workoutTotalSeconds } from '../utils/workout'

export interface WorkoutCardProps {
  workout: Workout
  onStart: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onExport: (id: string) => void
}

export function WorkoutCard({
  workout,
  onStart,
  onEdit,
  onDuplicate,
  onDelete,
  onExport
}: WorkoutCardProps): React.JSX.Element {
  const total = workoutTotalSeconds(workout)
  const count = workout.exercises.length

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink">
            {workout.name || 'Entraînement sans nom'}
          </h3>
          {workout.notes && (
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{workout.notes}</p>
          )}
        </div>
        <Badge tone="neutral" dot>
          {count} {count > 1 ? 'exercices' : 'exercice'}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 text-sm text-ink-soft">
        <IconClock width={16} height={16} className="text-ink-faint" />
        <span className="tabular-nums">{formatHumanDuration(total)}</span>
        <span className="text-ink-faint">de séance estimée</span>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <Button
          variant="primary"
          size="sm"
          iconLeft={<IconPlay width={16} height={16} />}
          onClick={() => onStart(workout.id)}
          disabled={count === 0}
        >
          Lancer
        </Button>
        <div className="flex items-center gap-1">
          <IconButton label="Modifier" size="sm" onClick={() => onEdit(workout.id)}>
            <IconEdit width={17} height={17} />
          </IconButton>
          <IconButton label="Exporter en JSON" size="sm" onClick={() => onExport(workout.id)}>
            <IconDownload width={17} height={17} />
          </IconButton>
          <IconButton label="Dupliquer" size="sm" onClick={() => onDuplicate(workout.id)}>
            <IconCopy width={17} height={17} />
          </IconButton>
          <IconButton
            label="Supprimer"
            size="sm"
            variant="danger"
            onClick={() => onDelete(workout.id)}
          >
            <IconTrash width={17} height={17} />
          </IconButton>
        </div>
      </div>
    </Card>
  )
}
