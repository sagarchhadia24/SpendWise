import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useReports } from '@/hooks/useReports'
import { formatCurrency } from '@/utils/format'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

type SpenderData = Awaited<ReturnType<ReturnType<typeof useReports>['fetchBySpender']>>

export function BySpender() {
  const { profile } = useAuth()
  const { fetchBySpender, loading } = useReports()
  const currency = profile?.currency || 'USD'

  const spenderOptions = [profile?.name || 'Me', ...(profile?.family_members || [])].filter(Boolean) as string[]

  const [selectedSpender, setSelectedSpender] = useState<string>('all')
  const [data, setData] = useState<SpenderData>([])

  useEffect(() => {
    const start = format(startOfMonth(new Date()), 'yyyy-MM-dd')
    const end = format(endOfMonth(new Date()), 'yyyy-MM-dd')
    fetchBySpender(start, end).then(setData)
  }, [fetchBySpender])

  const filtered = selectedSpender === 'all' ? data : data.filter((s) => s.name === selectedSpender)

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Spender</Label>
          <Select value={selectedSpender} onValueChange={setSelectedSpender}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All spenders</SelectItem>
              {spenderOptions.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No data for this period</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spender) => (
            <Card key={spender.name}>
              <CardHeader>
                <CardTitle className="text-base">{spender.name}</CardTitle>
                <p className="text-2xl font-bold">{formatCurrency(spender.total, currency)}</p>
              </CardHeader>
              <CardContent>
                {spender.categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={spender.categories} cx="50%" cy="50%" outerRadius={70} dataKey="total" nameKey="name">
                        {spender.categories.map((c, i) => <Cell key={i} fill={c.color} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="py-4 text-center text-sm text-muted-foreground">No categories</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
