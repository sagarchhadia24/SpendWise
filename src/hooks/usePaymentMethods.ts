import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { PaymentMethod } from '@/types/database'

export function usePaymentMethods() {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPaymentMethods = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name')
      if (error) throw error
      setPaymentMethods(data as PaymentMethod[])
    } catch (error) {
      toast.error('Failed to load payment methods')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  async function addPaymentMethod(name: string) {
    if (!user) throw new Error('Not authenticated')
    const value = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
    const { error } = await supabase
      .from('payment_methods')
      .insert({ user_id: user.id, name, value, is_default: false })
    if (error) throw error
    await fetchPaymentMethods()
  }

  async function removePaymentMethod(id: string) {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
    if (error) {
      if (error.code === '23503') {
        throw new Error('Cannot delete: this payment method is used by existing expenses')
      }
      throw error
    }
    await fetchPaymentMethods()
  }

  return {
    paymentMethods,
    loading,
    addPaymentMethod,
    removePaymentMethod,
    fetchPaymentMethods,
  }
}
