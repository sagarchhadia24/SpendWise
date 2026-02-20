import { useCallback, useState } from 'react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ExpenseWithRelations } from '@/types/database'

interface CategoryTotal {
  name: string
  color: string
  total: number
}

interface SpenderTotal {
  name: string
  total: number
  categories: CategoryTotal[]
}

interface ReportSummary {
  total: number
  count: number
  categoryBreakdown: CategoryTotal[]
  spenderBreakdown: SpenderTotal[]
  expenses: ExpenseWithRelations[]
}

interface CategoryTrendPoint {
  month: string
  [category: string]: string | number
}

export function useReports() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const fetchExpensesForRange = useCallback(async (startDate: string, endDate: string): Promise<ExpenseWithRelations[]> => {
    if (!user) return []
    const { data, error } = await supabase
      .from('expenses')
      .select('*, category:categories(*), payment_method:payment_methods(*)')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    if (error) throw error
    return data as ExpenseWithRelations[]
  }, [user])

  function buildSummary(expenses: ExpenseWithRelations[]): ReportSummary {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    // Category breakdown
    const catMap = new Map<string, CategoryTotal>()
    for (const e of expenses) {
      const existing = catMap.get(e.category.name)
      if (existing) {
        existing.total += Number(e.amount)
      } else {
        catMap.set(e.category.name, { name: e.category.name, color: e.category.color, total: Number(e.amount) })
      }
    }

    // Spender breakdown
    const spenderMap = new Map<string, { total: number; catMap: Map<string, CategoryTotal> }>()
    for (const e of expenses) {
      let spender = spenderMap.get(e.spender)
      if (!spender) {
        spender = { total: 0, catMap: new Map() }
        spenderMap.set(e.spender, spender)
      }
      spender.total += Number(e.amount)
      const cat = spender.catMap.get(e.category.name)
      if (cat) {
        cat.total += Number(e.amount)
      } else {
        spender.catMap.set(e.category.name, { name: e.category.name, color: e.category.color, total: Number(e.amount) })
      }
    }

    return {
      total,
      count: expenses.length,
      categoryBreakdown: Array.from(catMap.values()).sort((a, b) => b.total - a.total),
      spenderBreakdown: Array.from(spenderMap.entries())
        .map(([name, data]) => ({
          name,
          total: data.total,
          categories: Array.from(data.catMap.values()).sort((a, b) => b.total - a.total),
        }))
        .sort((a, b) => b.total - a.total),
      expenses,
    }
  }

  const fetchMonthlySummary = useCallback(async (month: number, year: number): Promise<ReportSummary> => {
    setLoading(true)
    try {
      const date = new Date(year, month, 1)
      const startDate = format(startOfMonth(date), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(date), 'yyyy-MM-dd')
      const expenses = await fetchExpensesForRange(startDate, endDate)
      return buildSummary(expenses)
    } finally {
      setLoading(false)
    }
  }, [fetchExpensesForRange])

  const fetchDateRangeSummary = useCallback(async (startDate: string, endDate: string): Promise<ReportSummary> => {
    setLoading(true)
    try {
      const expenses = await fetchExpensesForRange(startDate, endDate)
      return buildSummary(expenses)
    } finally {
      setLoading(false)
    }
  }, [fetchExpensesForRange])

  const fetchBySpender = useCallback(async (startDate?: string, endDate?: string): Promise<SpenderTotal[]> => {
    setLoading(true)
    try {
      const start = startDate || format(startOfMonth(new Date()), 'yyyy-MM-dd')
      const end = endDate || format(endOfMonth(new Date()), 'yyyy-MM-dd')
      const expenses = await fetchExpensesForRange(start, end)
      return buildSummary(expenses).spenderBreakdown
    } finally {
      setLoading(false)
    }
  }, [fetchExpensesForRange])

  const fetchCategoryTrend = useCallback(async (months: number): Promise<{ data: CategoryTrendPoint[]; categories: { name: string; color: string }[] }> => {
    if (!user) return { data: [], categories: [] }
    setLoading(true)
    try {
      const now = new Date()
      const startDate = format(startOfMonth(subMonths(now, months - 1)), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(now), 'yyyy-MM-dd')
      const expenses = await fetchExpensesForRange(startDate, endDate)

      // Collect all categories
      const catSet = new Map<string, string>()
      for (const e of expenses) {
        catSet.set(e.category.name, e.category.color)
      }

      // Group by month -> category -> total
      const monthMap = new Map<string, Map<string, number>>()
      for (const e of expenses) {
        const monthKey = format(new Date(e.date + 'T00:00:00'), 'MMM yyyy')
        let catTotals = monthMap.get(monthKey)
        if (!catTotals) {
          catTotals = new Map()
          monthMap.set(monthKey, catTotals)
        }
        catTotals.set(e.category.name, (catTotals.get(e.category.name) || 0) + Number(e.amount))
      }

      // Build ordered data points
      const data: CategoryTrendPoint[] = []
      for (let i = months - 1; i >= 0; i--) {
        const d = subMonths(now, i)
        const key = format(d, 'MMM yyyy')
        const catTotals = monthMap.get(key)
        const point: CategoryTrendPoint = { month: key }
        for (const [catName] of catSet) {
          point[catName] = catTotals?.get(catName) || 0
        }
        data.push(point)
      }

      return {
        data,
        categories: Array.from(catSet.entries()).map(([name, color]) => ({ name, color })),
      }
    } finally {
      setLoading(false)
    }
  }, [user, fetchExpensesForRange])

  return {
    loading,
    fetchMonthlySummary,
    fetchDateRangeSummary,
    fetchBySpender,
    fetchCategoryTrend,
  }
}
