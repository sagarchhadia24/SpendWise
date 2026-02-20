import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityLog } from '@/types/database'

const actionConfig = {
  created: { icon: Plus, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'created' },
  updated: { icon: Pencil, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'updated' },
  deleted: { icon: Trash2, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'deleted' },
}

const DISPLAY_FIELDS: Record<string, string> = {
  amount: 'Amount',
  description: 'Description',
  date: 'Date',
  spender: 'Spender',
  category_id: 'Category',
  payment_method_id: 'Payment Method',
  frequency: 'Frequency',
  is_active: 'Active',
  start_date: 'Start Date',
  end_date: 'End Date',
  next_due_date: 'Next Due Date',
}

const IGNORED_FIELDS = ['id', 'user_id', 'created_at', 'updated_at', 'recurring_expense_id']

function getEntityLabel(log: ActivityLog): string {
  const data = log.new_data || log.old_data
  const desc = data?.description as string
  const amount = data?.amount
  const type = log.entity_type === 'expense' ? 'Expense' : 'Recurring expense'

  if (desc) return `${type} "${desc}"`
  if (amount != null) return `${type} ($${Number(amount).toFixed(2)})`
  return type
}

function getChangedFields(oldData: Record<string, unknown>, newData: Record<string, unknown>) {
  const changes: { field: string; label: string; oldVal: unknown; newVal: unknown }[] = []
  for (const key of Object.keys(newData)) {
    if (IGNORED_FIELDS.includes(key)) continue
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes.push({
        field: key,
        label: DISPLAY_FIELDS[key] || key,
        oldVal: oldData[key],
        newVal: newData[key],
      })
    }
  }
  return changes
}

function formatValue(val: unknown): string {
  if (val == null) return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'number') return `$${val.toFixed(2)}`
  return String(val)
}

interface ActivityEntryProps {
  log: ActivityLog
}

export function ActivityEntry({ log }: ActivityEntryProps) {
  const [expanded, setExpanded] = useState(false)
  const config = actionConfig[log.action]
  const Icon = config.icon
  const hasDetails = log.action === 'updated' && log.old_data && log.new_data
  const changes = hasDetails ? getChangedFields(log.old_data!, log.new_data!) : []

  return (
    <div className="flex gap-3 py-3">
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm">
            <span className="font-medium">{getEntityLabel(log)}</span>
            {' '}was{' '}
            <span className={cn('font-medium', config.color)}>{config.label}</span>
          </p>
          <time
            className="shrink-0 text-xs text-muted-foreground"
            title={format(new Date(log.created_at), 'PPpp')}
          >
            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
          </time>
        </div>

        {log.action === 'created' && log.new_data && (
          <div className="mt-1.5 text-xs text-muted-foreground">
            {log.new_data.amount != null && <span>Amount: ${Number(log.new_data.amount).toFixed(2)}</span>}
            {log.new_data.date && <span> · Date: {String(log.new_data.date)}</span>}
            {log.new_data.spender && <span> · By: {String(log.new_data.spender)}</span>}
          </div>
        )}

        {log.action === 'deleted' && log.old_data && (
          <div className="mt-1.5 text-xs text-muted-foreground">
            {log.old_data.amount != null && <span>Amount: ${Number(log.old_data.amount).toFixed(2)}</span>}
            {log.old_data.description && <span> · {String(log.old_data.description)}</span>}
          </div>
        )}

        {hasDetails && changes.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {changes.length} field{changes.length !== 1 ? 's' : ''} changed
          </button>
        )}

        {expanded && changes.length > 0 && (
          <div className="mt-2 rounded-lg border bg-muted/50 p-3 text-xs space-y-1.5">
            {changes.map((c) => (
              <div key={c.field} className="flex flex-wrap gap-1">
                <span className="font-medium">{c.label}:</span>
                <span className="text-red-600 line-through dark:text-red-400">{formatValue(c.oldVal)}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatValue(c.newVal)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
