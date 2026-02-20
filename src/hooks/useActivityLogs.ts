import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { ActivityLog, ActivityAction, ActivityEntityType } from '@/types/database'

export interface ActivityFilters {
  entityType?: ActivityEntityType
  action?: ActivityAction
}

const PAGE_SIZE = 20

export function useActivityLogs(filters?: ActivityFilters) {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchLogs = useCallback(async (pageNum: number, append: boolean) => {
    if (!user) return
    if (pageNum === 0) setLoading(true)
    if (pageNum > 0) setLoadingMore(true)
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType)
      }
      if (filters?.action) {
        query = query.eq('action', filters.action)
      }

      const { data, error } = await query
      if (error) throw error

      const results = data as ActivityLog[]
      setHasMore(results.length === PAGE_SIZE)

      if (append) {
        setLogs((prev) => [...prev, ...results])
      } else {
        setLogs(results)
      }
    } catch (error) {
      toast.error('Failed to load activity logs')
      console.error(error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [user, filters?.entityType, filters?.action])

  useEffect(() => {
    setPage(0)
    fetchLogs(0, false)
  }, [fetchLogs])

  function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchLogs(nextPage, true)
  }

  return {
    logs,
    loading,
    loadingMore,
    hasMore,
    loadMore,
  }
}
