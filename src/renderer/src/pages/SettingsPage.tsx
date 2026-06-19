import React, { useState } from 'react'
import { useStore } from '../storage/StoreContext'
import { SectionHeader } from '../components/ui/SectionHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { JsonExportModal } from '../components/JsonExportModal'
import { JsonImportModal, type ImportCommit } from '../components/JsonImportModal'
import { IconDownload, IconUpload, IconTrash, IconCopy } from '../components/Icons'
import { exportWorkoutsToJson, emptyWorkoutTemplateJson } from '../utils/json'

export function SettingsPage(): React.JSX.Element {
  const { workouts, sessions, importWorkouts, updateWorkout, clearAllData } = useStore()

  const [exportOpen, setExportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleImportCommit = (result: ImportCommit): void => {
    if (result.add.length > 0) importWorkouts(result.add)
    result.replace.forEach(({ workout }) => updateWorkout(workout))
  }

  return (
    <div className="space-y-7">
      <SectionHeader
        title="Paramètres"
        subtitle="Sauvegarde, import / export et gestion des données."
      />

      <Card className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Import / Export JSON</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Exportez tous vos entraînements dans un seul fichier, ou importez-en depuis un fichier ou
            un texte JSON.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            iconLeft={<IconDownload width={16} height={16} />}
            onClick={() => setExportOpen(true)}
            disabled={workouts.length === 0}
          >
            Exporter tous les entraînements
          </Button>
          <Button
            variant="secondary"
            iconLeft={<IconUpload width={16} height={16} />}
            onClick={() => setImportOpen(true)}
          >
            Importer depuis JSON
          </Button>
          <Button
            variant="ghost"
            iconLeft={<IconCopy width={16} height={16} />}
            onClick={() => setTemplateOpen(true)}
          >
            Modèle JSON vide
          </Button>
        </div>
        <div className="rounded-lg border border-line bg-canvas/50 p-3 text-xs text-ink-soft">
          <p className="font-medium text-ink-soft">Format pris en charge</p>
          <p className="mt-1">
            Un entraînement unique <span className="font-mono">{'{ "type": "workout" }'}</span> ou une
            collection <span className="font-mono">{'{ "type": "workout-collection" }'}</span>. Chaque
            exercice accepte une durée (<span className="font-mono">workDurationSeconds</span>) et/ou un
            nombre de répétitions (<span className="font-mono">reps</span>) — au moins l'un des deux. Le
            champ <span className="font-mono">version</span> assure la compatibilité future. Cliquez sur{' '}
            <span className="font-medium">« Modèle JSON vide »</span> pour partir d'une base prête à
            remplir.
          </p>
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Données locales</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {workouts.length} entraînement(s) et {sessions.length} séance(s) enregistrés dans le
            stockage local de cet ordinateur.
          </p>
        </div>
        <div>
          <Button
            variant="danger"
            iconLeft={<IconTrash width={16} height={16} />}
            onClick={() => setConfirmClear(true)}
          >
            Effacer toutes les données
          </Button>
        </div>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-base font-semibold text-ink">À propos</h2>
        <p className="text-sm text-ink-soft">
          BetterChrono — chronomètre d'entraînement personnalisable. Vos données restent privées et
          ne quittent jamais votre ordinateur.
        </p>
      </Card>

      <JsonExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Exporter tous les entraînements"
        fileName="betterchrono-entrainements"
        json={exportWorkoutsToJson(workouts)}
      />

      <JsonImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        existingWorkouts={workouts.map((w) => ({ id: w.id, name: w.name }))}
        onCommit={handleImportCommit}
      />

      <JsonExportModal
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title="Modèle d'entraînement vide"
        fileName="betterchrono-modele"
        json={emptyWorkoutTemplateJson()}
      />

      <ConfirmDialog
        open={confirmClear}
        title="Effacer toutes les données ?"
        message="Tous vos entraînements et l'historique de vos séances seront définitivement supprimés. Cette action est irréversible."
        confirmLabel="Tout effacer"
        onConfirm={() => {
          clearAllData()
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
