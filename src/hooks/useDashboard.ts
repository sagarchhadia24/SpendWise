import { useCallback, useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ExpenseWithRelations } from '@/types/database'

interface MonthlyStats {
  total: number
  averageDaily: number
  count: number
}

interface CategoryBreakdown {
  name: string
  color: string
  total: number
}

export function useDashboard() {
  const { user } = useAuth()
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({ total: 0, averageDaily: 0, count: 0 })
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [recentExpenses, setRecentExpenses] = useState<ExpenseWithRelations[]>([])
  const [dailySpending, setDailySpending] = useState<{ date: string; amount: number }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const now = new Date()
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
      const daysInMonth = getDaysInMonth(now)

      // Fetch current month expenses
      const { data: monthExpenses, error: monthError } = await supabase
        .from('expenses')
        .select('*, category:categories(*), payment_method:payment_methods(*)')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .order('date', { ascending: false })

      if (monthError) throw monthError

      const expenses = monthExpenses as ExpenseWithRelations[]

      // Monthly stats
      const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
      setMonthlyStats({
        total,
        averageDaily: daysInMonth > 0 ? total / daysInMonth : 0,
        count: expenses.length,
      })

      // Category breakdown
      const catMap = new Map<string, CategoryBreakdown>()
      for (const e of expenses) {
        const existing = catMap.get(e.category.name)
        if (existing) {
          existing.total += Number(e.amount)
        } else {
          catMap.set(e.category.name, {
            name: e.category.name,
            color: e.category.color,
            total: Number(e.amount),
          })
        }
      }
      setCategoryBreakdown(
        Array.from(catMap.values()).sort((a, b) => b.total - a.total)
      )

      // Daily spending for bar chart
      const dailyMap = new Map<string, number>()
      for (const e of expenses) {
        const key = e.date
        dailyMap.set(key, (dailyMap.get(key) || 0) + Number(e.amount))
      }
      const dailyArr = Array.from(dailyMap.entries())
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date))
      setDailySpending(dailyArr)

      // Recent 5 expenses (across all time)
      const { data: recent, error: recentError } = await supabase
        .from('expenses')
        .select('*, category:categories(*), payment_method:payment_methods(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentError) throw recentError
      setRecentExpenses(recent as ExpenseWithRelations[])
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    monthlyStats,
    categoryBreakdown,
    recentExpenses,
    dailySpending,
    loading,
    refreshDashboard: fetchDashboardData,
  }
}
