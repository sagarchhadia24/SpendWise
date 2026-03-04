import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, format, isSameMonth } from 'date-fns'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useBudgets } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { supabase } from '@/lib/supabase'
import { BudgetMonthSelector } from '@/components/budgets/BudgetMonthSelector'
import { BudgetList } from '@/components/budgets/BudgetList'
import type { ExpenseWithRelations } from '@/types/database'

export default function Budgets() {
  const { user, profile } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()))
  const { budgets, loading: budgetsLoading, setBudget, deleteBudget } = useBudgets(selectedMonth)
  const { categories, loading: categoriesLoading } = useCategories()
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([])
  const [expensesLoading, setExpensesLoading] = useState(true)

  const currency = profile?.currency || 'USD'
  const isCurrentMonth = isSameMonth(selectedMonth, new Date())

  // Fetch expenses for the selected month
  const fetchExpenses = useCallback(async () => {
    if (!user) return
    setExpensesLoading(true)
    try {
      const monthStart = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')
      const { data, error } = await supabase
        .from('expenses')
        .select('*, category:categories(*), payment_method:payment_methods(*)')
        .eq('user_id', user.id)
        .gte('date', monthStart)
        .lte('date', monthEnd)
      if (error) throw error
      setExpenses(data as ExpenseWithRelations[])
    } catch {
      console.error('Failed to load expenses for budgets')
    } finally {
      setExpensesLoading(false)
    }
  }, [user, selectedMonth])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // Compute spending per category
  const spendingByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      map.set(e.category_id, (map.get(e.category_id) || 0) + Number(e.amount))
    }
    return map
  }, [expenses])

  // Merge categories with budgets and spending, sorted
  const budgetItems = useMemo(() => {
    const budgetMap = new Map(budgets.map((b) => [b.category_id, b]))

    const items = categories.map((cat) => {
      const budget = budgetMap.get(cat.id)
      const spent = spendingByCategory.get(cat.id) || 0
      return {
        category: cat,
        budgetAmount: budget ? Number(budget.amount) : null,
        spent,
      }
    })

    // Budgeted categories first (by % used desc), then unbudgeted (alphabetical)
    return items.sort((a, b) => {
      if (a.budgetAmount !== null && b.budgetAmount === null) return -1
      if (a.budgetAmount === null && b.budgetAmount !== null) return 1
      if (a.budgetAmount !== null && b.budgetAmount !== null) {
        const pctA = a.budgetAmount > 0 ? a.spent / a.budgetAmount : 0
        const pctB = b.budgetAmount > 0 ? b.spent / b.budgetAmount : 0
        return pctB - pctA
      }
      return a.category.name.localeCompare(b.category.name)
    })
  }, [categories, budgets, spendingByCategory])

  async function handleSetBudget(categoryId: string, amount: number) {
    try {
      await setBudget(categoryId, amount)
      toast.success('Budget saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save budget')
    }
  }

  async function handleDeleteBudget(categoryId: string) {
    try {
      await deleteBudget(categoryId)
      toast.success('Budget removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove budget')
    }
  }

  const loading = budgetsLoading || categoriesLoading || expensesLoading

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Budgets</h2>

      <BudgetMonthSelector month={selectedMonth} onChange={setSelectedMonth} />

      <BudgetList
        items={budgetItems}
        currency={currency}
        isCurrentMonth={isCurrentMonth}
        onSetBudget={handleSetBudget}
        onDeleteBudget={handleDeleteBudget}
      />
    </div>
  )
}
