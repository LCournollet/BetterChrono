import React from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  fullWidth?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent-500 text-white border border-accent-500 hover:bg-accent-600 hover:border-accent-600 active:bg-accent-700 shadow-sm',
  secondary:
    'bg-surface text-ink border border-line hover:bg-canvas hover:border-ink-faint active:bg-line',
  ghost: 'bg-transparent text-ink-soft border border-transparent hover:bg-canvas hover:text-ink',
  danger:
    'bg-surface text-danger-600 border border-danger-100 hover:bg-danger-50 hover:border-danger-500 active:bg-danger-100',
  success:
    'bg-sage-500 text-white border border-sage-500 hover:bg-sage-600 hover:border-sage-600 shadow-sm'
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-12 px-5 text-base gap-2 rounded-xl'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', iconLeft, iconRight, fullWidth, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
        'disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none whitespace-nowrap',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {iconLeft && <span className="shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
})

/** Bouton purement iconographique, carré. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  label: string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', size = 'md', label, className, children, ...props },
  ref
) {
  const sizeCls = size === 'sm' ? 'h-9 w-9 rounded-lg' : size === 'lg' ? 'h-12 w-12 rounded-xl' : 'h-11 w-11 rounded-lg'
  return (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-accent-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant],
        sizeCls,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
