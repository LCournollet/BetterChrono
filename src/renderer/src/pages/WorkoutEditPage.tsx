import React, { useMemo, useState } from 'react'
import type { Exercise, Workout } from '../types'
import { useStore } from '../storage/StoreContext'
import { useNavigation } from '../hooks/useNavigation'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { ExerciseRow } from '../components/ExerciseRow'
import { EmptyState } from '../components/ui/EmptyState'
import { JsonExportModal } from '../components/JsonExportModal'
import { IconPlus, IconPlay, IconCheck, IconDownload, IconClock } from '../components/Icons'
import { createEmptyExercise, workoutTotalSeconds } from '../utils/workout'
import { exportWorkoutToJson } from '../utils/json'
import { formatHumanDuration } from '../utils/time'

export function WorkoutEditPage(): React.JSX.Element {
  const { workoutId, navigate } = useNavigation()
  const { getWorkout, updateWorkout } = useStore()

  const original = workoutId ? getWorkout(workoutId) : undefined

  // Brouillon local : on n'écrit dans le store qu'à l'enregistrement.
  const [draft, setDraft] = useState<Workout | null>(original ? { ...original } : null)
  const [exportOpen, setExportOpen] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  const errors = useMemo(() => {
    if (!draft) return { name: undefined as string | undefined, exercises: [] as (string | undefined)[], any: false }
    const nameError = draft.name.trim().length === 0 ? 'Le nom est obligatoire.' : undefined
    const exerciseErrors = draft.exercises.map((ex) =>
      ex.name.trim().length === 0 ? 'Nom requis' : undefined
    )
    const noExercise = draft.exercises.length === 0
    return {
      name: nameError,
      exercises: exerciseErrors,
      any: Boolean(nameError) || exerciseErrors.some(Boolean) || noExercise
    }
  }, [draft])

  if (!draft) {
    return (
      <div className="space-y-7">
        <SectionHeader title="Entraînement introuvable" />
        <EmptyState
          title="Cet entraînement n'existe plus"
          description="Il a peut-être été supprimé."
          action={
            <Button variant="primary" onClick={() => navigate('workouts')}>
              Retour aux entraînements
            </Button>
          }
        />
      </div>
    )
  }

  const total = workoutTotalSeconds(draft)

  const patchDraft = (patch: Partial<Workout>): void => setDraft({ ...draft, ...patch })

  const updateExercise = (ex: Exercise): void => {
    patchDraft({ exercises: draft.exercises.map((e) => (e.id === ex.id ? ex : e)) })
  }

  const addExercise = (): void => {
    patchDraft({ exercises: [...draft.exercises, createEmptyExercise()] })
  }

  const move = (index: number, dir: -1 | 1): void => {
    const next = [...draft.exercises]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    patchDraft({ exercises: next })
  }

  const removeExercise = (index: number): void => {
    if (draft.exercises.length === 1) return
    patchDraft({ exercises: draft.exercises.filter((_, i) => i !== index) })
  }

  const handleSave = (goToSession: boolean): void => {
    if (errors.any) {
      setShowErrors(true)
      return
    }
    updateWorkout(draft)
    setSavedAt(Date.now())
    if (goToSession) navigate('session', draft.id)
  }

  return (
    <div className="space-y-7">
      <SectionHeader
        title={draft.name.trim() ? draft.name : 'Nouvel entraînement'}
        subtitle="Configurez les exercices, leurs durées de travail et de pause."
        actions={
          <>
            <Button
              variant="secondary"
              iconLeft={<IconDownload width={16} height={16} />}
              onClick={() => setExportOpen(true)}
            >
              Exporter JSON
            </Button>
            <Button
              variant="secondary"
              iconLeft={<IconPlay width={16} height={16} />}
              onClick={() => handleSave(true)}
            >
              Enregistrer & lancer
            </Button>
            <Button
              variant="primary"
              iconLeft={<IconCheck width={16} height={16} />}
              onClick={() => handleSave(false)}
            >
              Enregistrer
            </Button>
          </>
        }
      />

      <Card className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Input
            label="Nom de l'entraînement"
            placeholder="ex. Haut du corps"
            value={draft.name}
            onChange={(e) => patchDraft({ name: e.target.value })}
            error={showErrors ? errors.name : undefined}
            required
          />
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-canvas/60 px-3.5 py-2.5">
              <IconClock width={16} height={16} className="text-ink-faint" />
              <span className="text-sm text-ink-soft">Durée estimée</span>
              <span className="text-sm font-semibold text-ink tabular-nums">
                {formatHumanDuration(total)}
              </span>
            </div>
            <Badge tone="neutral" dot>
              {draft.exercises.length} {draft.exercises.length > 1 ? 'exercices' : 'exercice'}
            </Badge>
          </div>
        </div>
        <Textarea
          label="Notes (optionnel)"
          placeholder="Objectif de la séance, matériel, remarques…"
          value={draft.notes ?? ''}
          onChange={(e) => patchDraft({ notes: e.target.value })}
        />
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Exercices</h2>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<IconPlus width={16} height={16} />}
            onClick={addExercise}
          >
            Ajouter un exercice
          </Button>
        </div>

        {draft.exercises.length === 0 ? (
          <EmptyState
            title="Aucun exercice"
            description="Ajoutez au moins un exercice pour pouvoir lancer cette séance."
            action={
              <Button variant="primary" onClick={addExercise}>
                Ajouter un exercice
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {draft.exercises.map((ex, i) => (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                index={i}
                total={draft.exercises.length}
                onChange={updateExercise}
                onMoveUp={(idx) => move(idx, -1)}
                onMoveDown={(idx) => move(idx, 1)}
                onDelete={removeExercise}
                nameError={showErrors ? errors.exercises[i] : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-5">
        <Button variant="ghost" onClick={() => navigate('workouts')}>
          ← Retour aux entraînements
        </Button>
        <div className="flex items-center gap-3">
          {savedAt && <span className="text-sm text-sage-600">Modifications enregistrées</span>}
          <Button
            variant="primary"
            iconLeft={<IconCheck width={16} height={16} />}
            onClick={() => handleSave(false)}
          >
            Enregistrer
          </Button>
        </div>
      </div>

      <JsonExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        fileName={draft.name || 'entrainement'}
        json={exportWorkoutToJson(draft)}
      />
    </div>
  )
}
