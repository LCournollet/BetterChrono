import React from 'react'
import { Modal } from './Modal'
import { Button } from './Button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  tone = 'danger',
  onConfirm,
  onCancel
}: ConfirmDialogProps): React.JSX.Element {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-ink-soft">{message}</p>
    </Modal>
  )
}
