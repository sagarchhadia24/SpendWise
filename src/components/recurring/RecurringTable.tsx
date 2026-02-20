import { format } from 'date-fns'
import { getCategoryIcon } from '@/components/categories/CategoryCard'
import { formatCurrency } from '@/utils/format'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { RecurringExpenseWithRelations } from '@/types/database'

interface RecurringTableProps {
  expenses: RecurringExpenseWithRelations[]
  currency: string
  onEdit: (expense: RecurringExpenseWithRelations) => void
  onDelete: (expense: RecurringExpenseWithRelations) => void
  onToggleActive: (expense: RecurringExpenseWithRelations) => void
}

export function RecurringTable({ expenses, currency, onEdit, onDelete, onToggleActive }: RecurringTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No recurring expenses yet
      </div>
    )
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Spender</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-28">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => {
            const CatIcon = getCategoryIcon(expense.category.icon)
            const isPending = expense.is_active && expense.next_due_date <= format(new Date(), 'yyyy-MM-dd')

            return (
              <TableRow key={expense.id}>
                <TableCell className="max-w-48 truncate">{expense.description || '—'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CatIcon className="h-4 w-4" style={{ color: expense.category.color }} />
                    <span className="whitespace-nowrap">{expense.category.name}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {formatCurrency(expense.amount, currency)}
                </TableCell>
                <TableCell>{expense.spender}</TableCell>
                <TableCell className="capitalize">{expense.frequency}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(expense.next_due_date + 'T00:00:00'), 'MMM d, yyyy')}
                  {isPending && <Badge variant="destructive" className="ml-2">Due</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant={expense.is_active ? 'default' : 'secondary'}>
                    {expense.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onToggleActive(expense)}
                      title={expense.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {expense.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(expense)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(expense)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
