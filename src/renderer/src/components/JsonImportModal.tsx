import React, { useEffect, useMemo, useState } from 'react'
import type { Workout } from '../types'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { Textarea } from './ui/Input'
import { Badge } from './ui/Badge'
import { IconUpload, IconCheck } from './Icons'
import { importWorkoutsFromJson, emptyWorkoutTemplateJson } from '../utils/json'
import { formatHumanDuration } from '../utils/time'
import { workoutTotalSeconds } from '../utils/workout'
import { cn } from '../utils/cn'

type Resolution = 'replace' | 'duplicate' | 'skip'

export interface ImportCommit {
  add: Workout[]
  replace: { id: string; workout: Workout }[]
}

export interface JsonImportModalProps {
  open: boolean
  onClose: () => void
  existingWorkouts: Pick<Workout, 'id' | 'name'>[]
  onCommit: (result: ImportCommit) => void
}

/** Modale d'import JSON : fichier ou texte collé, aperçu, gestion des doublons. */
export function JsonImportModal({
  open,
  onClose,
  existingWorkouts,
  onCommit
}: JsonImportModalProps): React.JSX.Element {
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [parsed, setParsed] = useState<Workout[] | null>(null)
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>({})

  useEffect(() => {
    if (!open) {
      setText('')
      setErrors([])
      setParsed(null)
      setResolutions({})
    }
  }, [open])

  const existingByName = useMemo(() => {
    const map = new Map<string, string>()
    existingWorkouts.forEach((w) => map.set(w.name.trim().toLowerCase(), w.id))
    return map
  }, [existingWorkouts])

  const handleFile = async (): Promise<void> => {
    if (window.api?.openJson) {
      const contents = await window.api.openJson()
      if (contents !== null) {
        setText(contents)
        runValidation(contents)
      }
    }
  }

  const handleBrowserFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (): void => {
      const contents = String(reader.result ?? '')
      setText(contents)
      runValidation(contents)
    }
    reader.readAsText(file)
  }

  const runValidation = (raw: string): void => {
    const res = importWorkoutsFromJson(raw)
    if (!res.ok) {
      setErrors(res.errors)
      setParsed(null)
      return
    }
    setErrors([])
    setParsed(res.data)
    // Résolution par défaut pour les doublons : dupliquer.
    const initial: Record<string, Resolution> = {}
    res.data.forEach((w) => {
      if (existingByName.has(w.name.trim().toLowerCase())) {
        initial[w.id] = 'duplicate'
      }
    })
    setResolutions(initial)
  }

  const conflicts = useMemo(() => {
    if (!parsed) return []
    return parsed.filter((w) => existingByName.has(w.name.trim().toLowerCase()))
  }, [parsed, existingByName])

  const handleConfirm = (): void => {
    if (!parsed) return
    const add: Workout[] = []
    const replace: { id: string; workout: Workout }[] = []

    parsed.forEach((w) => {
      const existingId = existingByName.get(w.name.trim().toLowerCase())
      if (!existingId) {
        add.push(w)
        return
      }
      const resolution = resolutions[w.id] ?? 'duplicate'
      if (resolution === 'skip') return
      if (resolution === 'replace') {
        replace.push({ id: existingId, workout: { ...w, id: existingId } })
      } else {
        add.push({ ...w, name: `${w.name} (copie)` })
      }
    })

    onCommit({ add, replace })
    onClose()
  }

  const setResolution = (id: string, value: Resolution): void => {
    setResolutions((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importer un entraînement"
      description="Sélectionnez un fichier .json ou collez le JSON directement."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          {!parsed ? (
            <Button variant="primary" onClick={() => runValidation(text)} disabled={!text.trim()}>
              Vérifier le JSON
            </Button>
          ) : (
            <Button
              variant="primary"
              iconLeft={<IconCheck width={16} height={16} />}
              onClick={handleConfirm}
            >
              Importer
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {window.api?.openJson ? (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<IconUpload width={16} height={16} />}
              onClick={handleFile}
            >
              Choisir un fichier .json
            </Button>
          ) : (
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink hover:bg-canvas">
              <IconUpload width={16} height={16} />
              Choisir un fichier .json
              <input type="file" accept=".json,application/json" className="hidden" onChange={handleBrowserFile} />
            </label>
          )}
          <button
            type="button"
            onClick={() => {
              const template = emptyWorkoutTemplateJson()
              setText(template)
              runValidation(template)
            }}
            className="text-xs font-medium text-accent-600 hover:text-accent-700 hover:underline"
          >
            Insérer un modèle vide
          </button>
          <span className="text-xs text-ink-faint">ou collez le JSON ci-dessous</span>
        </div>

        <Textarea
          label="Contenu JSON"
          rows={8}
          value={text}
          placeholder='{ "version": 1, "type": "workout", "workout": { ... } }'
          onChange={(e) => {
            setText(e.target.value)
            setParsed(null)
            setErrors([])
          }}
          className="font-mono"
        />

        {errors.length > 0 && (
          <div className="rounded-lg border border-danger-100 bg-danger-50 p-3">
            <p className="mb-1 text-sm font-semibold text-danger-600">Import impossible</p>
            <ul className="list-inside list-disc space-y-0.5 text-sm text-danger-600">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {parsed && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ink">
              Aperçu — {parsed.length} {parsed.length > 1 ? 'entraînements' : 'entraînement'}
            </p>
            {parsed.map((w) => {
              const conflict = existingByName.has(w.name.trim().toLowerCase())
              return (
                <div key={w.id} className="rounded-lg border border-line bg-canvas/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-ink">{w.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge tone="neutral">
                        {w.exercises.length} {w.exercises.length > 1 ? 'exercices' : 'exercice'}
                      </Badge>
                      <Badge tone="accent">{formatHumanDuration(workoutTotalSeconds(w))}</Badge>
                    </div>
                  </div>
                  {w.notes && <p className="mt-1 text-sm text-ink-soft">{w.notes}</p>}
                  <ul className="mt-2 space-y-0.5 text-xs text-ink-faint">
                    {w.exercises.map((ex) => {
                      const parts: string[] = []
                      if (ex.workDurationSeconds > 0) parts.push(`${ex.workDurationSeconds}s travail`)
                      if (ex.reps) parts.push(`${ex.reps} reps`)
                      parts.push(`${ex.restDurationSeconds}s pause`)
                      return (
                        <li key={ex.id} className="tabular-nums">
                          • {ex.name} — {parts.join(' / ')}
                        </li>
                      )
                    })}
                  </ul>

                  {conflict && (
                    <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 p-2.5">
                      <p className="mb-2 text-xs font-medium text-amber-600">
                        Un entraînement nommé « {w.name} » existe déjà.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            ['duplicate', 'Dupliquer avec « copie »'],
                            ['replace', 'Remplacer'],
                            ['skip', 'Ignorer']
                          ] as [Resolution, string][]
                        ).map(([val, label]) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setResolution(w.id, val)}
                            className={cn(
                              'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                              (resolutions[w.id] ?? 'duplicate') === val
                                ? 'border-accent-300 bg-accent-50 text-accent-700'
                                : 'border-line bg-surface text-ink-soft hover:bg-canvas'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {conflicts.length === 0 && (
              <p className="text-xs text-sage-600">Aucun doublon détecté — prêt à importer.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
