import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { StatCards } from '@/components/dashboard/StatCards'
import { SpendingPieChart } from '@/components/dashboard/SpendingPieChart'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import { RecurringBanner } from '@/components/dashboard/RecurringBanner'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { profile } = useAuth()
  const {
    monthlyStats,
    categoryBreakdown,
    recentExpenses,
    dailySpending,
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
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <RecurringBanner currency={currency} onAction={refreshDashboard} />

      <StatCards
        total={monthlyStats.total}
        averageDaily={monthlyStats.averageDaily}
        count={monthlyStats.count}
        currency={currency}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingPieChart data={categoryBreakdown} currency={currency} />
        <MonthlyBarChart data={dailySpending} currency={currency} />
      </div>

      <RecentExpenses expenses={recentExpenses} currency={currency} />
    </div>
  )
}
