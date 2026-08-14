import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../utils/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'gradient' | 'emergency'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap cursor-pointer'

const variants: Record<Variant, string> = {
  primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-[0_6px_20px_-10px_rgba(249,115,22,0.9)] hover:shadow-[0_8px_25px_-8px_rgba(249,115,22,1)] hover:-translate-y-[1px]',
  secondary: 'bg-surface text-ink border border-line-strong hover:border-accent-400 hover:text-accent-600 hover:bg-surface-2 hover:shadow-sm hover:-translate-y-[1px]',
  outline: 'bg-transparent border border-line-strong text-ink hover:bg-surface-2 hover:shadow-sm hover:-translate-y-[1px]',
  ghost: 'text-ink-soft hover:bg-surface-2 hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:-translate-y-[1px]',
  success: 'bg-success-600 text-white hover:bg-success-700 hover:shadow-md hover:-translate-y-[1px]',
  gradient: 'bg-gradient-primary text-white shadow-[0_6px_20px_-10px_rgba(249,115,22,0.9)] hover:shadow-[0_8px_25px_-8px_rgba(249,115,22,1)] hover:-translate-y-[2px]',
  emergency: 'bg-gradient-emergency text-white shadow-[0_8px_25px_-8px_rgba(239,68,68,0.9)] hover:shadow-[0_12px_30px_-8px_rgba(239,68,68,1)] hover:-translate-y-[2px]',
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

interface ButtonLinkProps extends CommonProps, Omit<LinkProps, 'className' | 'style'> {
  to: string;
}

export function ButtonLink({ to, state, variant = 'primary', size = 'md', className, children, ...props }: ButtonLinkProps) {
  return (
    <Link to={to} state={state} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  )
}
