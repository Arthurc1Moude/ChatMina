import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function deriveTitle(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return 'New chat'
  return clean.length > 42 ? `${clean.slice(0, 42).trimEnd()}…` : clean
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diff < minute) return 'Just now'
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`
  if (diff < day) return `${Math.floor(diff / hour)}h ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}
