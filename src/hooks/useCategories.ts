import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Category } from '@/types/database'

export function useCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name')
      if (error) throw error
      setCategories(data as Category[])
    } catch (error) {
      toast.error('Failed to load categories')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  async function addCategory(data: { name: string; icon: string; color: string }) {
    if (!user) throw new Error('Not authenticated')
    const { error } = await supabase
      .from('categories')
      .insert({ user_id: user.id, ...data, is_default: false })
    if (error) throw error
    await fetchCategories()
  }

  async function updateCategory(id: string, data: { name: string; icon: string; color: string }) {
    const { error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
    if (error) throw error
    await fetchCategories()
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    if (error) {
      if (error.code === '23503') {
        throw new Error('Cannot delete: this category has linked expenses. Reassign them first.')
      }
      throw error
    }
    await fetchCategories()
  }

  const getCategoryExpenseCount = useCallback(async (id: string): Promise<number> => {
    const { count, error } = await supabase
      .from('expenses')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)
    if (error) throw error
    return count || 0
  }, [])

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryExpenseCount,
    fetchCategories,
  }
}
