export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Profile {
  id: string
  name: string
  family_members: string[]
  currency: string
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string | null
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  user_id: string | null
  name: string
  value: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string
  amount: number
  description: string | null
  date: string
  spender: string
  payment_method_id: string
  recurring_expense_id: string | null
  created_at: string
  updated_at: string
}

export interface RecurringExpense {
  id: string
  user_id: string
  category_id: string
  amount: number
  description: string | null
  spender: string
  payment_method_id: string
  frequency: Frequency
  start_date: string
  end_date: string | null
  is_active: boolean
  next_due_date: string
  created_at: string
  updated_at: string
}

export interface ExpenseWithRelations extends Expense {
  category: Category
  payment_method: PaymentMethod
}

export interface RecurringExpenseWithRelations extends RecurringExpense {
  category: Category
  payment_method: PaymentMethod
}
