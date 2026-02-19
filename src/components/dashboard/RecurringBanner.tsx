import { useState } from 'react'
import { toast } from 'sonner'
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses'
import { getCategoryIcon } from '@/components/categories/CategoryCard'
import { formatCurrency } from '@/utils/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, SkipForward, ChevronDown, ChevronUp, Bell, Loader2 } from 'lucide-react'
import type { RecurringExpenseWithRelations } from '@/types/database'

interface RecurringBannerProps {
  currency: string
  onAction: () => void
}

export function RecurringBanner({ currency, onAction }: RecurringBannerProps) {
  const { getPendingRecurringExpenses, confirmRecurring, skipRecurring } = useRecurringExpenses()
  const pending = getPendingRecurringExpenses()
  const [expanded, setExpanded] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  if (pending.length === 0) return null

  async function handleConfirm(expense: RecurringExpenseWithRelations) {
    setProcessingId(expense.id)
    try {
      await confirmRecurring(expense)
      toast.success('Expense confirmed and recorded')
      onAction()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to confirm')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleSkip(expense: RecurringExpenseWithRelations) {
    setProcessingId(expense.id)
    try {
      await skipRecurring(expense)
      toast.success('Expense skipped')
      onAction()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to skip')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-base">
              You have {pending.length} pending recurring expense{pending.length !== 1 ? 's' : ''}
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3">
          {pending.map((expense) => {
            const CatIcon = getCategoryIcon(expense.category.icon)
            const isProcessing = processingId === expense.id
            return (
              <div key={expense.id} className="flex items-center justify-between rounded-md border bg-background p-3">
                <div className="flex items-center gap-3">
                  <CatIcon className="h-4 w-4" style={{ color: expense.category.color }} />
                  <div>
                    <p className="text-sm font-medium">{expense.description || expense.category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(expense.amount, currency)} · {expense.spender}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{expense.frequency}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSkip(expense)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <SkipForward className="mr-1 h-3 w-3" />}
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleConfirm(expense)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Check className="mr-1 h-3 w-3" />}
                    Confirm
                  </Button>
                </div>
              </div>
            )
          })}
        </CardContent>
      )}
    </Card>
  )
}
