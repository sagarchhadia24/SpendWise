import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import { formatCurrency } from '@/utils/format'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type TrendData = Awaited<ReturnType<ReturnType<typeof useReports>['fetchCategoryTrend']>>

export function CategoryTrend() {
  const { profile } = useAuth()
  const { fetchCategoryTrend, loading } = useReports()
  const currency = profile?.currency || 'USD'

  const [months, setMonths] = useState('6')
  const [trend, setTrend] = useState<TrendData>({ data: [], categories: [] })

  useEffect(() => {
    fetchCategoryTrend(Number(months)).then(setTrend)
  }, [months, fetchCategoryTrend])

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Period</Label>
          <Select value={months} onValueChange={setMonths}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Spending Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.data.length > 0 && trend.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trend.data}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                  <Legend />
                  {trend.categories.map((cat) => (
                    <Line
                      key={cat.name}
                      type="monotone"
                      dataKey={cat.name}
                      stroke={cat.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="py-8 text-center text-muted-foreground">No data for this period</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
