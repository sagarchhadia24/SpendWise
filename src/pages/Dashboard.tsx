import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCards } from '@/components/dashboard/StatCards'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { SpendingPieChart } from '@/components/dashboard/SpendingPieChart'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import { RecurringBanner } from '@/components/dashboard/RecurringBanner'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const {
    monthlyStats,
    categoryBreakdown,
    recentExpenses,
    dailySpending,
    budgetProgress,
    loading,
    refreshDashboard,
  } = useDashboard()

  const currency = profile?.currency || 'USD'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button asChild size="sm" className="sm:size-default">
          <Link to="/expenses/new">
            <Plus className="mr-1 h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      </div>

      <RecurringBanner currency={currency} onAction={refreshDashboard} />

      <StatCards
        total={monthlyStats.total}
        averageDaily={monthlyStats.averageDaily}
        count={monthlyStats.count}
        currency={currency}
      />

      <BudgetProgress budgets={budgetProgress} currency={currency} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingPieChart data={categoryBreakdown} currency={currency} />
        <MonthlyBarChart data={dailySpending} currency={currency} />
      </div>

      <RecentExpenses expenses={recentExpenses} currency={currency} />
    </div>
  )
}
