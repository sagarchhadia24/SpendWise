import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActivityAction, ActivityEntityType } from '@/types/database'

interface ActivityFiltersProps {
  entityType?: ActivityEntityType
  action?: ActivityAction
  onEntityTypeChange: (value: ActivityEntityType | undefined) => void
  onActionChange: (value: ActivityAction | undefined) => void
}

export function ActivityFilters({
  entityType,
  action,
  onEntityTypeChange,
  onActionChange,
}: ActivityFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select
        value={entityType ?? 'all'}
        onValueChange={(v) => onEntityTypeChange(v === 'all' ? undefined : v as ActivityEntityType)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="expense">Expenses</SelectItem>
          <SelectItem value="recurring_expense">Recurring</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={action ?? 'all'}
        onValueChange={(v) => onActionChange(v === 'all' ? undefined : v as ActivityAction)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All actions</SelectItem>
          <SelectItem value="created">Created</SelectItem>
          <SelectItem value="updated">Updated</SelectItem>
          <SelectItem value="deleted">Deleted</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
