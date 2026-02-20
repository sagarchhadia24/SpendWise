import { useEffect, useState } from 'react'
import { format, subMonths } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import { formatCurrency } from '@/utils/format'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChartWithLabels } from '@/components/ui/PieChartWithLabels'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface MonthlySummaryProps {
  onExportCsv: (expenses: unknown[]) => void
  onExportPdf: (expenses: unknown[], startDate: string, endDate: string) => void
}

export function MonthlySummary({ onExportCsv, onExportPdf }: MonthlySummaryProps) {
  const { profile } = useAuth()
  const { fetchMonthlySummary, loading } = useReports()
  const currency = profile?.currency || 'USD'

  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchMonthlySummary>> | null>(null)

  useEffect(() => {
    fetchMonthlySummary(month, year).then(setSummary)
  }, [month, year, fetchMonthlySummary])

  function prevMonth() {
    const d = subMonths(new Date(year, month, 1), 1)
    setMonth(d.getMonth())
    setYear(d.getFullYear())
  }

  function nextMonth() {
    const d = new Date(year, month + 1, 1)
    setMonth(d.getMonth())
    setYear(d.getFullYear())
  }

  const monthLabel = format(new Date(year, month, 1), 'MMMM yyyy')

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="min-w-32 text-center font-medium">{monthLabel}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => summary && onExportCsv(summary.expenses)}>Export CSV</Button>
          <Button variant="outline" size="sm" onClick={() => {
            if (!summary) return
            const d = new Date(year, month, 1)
            onExportPdf(summary.expenses, format(d, 'yyyy-MM-01'), format(new Date(year, month + 1, 0), 'yyyy-MM-dd'))
          }}>Export PDF</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : summary ? (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Spending</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.total, currency)}</p>
                <p className="text-sm text-muted-foreground">{summary.count} expense{summary.count !== 1 ? 's' : ''}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Category Pie */}
            <Card>
              <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
              <CardContent>
                {summary.categoryBreakdown.length > 0 ? (
                  <PieChartWithLabels data={summary.categoryBreakdown} total={summary.total} currency={currency} />
                ) : <p className="py-8 text-center text-muted-foreground">No data</p>}
              </CardContent>
            </Card>

            {/* Spender Bar */}
            <Card>
              <CardHeader><CardTitle className="text-base">By Spender</CardTitle></CardHeader>
              <CardContent>
                {summary.spenderBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={summary.spenderBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                      <Bar dataKey="total" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="py-8 text-center text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
