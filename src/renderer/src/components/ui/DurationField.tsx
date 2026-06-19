import React, { useId, useState } from 'react'
import { cn } from '../../utils/cn'

type Unit = 'sec' | 'min'

export interface DurationFieldProps {
  label?: string
  /** Valeur en secondes. */
  value: number
  onChange: (seconds: number) => void
  min?: number
  error?: string
  className?: string
  hint?: string
}

/**
 * Champ de durée saisissable en secondes ou en minutes.
 * La valeur exposée est toujours en secondes.
 */
export function DurationField({
  label,
  value,
  onChange,
  min = 0,
  error,
  hint,
  className
}: DurationFieldProps): React.JSX.Element {
  const id = useId()
  const [unit, setUnit] = useState<Unit>('sec')

  const displayed = unit === 'sec' ? value : +(value / 60).toFixed(2)

  const handleValue = (raw: string): void => {
    const num = parseFloat(raw)
    if (Number.isNaN(num)) {
      onChange(min)
      return
    }
    const seconds = unit === 'sec' ? Math.round(num) : Math.round(num * 60)
    onChange(Math.max(min, seconds))
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <div className="flex">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step={unit === 'sec' ? 5 : 0.5}
          value={Number.isFinite(displayed) ? displayed : ''}
          onChange={(e) => handleValue(e.target.value)}
          className={cn(
            'h-11 w-full rounded-l-lg border border-r-0 bg-surface px-3.5 text-sm text-ink tabular-nums',
            'focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20',
            error ? 'border-danger-500' : 'border-line'
          )}
        />
        <div className="inline-flex overflow-hidden rounded-r-lg border border-line">
          {(['sec', 'min'] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn(
                'px-3 text-xs font-medium transition-colors',
                unit === u
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface text-ink-soft hover:bg-canvas'
              )}
            >
              {u === 'sec' ? 'sec' : 'min'}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}
