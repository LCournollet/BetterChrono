import React, { useId } from 'react'
import { cn } from '../../utils/cn'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label?: string
  hint?: string
  options: SelectOption[]
  className?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, options, className, id, ...props },
  ref
) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'h-11 w-full appearance-none rounded-lg border border-line bg-surface pl-3.5 pr-10 text-sm text-ink',
            'focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20',
            'disabled:bg-canvas disabled:text-ink-faint disabled:cursor-not-allowed'
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  )
})
