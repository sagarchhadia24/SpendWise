import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ExpenseWithRelations } from '@/types/database'

export interface ExpenseFilters {
  startDate?: string
  endDate?: string
  categoryId?: string
  spender?: string
  paymentMethodId?: string
}

export function useExpenses(filters?: ExpenseFilters) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  const fetchExpenses = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      let query = supabase
        .from('expenses')
        .select('*, category:categories(*), payment_method:payment_methods(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate)
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters?.spender) {
        query = query.eq('spender', filters.spender)
      }
      if (filters?.paymentMethodId) {
        query = query.eq('payment_method_id', filters.paymentMethodId)
      }

      const { data, error } = await query
      if (error) throw error
      setExpenses(data as ExpenseWithRelations[])
    } catch (error) {
      toast.error('Failed to load expenses')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user, filters?.startDate, filters?.endDate, filters?.categoryId, filters?.spender, filters?.paymentMethodId])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  async function addExpense(data: {
    category_id: string
    amount: number
    description?: string
    date: string
    spender: string
    payment_method_id: string
  }) {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('expenses')
      .insert({ ...data, user_id: user.id })
    if (error) throw error
    await fetchExpenses()
  }

  async function updateExpense(id: string, data: {
    category_id?: string
    amount?: number
    description?: string
    date?: string
    spender?: string
    payment_method_id?: string
  }) {
    const { error } = await supabase
      .from('expenses')
      .update(data)
      .eq('id', id)
    if (error) throw error
    await fetchExpenses()
  }

  async function deleteExpense(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchExpenses()
  }

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchExpenses,
  }
}
