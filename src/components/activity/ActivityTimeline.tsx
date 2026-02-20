import { format, isToday, isYesterday } from 'date-fns'
import { ActivityEntry } from '@/components/activity/ActivityEntry'
import type { ActivityLog } from '@/types/database'

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMMM d, yyyy')
}

function groupByDate(logs: ActivityLog[]): Map<string, ActivityLog[]> {
  const groups = new Map<string, ActivityLog[]>()
  for (const log of logs) {
    const dateKey = log.created_at.split('T')[0]
    const existing = groups.get(dateKey) || []
    existing.push(log)
    groups.set(dateKey, existing)
  }
  return groups
}

interface ActivityTimelineProps {
  logs: ActivityLog[]
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No activity found
      </div>
    )
  }

  const groups = groupByDate(logs)

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([dateKey, dateLogs]) => (
        <div key={dateKey}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {formatDateGroup(dateKey)}
          </h3>
          <div className="divide-y divide-border rounded-lg border bg-card p-2">
            {dateLogs.map((log) => (
              <ActivityEntry key={log.id} log={log} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
