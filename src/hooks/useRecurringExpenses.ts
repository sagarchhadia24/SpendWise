import { useCallback, useEffect, useState } from 'react'
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Frequency, RecurringExpenseWithRelations } from '@/types/database'

function advanceDate(date: string, frequency: Frequency): string {
  const d = new Date(date + 'T00:00:00')
  switch (frequency) {
    case 'daily': return format(addDays(d, 1), 'yyyy-MM-dd')
    case 'weekly': return format(addWeeks(d, 1), 'yyyy-MM-dd')
    case 'monthly': return format(addMonths(d, 1), 'yyyy-MM-dd')
    case 'yearly': return format(addYears(d, 1), 'yyyy-MM-dd')
  }
}

export function useRecurringExpenses() {
  const { user } = useAuth()
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecurringExpenses = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*, category:categories(*), payment_method:payment_methods(*)')
        .eq('user_id', user.id)
        .order('next_due_date', { ascending: true })
      if (error) throw error
      setRecurringExpenses(data as RecurringExpenseWithRelations[])
    } catch (error) {
      toast.error('Failed to load recurring expenses')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchRecurringExpenses()
  }, [fetchRecurringExpenses])

  async function addRecurringExpense(data: {
    category_id: string
    amount: number
    description?: string
    spender: string
    payment_method_id: string
    frequency: Frequency
    start_date: string
    end_date?: string
  }) {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('recurring_expenses')
      .insert({
        ...data,
        user_id: user.id,
        next_due_date: data.start_date,
        is_active: true,
      })
    if (error) throw error
    await fetchRecurringExpenses()
  }

  async function updateRecurringExpense(id: string, data: {
    category_id?: string
    amount?: number
    description?: string
    spender?: string
    payment_method_id?: string
    frequency?: Frequency
    start_date?: string
    end_date?: string | null
    is_active?: boolean
  }) {
    const { error } = await supabase
      .from('recurring_expenses')
      .update(data)
      .eq('id', id)
    if (error) throw error
    await fetchRecurringExpenses()
  }

  async function deleteRecurringExpense(id: string) {
    const { error } = await supabase
      .from('recurring_expenses')
      .delete()
      .eq('id', id)
    if (error) throw error
    await fetchRecurringExpenses()
  }

  async function confirmRecurring(recurring: RecurringExpenseWithRelations) {
    if (!user) throw new Error('Not authenticated')
    // Create an actual expense from the recurring template
    const { error: insertError } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        category_id: recurring.category_id,
        amount: recurring.amount,
        description: recurring.description,
        date: recurring.next_due_date,
        spender: recurring.spender,
        payment_method_id: recurring.payment_method_id,
        recurring_expense_id: recurring.id,
      })
    if (insertError) throw insertError

    // Advance next_due_date
    const nextDate = advanceDate(recurring.next_due_date, recurring.frequency)
    const updates: Record<string, unknown> = { next_due_date: nextDate }

    // Deactivate if end_date has been reached
    if (recurring.end_date && nextDate > recurring.end_date) {
      updates.is_active = false
    }

    const { error: updateError } = await supabase
      .from('recurring_expenses')
      .update(updates)
      .eq('id', recurring.id)
    if (updateError) throw updateError

    await fetchRecurringExpenses()
  }

  async function skipRecurring(recurring: RecurringExpenseWithRelations) {
    const nextDate = advanceDate(recurring.next_due_date, recurring.frequency)
    const updates: Record<string, unknown> = { next_due_date: nextDate }

    if (recurring.end_date && nextDate > recurring.end_date) {
      updates.is_active = false
    }

    const { error } = await supabase
      .from('recurring_expenses')
      .update(updates)
      .eq('id', recurring.id)
    if (error) throw error
    await fetchRecurringExpenses()
  }

  function getPendingRecurringExpenses(): RecurringExpenseWithRelations[] {
    const today = format(new Date(), 'yyyy-MM-dd')
    return recurringExpenses.filter(
      (r) => r.is_active && r.next_due_date <= today
    )
  }

  return {
    recurringExpenses,
    loading,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
    confirmRecurring,
    skipRecurring,
    getPendingRecurringExpenses,
    fetchRecurringExpenses,
  }
}
