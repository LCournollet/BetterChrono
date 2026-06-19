import React, { useEffect } from 'react'
import { cn } from '../../utils/cn'
import { IconButton } from './Button'
import { IconClose } from '../Icons'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'md' | 'lg' | 'xl'
}

const SIZES = {
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-3xl'
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg'
}: ModalProps): React.JSX.Element | null {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card-hover',
          SIZES[size]
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
          </div>
          <IconButton label="Fermer" size="sm" onClick={onClose}>
            <IconClose width={18} height={18} />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-line bg-canvas/50 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}
