import { format } from 'date-fns'
import { CURRENCY_SYMBOLS } from '@/lib/constants'

export function formatCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${symbol}${amount.toFixed(2)}`
}

export function formatDate(date: string): string {
  return format(new Date(date), 'MMMM d, yyyy')
}

export function formatDateShort(date: string): string {
  return format(new Date(date), 'MMM d, yyyy')
}
