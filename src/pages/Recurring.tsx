import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useRecurringExpenses } from '@/hooks/useRecurringExpenses'
import { RecurringForm } from '@/components/recurring/RecurringForm'
import { RecurringTable } from '@/components/recurring/RecurringTable'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2, Plus } from 'lucide-react'
import type { Frequency, RecurringExpenseWithRelations } from '@/types/database'

export default function Recurring() {
  const { profile } = useAuth()
  const {
    recurringExpenses,
    loading,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
  } = useRecurringExpenses()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringExpenseWithRelations | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RecurringExpenseWithRelations | null>(null)
  const [deleting, setDeleting] = useState(false)

  function handleAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleEdit(expense: RecurringExpenseWithRelations) {
    setEditing(expense)
    setFormOpen(true)
  }

  async function handleSave(data: {
    category_id: string
    amount: number
    description?: string
    spender: string
    payment_method_id: string
    frequency: Frequency
    start_date: string
    end_date?: string
  }) {
    try {
      if (editing) {
        await updateRecurringExpense(editing.id, data)
        toast.success('Recurring expense updated')
      } else {
        await addRecurringExpense(data)
        toast.success('Recurring expense created')
      }
      setFormOpen(false)
      setEditing(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRecurringExpense(deleteTarget.id)
      toast.success('Recurring expense deleted')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleActive(expense: RecurringExpenseWithRelations) {
    try {
      await updateRecurringExpense(expense.id, { is_active: !expense.is_active })
      toast.success(expense.is_active ? 'Deactivated' : 'Activated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recurring Expenses</h2>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recurring
        </Button>
      </div>

      <RecurringTable
        expenses={recurringExpenses}
        currency={profile?.currency || 'USD'}
        onEdit={handleEdit}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
      />

      <RecurringForm
        open={formOpen}
        onOpenChange={setFormOpen}
        recurring={editing}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring expense? This will not remove any expenses already created from it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
