import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useExpenses, type ExpenseFilters } from '@/hooks/useExpenses'
import { useAuth } from '@/hooks/useAuth'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { ExpenseFilters as ExpenseFiltersComponent } from '@/components/expenses/ExpenseFilters'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'

export default function Expenses() {
  const { profile } = useAuth()
  const [filters, setFilters] = useState<ExpenseFilters>({})
  const { expenses, loading, updateExpense, deleteExpense } = useExpenses(filters)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <Button asChild>
          <Link to="/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Link>
        </Button>
      </div>

      <ExpenseFiltersComponent filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <ExpenseTable
          expenses={expenses}
          currency={profile?.currency || 'USD'}
          onUpdate={updateExpense}
          onDelete={deleteExpense}
        />
      )}
    </div>
  )
}
