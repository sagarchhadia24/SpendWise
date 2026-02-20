import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useExpenses } from '@/hooks/useExpenses'
import { ExpenseForm } from '@/components/expenses/ExpenseForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AddExpense() {
  const navigate = useNavigate()
  const { addExpense } = useExpenses()

  async function handleSubmit(data: {
    category_id: string
    amount: number
    description?: string
    date: string
    spender: string
    payment_method_id: string
  }) {
    try {
      await addExpense(data)
      toast.success('Expense added')
      navigate('/expenses')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add expense')
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  )
}
