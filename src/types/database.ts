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
  created_at: string
  updated_at: string
}

export interface ExpenseWithRelations extends Expense {
  category: Category
  payment_method: PaymentMethod
}

export type ActivityAction = 'created' | 'updated' | 'deleted'
export type ActivityEntityType = 'expense' | 'recurring_expense'

export interface ActivityLog {
  id: string
  user_id: string
  entity_type: ActivityEntityType
  entity_id: string
  action: ActivityAction
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  month: string
  created_at: string
  updated_at: string
}

export interface BudgetWithCategory extends Budget {
  category: Category
}

export interface BudgetProgress {
  budget: BudgetWithCategory
  spent: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
}
