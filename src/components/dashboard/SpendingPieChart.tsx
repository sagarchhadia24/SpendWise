import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChartWithLabels } from '@/components/ui/PieChartWithLabels'

interface SpendingPieChartProps {
  data: { name: string; color: string; total: number }[]
  currency: string
}

export function SpendingPieChart({ data, currency }: SpendingPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
          No data for this month
        </CardContent>
      </Card>
    )
  }

  const grandTotal = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChartWithLabels data={data} total={grandTotal} currency={currency} />
      </CardContent>
    </Card>
  )
}
