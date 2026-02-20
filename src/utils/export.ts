import { format } from 'date-fns'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
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

export function exportToPdf(
  expenses: ExpenseWithRelations[],
  currency: string,
  startDate: string,
  endDate: string,
) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(18)
  doc.text('SpendWise Report', 14, 20)

  // Date range
  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`${startDate} to ${endDate}`, 14, 28)

  // Summary
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const count = expenses.length
  const avg = count > 0 ? total / count : 0

  doc.setFontSize(12)
  doc.setTextColor(0)
  doc.text(`Total: ${formatCurrency(total, currency)}`, 14, 40)
  doc.text(`Expenses: ${count}`, 14, 47)
  doc.text(`Average: ${formatCurrency(avg, currency)}`, 14, 54)

  // Category breakdown
  const catMap = new Map<string, number>()
  for (const e of expenses) {
    const name = e.category?.name || 'Unknown'
    catMap.set(name, (catMap.get(name) || 0) + Number(e.amount))
  }
  const categories = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, catTotal]) => [
      name,
      formatCurrency(catTotal, currency),
      total > 0 ? `${((catTotal / total) * 100).toFixed(1)}%` : '0%',
    ])

  if (categories.length > 0) {
    doc.setFontSize(13)
    doc.text('Category Breakdown', 14, 66)
    autoTable(doc, {
      startY: 70,
      head: [['Category', 'Amount', '% of Total']],
      body: categories,
      theme: 'striped',
      headStyles: { fillColor: [15, 118, 110] },
      margin: { left: 14 },
    })
  }

  // Expense details table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableY = ((doc as any).lastAutoTable?.finalY as number) ?? 90
  doc.setFontSize(13)
  doc.text('Expense Details', 14, tableY + 12)

  const rows = expenses.map((e) => [
    format(new Date(e.date + 'T00:00:00'), 'yyyy-MM-dd'),
    (e.description || '').substring(0, 30),
    e.category?.name || '',
    e.spender,
    e.payment_method?.name || '',
    formatCurrency(e.amount, currency),
  ])

  autoTable(doc, {
    startY: tableY + 16,
    head: [['Date', 'Description', 'Category', 'Spender', 'Payment', 'Amount']],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [15, 118, 110] },
    margin: { left: 14 },
    styles: { fontSize: 9 },
    columnStyles: { 1: { cellWidth: 40 } },
  })

  doc.save(`spendwise-report-${startDate}-to-${endDate}.pdf`)
}
