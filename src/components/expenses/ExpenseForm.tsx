import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { getCategoryIcon } from '@/components/categories/CategoryCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ExpenseFormProps {
  onSubmit: (data: {
    category_id: string
    amount: number
    description?: string
    date: string
    spender: string
    payment_method_id: string
  }) => Promise<void>
  initialData?: {
    category_id?: string
    amount?: number
    description?: string
    date?: string
    spender?: string
    payment_method_id?: string
  }
  submitLabel?: string
}

export function ExpenseForm({ onSubmit, initialData, submitLabel = 'Add Expense' }: ExpenseFormProps) {
  const { profile } = useAuth()
  const { categories } = useCategories()
  const { paymentMethods } = usePaymentMethods()

  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date + 'T00:00:00') : new Date()
  )
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '')
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
  const [spender, setSpender] = useState(initialData?.spender || profile?.name || '')
  const [paymentMethodId, setPaymentMethodId] = useState(initialData?.payment_method_id || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const spenderOptions = [
    profile?.name || 'Me',
    ...(profile?.family_members || []),
  ].filter(Boolean)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Valid amount is required'
    if (!categoryId) newErrors.categoryId = 'Category is required'
    if (!spender) newErrors.spender = 'Spender is required'
    if (!paymentMethodId) newErrors.paymentMethodId = 'Payment method is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setSaving(true)
    try {
      await onSubmit({
        category_id: categoryId,
        amount: Number(Number(amount).toFixed(2)),
        description: description.trim() || undefined,
        date: format(date, 'yyyy-MM-dd'),
        spender,
        payment_method_id: paymentMethodId,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon)
              return (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: cat.color }} />
                    {cat.name}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
      </div>

      {/* Spender */}
      <div className="space-y-2">
        <Label>Spender</Label>
        <Select value={spender} onValueChange={setSpender}>
          <SelectTrigger>
            <SelectValue placeholder="Select spender" />
          </SelectTrigger>
          <SelectContent>
            {spenderOptions.map((name) => (
              <SelectItem key={name} value={name!}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.spender && <p className="text-sm text-destructive">{errors.spender}</p>}
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((pm) => (
              <SelectItem key={pm.id} value={pm.id}>
                {pm.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.paymentMethodId && <p className="text-sm text-destructive">{errors.paymentMethodId}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          placeholder="What was this expense for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
