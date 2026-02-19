import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { getCategoryIcon } from '@/components/categories/CategoryCard'
import { formatCurrency } from '@/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { ExpenseWithRelations } from '@/types/database'

interface RecentExpensesProps {
  expenses: ExpenseWithRelations[]
  currency: string
}

export function RecentExpenses({ expenses, currency }: RecentExpensesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Expenses</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/expenses">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No expenses yet</p>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const CatIcon = getCategoryIcon(expense.category.icon)
              return (
                <div key={expense.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-md"
                      style={{ backgroundColor: expense.category.color + '20' }}
                    >
                      <CatIcon className="h-4 w-4" style={{ color: expense.category.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {expense.description || expense.category.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.date + 'T00:00:00'), 'MMM d')} · {expense.spender}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(expense.amount, currency)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
