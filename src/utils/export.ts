import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/utils/format'
import type { ExpenseWithRelations } from '@/types/database'

function escapeCsvField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function exportToCsv(expenses: ExpenseWithRelations[], currency: string) {
  const headers = ['Date', 'Description', 'Category', 'Spender', 'Payment Method', 'Amount']
  const rows = expenses.map((e) => [
    format(new Date(e.date + 'T00:00:00'), 'yyyy-MM-dd'),
    escapeCsvField(e.description || ''),
    escapeCsvField(e.category.name),
    escapeCsvField(e.spender),
    escapeCsvField(e.payment_method.name),
    formatCurrency(e.amount, currency),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `spendwise-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportToPdf(filters: {
  startDate: string
  endDate: string
  categoryId?: string
  spender?: string
}) {
  try {
    const { data, error } = await supabase.functions.invoke('export-pdf', {
      body: filters,
    })

    if (error) throw error

    // The edge function returns a PDF blob
    const blob = new Blob([data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `spendwise-report-${filters.startDate}-to-${filters.endDate}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    // Re-throw with a friendlier message if edge function isn't deployed
    const msg = error instanceof Error ? error.message : 'Failed to generate PDF'
    throw new Error(msg.includes('FunctionNotFound')
      ? 'PDF export is not available yet. Please deploy the export-pdf edge function.'
      : msg
    )
  }
}
