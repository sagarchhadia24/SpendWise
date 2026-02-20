import { useState } from 'react'
import { useActivityLogs, type ActivityFilters as Filters } from '@/hooks/useActivityLogs'
import { useAuth } from '@/hooks/useAuth'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { ActivityFilters } from '@/components/activity/ActivityFilters'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function Activity() {
  const { profile } = useAuth()
  const [filters, setFilters] = useState<Filters>({})
  const { logs, loading, loadingMore, hasMore, loadMore } = useActivityLogs(filters)
  const currency = profile?.currency || 'USD'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Activity</h2>
        <ActivityFilters
          entityType={filters.entityType}
          action={filters.action}
          onEntityTypeChange={(entityType) => setFilters((f) => ({ ...f, entityType }))}
          onActionChange={(action) => setFilters((f) => ({ ...f, action }))}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <ActivityTimeline logs={logs} currency={currency} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
