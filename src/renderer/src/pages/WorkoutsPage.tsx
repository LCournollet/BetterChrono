import React, { useState } from 'react'
import type { Workout } from '../types'
import { useStore } from '../storage/StoreContext'
import { useNavigation } from '../hooks/useNavigation'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Button } from '../components/ui/Button'
import { WorkoutCard } from '../components/WorkoutCard'
import { EmptyState } from '../components/ui/EmptyState'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { JsonExportModal } from '../components/JsonExportModal'
import { JsonImportModal, type ImportCommit } from '../components/JsonImportModal'
import { IconPlus, IconUpload, IconDumbbell } from '../components/Icons'
import { createEmptyWorkout } from '../utils/workout'
import { exportWorkoutToJson } from '../utils/json'

export function WorkoutsPage(): React.JSX.Element {
  const { workouts, addWorkout, deleteWorkout, duplicateWorkout, updateWorkout, importWorkouts } =
    useStore()
  const { navigate } = useNavigation()

  const [toDelete, setToDelete] = useState<Workout | null>(null)
  const [exportTarget, setExportTarget] = useState<Workout | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const handleCreate = (): void => {
    const fresh = createEmptyWorkout()
    addWorkout(fresh)
    navigate('workout-edit', fresh.id)
  }

  const handleDuplicate = (id: string): void => {
    const copy = duplicateWorkout(id)
    if (copy) navigate('workout-edit', copy.id)
  }

  const handleImportCommit = (result: ImportCommit): void => {
    if (result.add.length > 0) importWorkouts(result.add)
    result.replace.forEach(({ workout }) => updateWorkout(workout))
  }

  return (
    <div className="space-y-7">
      <SectionHeader
        title="Entraînements"
        subtitle="Créez, modifiez et organisez vos entraînements types."
        actions={
          <>
            <Button
              variant="secondary"
              iconLeft={<IconUpload width={16} height={16} />}
              onClick={() => setImportOpen(true)}
            >
              Importer JSON
            </Button>
            <Button
              variant="primary"
              iconLeft={<IconPlus width={16} height={16} />}
              onClick={handleCreate}
            >
              Nouvel entraînement
            </Button>
          </>
        }
      />

      {workouts.length === 0 ? (
        <EmptyState
          icon={<IconDumbbell width={22} height={22} />}
          title="Aucun entraînement pour le moment"
          description="Créez votre premier entraînement type ou importez-en un depuis un fichier JSON."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setImportOpen(true)}>
                Importer JSON
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Nouvel entraînement
              </Button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workouts.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              onStart={(id) => navigate('session', id)}
              onEdit={(id) => navigate('workout-edit', id)}
              onDuplicate={handleDuplicate}
              onDelete={(id) => setToDelete(workouts.find((x) => x.id === id) ?? null)}
              onExport={(id) => setExportTarget(workouts.find((x) => x.id === id) ?? null)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Supprimer l'entraînement"
        message={
          <>
            Voulez-vous vraiment supprimer «&nbsp;
            <strong className="text-ink">{toDelete?.name || 'Sans nom'}</strong>&nbsp;» ? Cette action
            est irréversible. Les séances déjà enregistrées dans le calendrier seront conservées.
          </>
        }
        confirmLabel="Supprimer"
        onConfirm={() => {
          if (toDelete) deleteWorkout(toDelete.id)
          setToDelete(null)
        }}
        onCancel={() => setToDelete(null)}
      />

      <JsonExportModal
        open={exportTarget !== null}
        onClose={() => setExportTarget(null)}
        fileName={exportTarget?.name ?? 'entrainement'}
        json={exportTarget ? exportWorkoutToJson(exportTarget) : ''}
      />

      <JsonImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        existingWorkouts={workouts.map((w) => ({ id: w.id, name: w.name }))}
        onCommit={handleImportCommit}
      />
    </div>
  )
}
