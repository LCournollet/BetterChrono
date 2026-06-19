import React, { useId } from 'react'
import { cn } from '../../utils/cn'

interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
}

const fieldBase =
  'w-full rounded-lg border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors ' +
  'focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20 ' +
  'disabled:bg-canvas disabled:text-ink-faint disabled:cursor-not-allowed'

export interface InputProps
  extends FieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className, id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
          {required && <span className="text-danger-500"> *</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(fieldBase, 'h-11', error ? 'border-danger-500' : 'border-line')}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
})

export interface TextareaProps
  extends FieldProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, id, rows = 3, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink-soft">
          {label}
          {required && <span className="text-danger-500"> *</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        className={cn(fieldBase, 'py-2.5 resize-y leading-relaxed', error ? 'border-danger-500' : 'border-line')}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
})
