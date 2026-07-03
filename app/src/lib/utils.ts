import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export function formatWeight(weight: number | null): string {
  if (weight === null || weight === undefined) return '-'
  return `${weight.toLocaleString('id-ID')} kg`
}

// Convert NIK to fake email for Supabase auth compatibility
export function nikToEmail(nik: string): string {
  return `${nik}@ternak.local`
}
