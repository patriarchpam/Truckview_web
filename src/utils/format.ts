import { format, parse } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...classes: (string | false | null | undefined)[]): string {
  return twMerge(classes.filter(Boolean).join(' '))
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function fromISODate(iso: string): Date {
  return parse(iso, 'yyyy-MM-dd', new Date())
}

export function formatLongDate(iso: string): string {
  return format(fromISODate(iso), 'MMMM d, yyyy')
}

export function formatShortDate(iso: string): string {
  try {
    // Attempt standard parse first
    const parsed = parse(iso, 'yyyy-MM-dd', new Date())
    if (isNaN(parsed.getTime())) throw new Error()
    return format(parsed, 'EEE, MMM d')
  } catch {
    // Fallback if it's a full ISO datetime string
    return format(new Date(iso), 'EEE, MMM d')
  }
}

export function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return format(d, 'MMM d, h:mm a')
  } catch {
    return iso
  }
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`
}

export function formatPrice(price: number | null): string {
  if (price === null) return 'Request a quote'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
