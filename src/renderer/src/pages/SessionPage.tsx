import React, { useState } from 'react'
import { useStore } from '../storage/StoreContext'
import { useNavigation } from '../hooks/useNavigation'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { SessionRunner } from '../components/SessionRunner'
import { IconPlay, IconDumbbell, IconClock } from '../components/Icons'
import { workoutTotalSeconds } from '../utils/workout'
import { formatHumanDuration } from '../utils/time'

export function SessionPage(): React.JSX.Element {
  const { workouts, getWorkout } = useStore()
  const { workoutId, navigate } = useNavigation()

  // Sélection locale si on arrive sans entraînement pré-choisi.
  const [selectedId, setSelectedId] = useState<string | null>(workoutId ?? null)

  const activeId = workoutId ?? selectedId
  const workout = activeId ? getWorkout(activeId) : undefined

  // Séance lancée : on affiche le runner.
  if (workout && workout.exercises.length > 0) {
    return <SessionRunner workout={workout} onExit={() => navigate('calendar')} />
  }

  // Sinon, écran de sélection d'un entraînement.
  return (
    <div className="space-y-7">
      <SectionHeader
        title="Lancer une séance"
        subtitle="Choisissez un entraînement à démarrer."
      />

      {workouts.length === 0 ? (
        <EmptyState
          icon={<IconDumbbell width={22} height={22} />}
          title="Aucun entraînement disponible"
          description="Créez d'abord un entraînement pour pouvoir lancer une séance."
          action={
            <Button variant="primary" onClick={() => navigate('workouts')}>
              Créer un entraînement
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workouts.map((w) => {
            const empty = w.exercises.length === 0
            return (
              <Card key={w.id} className="flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-semibold text-ink">{w.name || 'Sans nom'}</h3>
                  {w.notes && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{w.notes}</p>}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <IconClock width={16} height={16} className="text-ink-faint" />
                  <span className="tabular-nums">{formatHumanDuration(workoutTotalSeconds(w))}</span>
                  <Badge tone="neutral">{w.exercises.length} exo.</Badge>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  iconLeft={<IconPlay width={16} height={16} />}
                  disabled={empty}
                  onClick={() => setSelectedId(w.id)}
                >
                  {empty ? 'Aucun exercice' : 'Démarrer'}
                </Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
