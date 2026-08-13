import React from 'react';
import { cn } from '../../utils/format'

const control =
  'w-full rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-ink placeholder:text-muted transition-[border-color,box-shadow] duration-150 ease-smooth hover:border-navy-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25 disabled:opacity-60'

interface FieldProps {
  label: string; htmlFor?: string; hint?: string; error?: string; required?: boolean; className?: string; children: React.ReactNode
}

export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink-soft">
        {label}{required && <span className="ml-1 text-accent-500">*</span>}
      </label>
      {children}
      {error ? <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
        : hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, 'h-11', className)} {...props} />
  },
)

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return <select ref={ref} className={cn(control, 'h-11', className)} {...props}>{children}</select>
  },
)

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(control, 'py-2.5', className)} {...props} />
  },
)

export function Checkbox({ label, className, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft', className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-line-strong text-accent-500 focus:ring-accent-500" {...props} />
      {label}
    </label>
  )
}
