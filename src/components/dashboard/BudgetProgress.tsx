import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/utils/format'
import type { BudgetProgress as BudgetProgressType } from '@/types/database'

interface BudgetProgressProps {
  budgets: BudgetProgressType[]
  currency: string
}

const statusColorMap = {
  safe: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
} as const

export function BudgetProgress({ budgets, currency }: BudgetProgressProps) {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          No budgets set.{' '}
          <Link to="/budgets" className="text-primary underline">
            Set monthly budgets
          </Link>{' '}
          to track your spending.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Budget Progress</CardTitle>
        <Link to="/budgets" className="text-xs text-primary hover:underline">
          View All
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map(({ budget, spent, percentage, status }) => {
          const budgetAmount = Number(budget.amount)
          const overBudget = spent > budgetAmount
          const displayPercentage = Math.min(percentage, 100)

          return (
            <div key={budget.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: budget.category.color }}
                  />
                  <span className="font-medium">{budget.category.name}</span>
                </div>
                <span className="text-muted-foreground">
                  {formatCurrency(spent, currency)} / {formatCurrency(budgetAmount, currency)}
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${displayPercentage}%`,
                    backgroundColor: statusColorMap[status],
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.round(percentage)}%</span>
                {overBudget && (
                  <span className="text-red-500 font-medium">
                    Over by {formatCurrency(spent - budgetAmount, currency)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
