import { useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import { formatCurrency } from '@/utils/format'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface CustomDateRangeProps {
  onExportCsv: (expenses: unknown[]) => void
  onExportPdf: (startDate: string, endDate: string) => void
}

export function CustomDateRange({ onExportCsv, onExportPdf }: CustomDateRangeProps) {
  const { profile } = useAuth()
  const { fetchDateRangeSummary, loading } = useReports()
  const currency = profile?.currency || 'USD'

  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof fetchDateRangeSummary>> | null>(null)

  async function handleGenerate() {
    if (!startDate || !endDate) return
    const data = await fetchDateRangeSummary(startDate, endDate)
    setSummary(data)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input type="date" className="w-40" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input type="date" className="w-40" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate
        </Button>
        {summary && (
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => onExportCsv(summary.expenses)}>Export CSV</Button>
            <Button variant="outline" size="sm" onClick={() => onExportPdf(startDate, endDate)}>Export PDF</Button>
          </div>
        )}
      </div>

      {summary && (
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
            <Card>
              <CardHeader><CardTitle className="text-base">By Category</CardTitle></CardHeader>
              <CardContent>
                {summary.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={summary.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="total" nameKey="name" paddingAngle={2}>
                        {summary.categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="py-8 text-center text-muted-foreground">No data</p>}
              </CardContent>
            </Card>

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
                      <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="py-8 text-center text-muted-foreground">No data</p>}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
