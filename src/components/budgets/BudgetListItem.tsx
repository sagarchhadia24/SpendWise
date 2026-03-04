import { useState } from 'react'
import { Check, Pencil, Trash2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCategoryIcon } from '@/components/categories/CategoryCard'
import { formatCurrency } from '@/utils/format'
import type { Category } from '@/types/database'

interface BudgetListItemProps {
  category: Category
  budgetAmount: number | null
  spent: number
  currency: string
  isCurrentMonth: boolean
  onSetBudget: (categoryId: string, amount: number) => Promise<void>
  onDeleteBudget: (categoryId: string) => Promise<void>
}

export function BudgetListItem({
  category,
  budgetAmount,
  spent,
  currency,
  isCurrentMonth,
  onSetBudget,
  onDeleteBudget,
}: BudgetListItemProps) {
  const [editing, setEditing] = useState(false)
  const [amount, setAmount] = useState(budgetAmount?.toString() || '')
  const [saving, setSaving] = useState(false)

  const Icon = getCategoryIcon(category.icon)
  const hasBudget = budgetAmount !== null && budgetAmount > 0
  const percentage = hasBudget ? (spent / budgetAmount) * 100 : 0
  const status = percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'safe'
  const overBudget = hasBudget && spent > budgetAmount

  const statusColorMap = {
    safe: '#22c55e',
    warning: '#eab308',
    danger: '#ef4444',
  } as const

  async function handleSave() {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) return
    setSaving(true)
    try {
      await onSetBudget(category.id, parsed)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setSaving(true)
    try {
      await onDeleteBudget(category.id)
      setEditing(false)
      setAmount('')
    } finally {
      setSaving(false)
    }
  }

  function handleStartEdit() {
    setAmount(budgetAmount?.toString() || '')
    setEditing(true)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: category.color + '20' }}
          >
            <Icon className="h-5 w-5" style={{ color: category.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{category.name}</p>
            {hasBudget && (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(spent, currency)} of {formatCurrency(budgetAmount, currency)}
                {overBudget && (
                  <span className="text-red-500 ml-1">
                    (over by {formatCurrency(spent - budgetAmount, currency)})
                  </span>
                )}
                {!overBudget && hasBudget && (
                  <span className="ml-1">
                    ({formatCurrency(budgetAmount - spent, currency)} remaining)
                  </span>
                )}
              </p>
            )}
          </div>

          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 h-8 text-sm"
                placeholder="Amount"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') setEditing(false)
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSave} disabled={saving}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : hasBudget ? (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStartEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete} disabled={saving}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              Set Budget
            </Button>
          )}
        </div>

        {hasBudget && isCurrentMonth && (
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: statusColorMap[status],
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
