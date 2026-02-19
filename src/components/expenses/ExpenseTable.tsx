import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { getCategoryIcon } from '@/components/categories/CategoryCard'
import { formatCurrency } from '@/utils/format'
import { DeleteExpenseDialog } from '@/components/expenses/DeleteExpenseDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ArrowUpDown, CalendarIcon, Check, Pencil, Trash2, X } from 'lucide-react'
import type { ExpenseWithRelations } from '@/types/database'

type SortField = 'date' | 'amount' | 'category' | 'spender'
type SortDir = 'asc' | 'desc'

interface ExpenseTableProps {
  expenses: ExpenseWithRelations[]
  currency: string
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ExpenseTable({ expenses, currency, onUpdate, onDelete }: ExpenseTableProps) {
  const { profile } = useAuth()
  const { categories } = useCategories()
  const { paymentMethods } = usePaymentMethods()
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{
    date: Date
    amount: string
    category_id: string
    spender: string
    payment_method_id: string
    description: string
  }>({ date: new Date(), amount: '', category_id: '', spender: '', payment_method_id: '', description: '' })
  const [saving, setSaving] = useState(false)

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<ExpenseWithRelations | null>(null)

  const spenderOptions = [
    profile?.name || 'Me',
    ...(profile?.family_members || []),
  ].filter(Boolean)

  const sorted = useMemo(() => {
    return [...expenses].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'date':
          cmp = a.date.localeCompare(b.date)
          break
        case 'amount':
          cmp = a.amount - b.amount
          break
        case 'category':
          cmp = a.category.name.localeCompare(b.category.name)
          break
        case 'spender':
          cmp = a.spender.localeCompare(b.spender)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [expenses, sortField, sortDir])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  function startEdit(expense: ExpenseWithRelations) {
    setEditingId(expense.id)
    setEditData({
      date: new Date(expense.date + 'T00:00:00'),
      amount: expense.amount.toString(),
      category_id: expense.category_id,
      spender: expense.spender,
      payment_method_id: expense.payment_method_id,
      description: expense.description || '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function saveEdit(id: string) {
    const amount = Number(editData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount')
      return
    }
    setSaving(true)
    try {
      await onUpdate(id, {
        date: format(editData.date, 'yyyy-MM-dd'),
        amount: Number(amount.toFixed(2)),
        category_id: editData.category_id,
        spender: editData.spender,
        payment_method_id: editData.payment_method_id,
        description: editData.description.trim() || null,
      })
      toast.success('Expense updated')
      setEditingId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await onDelete(deleteTarget.id)
      toast.success('Expense deleted')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    }
  }

  function SortHeader({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
      <TableHead>
        <button
          className="flex items-center gap-1 hover:text-foreground"
          onClick={() => toggleSort(field)}
        >
          {children}
          <ArrowUpDown className="h-3 w-3" />
        </button>
      </TableHead>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No expenses found
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="date">Date</SortHeader>
              <TableHead>Description</TableHead>
              <SortHeader field="category">Category</SortHeader>
              <SortHeader field="spender">Spender</SortHeader>
              <TableHead>Payment</TableHead>
              <SortHeader field="amount">Amount</SortHeader>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((expense) => {
              const isEditing = editingId === expense.id
              const CatIcon = getCategoryIcon(expense.category.icon)

              if (isEditing) {
                return (
                  <TableRow key={expense.id}>
                    {/* Date */}
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-32 justify-start">
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {format(editData.date, 'MMM d, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={editData.date}
                            onSelect={(d) => d && setEditData({ ...editData, date: d })}
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    {/* Description */}
                    <TableCell>
                      <Input
                        className="h-8"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      />
                    </TableCell>
                    {/* Category */}
                    <TableCell>
                      <Select value={editData.category_id} onValueChange={(v) => setEditData({ ...editData, category_id: v })}>
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {/* Spender */}
                    <TableCell>
                      <Select value={editData.spender} onValueChange={(v) => setEditData({ ...editData, spender: v })}>
                        <SelectTrigger className="h-8 w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {spenderOptions.map((s) => (
                            <SelectItem key={s} value={s!}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {/* Payment */}
                    <TableCell>
                      <Select value={editData.payment_method_id} onValueChange={(v) => setEditData({ ...editData, payment_method_id: v })}>
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((pm) => (
                            <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    {/* Amount */}
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 w-24"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                      />
                    </TableCell>
                    {/* Actions */}
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(expense.id)} disabled={saving}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }

              return (
                <TableRow key={expense.id}>
                  <TableCell className="whitespace-nowrap">{format(new Date(expense.date + 'T00:00:00'), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="max-w-48 truncate">{expense.description || '—'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: expense.category.color }}
                      />
                      <CatIcon className="h-4 w-4" style={{ color: expense.category.color }} />
                      <span className="whitespace-nowrap">{expense.category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{expense.spender}</TableCell>
                  <TableCell>{expense.payment_method.name}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatCurrency(expense.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(expense)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteTarget(expense)}>
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

      <DeleteExpenseDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}
