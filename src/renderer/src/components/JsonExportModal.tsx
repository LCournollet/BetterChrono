import React, { useEffect, useState } from 'react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { IconCopy, IconDownload, IconCheck } from './Icons'

export interface JsonExportModalProps {
  open: boolean
  onClose: () => void
  title?: string
  /** Nom de fichier par défaut (sans extension). */
  fileName: string
  /** Contenu JSON déjà sérialisé. */
  json: string
}

/** Modale d'export JSON : aperçu, copie presse-papiers, téléchargement fichier. */
export function JsonExportModal({
  open,
  onClose,
  title = 'Exporter en JSON',
  fileName,
  json
}: JsonExportModalProps): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!open) {
      setCopied(false)
      setSaved(false)
    }
  }, [open])

  const safeName = `${fileName.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase() || 'export'}.json`

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const handleDownload = async (): Promise<void> => {
    // Privilégie la boîte de dialogue native d'Electron si disponible.
    if (window.api?.saveJson) {
      const ok = await window.api.saveJson(safeName, json)
      if (ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
      return
    }
    // Repli navigateur : téléchargement via lien.
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = safeName
    a.click()
    URL.revokeObjectURL(url)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Copiez le JSON ou enregistrez-le dans un fichier."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
          <Button
            variant="secondary"
            iconLeft={copied ? <IconCheck width={16} height={16} /> : <IconCopy width={16} height={16} />}
            onClick={handleCopy}
          >
            {copied ? 'Copié' : 'Copier le JSON'}
          </Button>
          <Button
            variant="primary"
            iconLeft={saved ? <IconCheck width={16} height={16} /> : <IconDownload width={16} height={16} />}
            onClick={handleDownload}
          >
            {saved ? 'Enregistré' : 'Télécharger le fichier'}
          </Button>
        </>
      }
    >
      <pre className="max-h-[50vh] overflow-auto rounded-lg border border-line bg-canvas p-4 font-mono text-xs leading-relaxed text-ink-soft">
        {json}
      </pre>
    </Modal>
  )
}
