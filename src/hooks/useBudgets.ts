import { useCallback, useEffect, useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { BudgetWithCategory } from '@/types/database'

export function useBudgets(month: Date) {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [loading, setLoading] = useState(true)

  const monthStart = format(startOfMonth(month), 'yyyy-MM-dd')

  const fetchBudgets = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .eq('month', monthStart)
        .order('amount', { ascending: false })
      if (error) throw error
      setBudgets(data as BudgetWithCategory[])
    } catch (error) {
      toast.error('Failed to load budgets')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user, monthStart])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  async function setBudget(categoryId: string, amount: number) {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('budgets')
      .upsert(
        { user_id: user.id, category_id: categoryId, amount, month: monthStart },
        { onConflict: 'user_id,category_id,month' }
      )
    if (error) throw error
    await fetchBudgets()
  }

  async function deleteBudget(categoryId: string) {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', user.id)
      .eq('category_id', categoryId)
      .eq('month', monthStart)
    if (error) throw error
    await fetchBudgets()
  }

  return {
    budgets,
    loading,
    setBudget,
    deleteBudget,
    fetchBudgets,
  }
}
