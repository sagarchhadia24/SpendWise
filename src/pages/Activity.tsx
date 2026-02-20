import { useState } from 'react'
import { useActivityLogs, type ActivityFilters as Filters } from '@/hooks/useActivityLogs'
import { ActivityTimeline } from '@/components/activity/ActivityTimeline'
import { ActivityFilters } from '@/components/activity/ActivityFilters'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function Activity() {
  const [filters, setFilters] = useState<Filters>({})
  const { logs, loading, hasMore, loadMore } = useActivityLogs(filters)

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
          <ActivityTimeline logs={logs} />
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
