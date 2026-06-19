import React from 'react'
import { Card } from './ui/Card'
import { cn } from '../utils/cn'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  unit?: string
  icon?: React.ReactNode
  hint?: string
  tone?: 'accent' | 'sage' | 'amber' | 'danger' | 'neutral'
}

const TONE_BG: Record<NonNullable<StatCardProps['tone']>, string> = {
  accent: 'bg-accent-50 text-accent-500',
  sage: 'bg-sage-50 text-sage-600',
  amber: 'bg-amber-50 text-amber-600',
  danger: 'bg-danger-50 text-danger-600',
  neutral: 'bg-canvas text-ink-soft'
}

export function StatCard({
  label,
  value,
  unit,
  icon,
  hint,
  tone = 'accent'
}: StatCardProps): React.JSX.Element {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        {icon && (
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              TONE_BG[tone]
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-ink tabular-nums">{value}</span>
        {unit && <span className="text-sm text-ink-faint">{unit}</span>}
      </div>
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </Card>
  )
}
