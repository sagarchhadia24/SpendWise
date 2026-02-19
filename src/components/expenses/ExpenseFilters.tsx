import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import type { ExpenseFilters as Filters } from '@/hooks/useExpenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'

interface ExpenseFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function ExpenseFilters({ filters, onChange }: ExpenseFiltersProps) {
  const { profile } = useAuth()
  const { categories } = useCategories()
  const { paymentMethods } = usePaymentMethods()

  const spenderOptions = [
    profile?.name || 'Me',
    ...(profile?.family_members || []),
  ].filter(Boolean)

  function setPreset(preset: 'this-month' | 'last-month') {
    const now = new Date()
    const target = preset === 'last-month' ? subMonths(now, 1) : now
    onChange({
      ...filters,
      startDate: format(startOfMonth(target), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(target), 'yyyy-MM-dd'),
    })
  }

  function clearFilters() {
    onChange({})
  }

  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        {/* Date presets */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Quick range</Label>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPreset('this-month')}>
              This month
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPreset('last-month')}>
              Last month
            </Button>
          </div>
        </div>

        {/* Custom date range */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            type="date"
            className="w-36"
            value={filters.startDate || ''}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            type="date"
            className="w-36"
            value={filters.endDate || ''}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select
            value={filters.categoryId || 'all'}
            onValueChange={(v) => onChange({ ...filters, categoryId: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spender */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Spender</Label>
          <Select
            value={filters.spender || 'all'}
            onValueChange={(v) => onChange({ ...filters, spender: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All spenders</SelectItem>
              {spenderOptions.map((name) => (
                <SelectItem key={name} value={name!}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payment Method */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Payment</Label>
          <Select
            value={filters.paymentMethodId || 'all'}
            onValueChange={(v) => onChange({ ...filters, paymentMethodId: v === 'all' ? undefined : v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {paymentMethods.map((pm) => (
                <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
