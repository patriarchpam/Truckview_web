import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150 ease-smooth active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap cursor-pointer'

const variants: Record<Variant, string> = {
  primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-[0_6px_20px_-10px_rgba(249,115,22,0.9)]',
  secondary: 'bg-surface text-ink border border-line-strong hover:border-navy-400 hover:bg-surface-2',
  outline: 'bg-transparent border border-line-strong text-ink hover:bg-surface-2',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  success: 'bg-success-600 text-white hover:bg-success-700',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

interface CommonProps { variant?: Variant; size?: Size; className?: string; children: React.ReactNode }
type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>

export function Button({ variant = 'primary', size = 'md', className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

interface ButtonLinkProps extends CommonProps { to: string; state?: unknown; 'aria-label'?: string }

export function ButtonLink({ to, state, variant = 'primary', size = 'md', className, children, ...props }: ButtonLinkProps) {
  return (
    <Link to={to} state={state} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  )
}
