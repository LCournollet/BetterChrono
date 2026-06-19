import React from 'react'
import { cn } from '../../utils/cn'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  padded?: boolean
}

export function Card({
  interactive = false,
  padded = true,
  className,
  children,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'bg-surface border border-line rounded-xl shadow-card',
        padded && 'p-5',
        interactive &&
          'transition-shadow duration-150 hover:shadow-card-hover hover:border-ink-faint/50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
