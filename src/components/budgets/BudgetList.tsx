import { BudgetListItem } from './BudgetListItem'
import type { Category } from '@/types/database'

interface BudgetItem {
  category: Category
  budgetAmount: number | null
  spent: number
}

interface BudgetListProps {
  items: BudgetItem[]
  currency: string
  isCurrentMonth: boolean
  onSetBudget: (categoryId: string, amount: number) => Promise<void>
  onDeleteBudget: (categoryId: string) => Promise<void>
}

export function BudgetList({ items, currency, isCurrentMonth, onSetBudget, onDeleteBudget }: BudgetListProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No categories found. Add categories first to set budgets.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <BudgetListItem
          key={item.category.id}
          category={item.category}
          budgetAmount={item.budgetAmount}
          spent={item.spent}
          currency={currency}
          isCurrentMonth={isCurrentMonth}
          onSetBudget={onSetBudget}
          onDeleteBudget={onDeleteBudget}
        />
      ))}
    </div>
  )
}
