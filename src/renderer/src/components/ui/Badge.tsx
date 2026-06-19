import React from 'react'
import { cn } from '../../utils/cn'

export type BadgeTone = 'neutral' | 'work' | 'rest' | 'completed' | 'interrupted' | 'accent'

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-canvas text-ink-soft border-line',
  accent: 'bg-accent-50 text-accent-700 border-accent-100',
  work: 'bg-accent-50 text-accent-700 border-accent-100',
  rest: 'bg-amber-50 text-amber-600 border-amber-100',
  completed: 'bg-sage-50 text-sage-600 border-sage-100',
  interrupted: 'bg-danger-50 text-danger-600 border-danger-100'
}

export interface BadgeProps {
  tone?: BadgeTone
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ tone = 'neutral', children, className, dot }: BadgeProps): React.JSX.Element {
  const dotColor: Record<BadgeTone, string> = {
    neutral: 'bg-ink-faint',
    accent: 'bg-accent-500',
    work: 'bg-accent-500',
    rest: 'bg-amber-500',
    completed: 'bg-sage-500',
    interrupted: 'bg-danger-500'
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TONES[tone],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColor[tone])} />}
      {children}
    </span>
  )
}
