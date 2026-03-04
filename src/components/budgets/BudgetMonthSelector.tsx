import { format, addMonths, subMonths, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface BudgetMonthSelectorProps {
  month: Date
  onChange: (month: Date) => void
}

export function BudgetMonthSelector({ month, onChange }: BudgetMonthSelectorProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-3">
        <Button variant="ghost" size="icon" onClick={() => onChange(subMonths(month, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">{format(month, 'MMMM yyyy')}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange(startOfMonth(new Date()))}
            title="Current month"
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onChange(addMonths(month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
