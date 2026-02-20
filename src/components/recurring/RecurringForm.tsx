import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { getCategoryIcon } from '@/components/categories/CategoryCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Frequency, RecurringExpenseWithRelations } from '@/types/database'

interface RecurringFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recurring: RecurringExpenseWithRelations | null
  onSave: (data: {
    category_id: string
    amount: number
    description?: string
    spender: string
    payment_method_id: string
    frequency: Frequency
    start_date: string
    end_date?: string
  }) => Promise<void>
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export function RecurringForm({ open, onOpenChange, recurring, onSave }: RecurringFormProps) {
  const { profile } = useAuth()
  const { categories } = useCategories()
  const { paymentMethods } = usePaymentMethods()

  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [spender, setSpender] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('monthly')
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const spenderOptions = [
    profile?.name || 'Me',
    ...(profile?.family_members || []),
  ].filter(Boolean)

  useEffect(() => {
    if (open) {
      setAmount(recurring?.amount?.toString() || '')
      setCategoryId(recurring?.category_id || '')
      setSpender(recurring?.spender || profile?.name || '')
      setPaymentMethodId(recurring?.payment_method_id || '')
      setDescription(recurring?.description || '')
      setFrequency(recurring?.frequency || 'monthly')
      setStartDate(recurring?.start_date ? new Date(recurring.start_date + 'T00:00:00') : new Date())
      setEndDate(recurring?.end_date ? new Date(recurring.end_date + 'T00:00:00') : undefined)
      setErrors({})
    }
  }, [open, recurring, profile?.name])

  async function handleSubmit() {
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
      await onSave({
        category_id: categoryId,
        amount: Number(Number(amount).toFixed(2)),
        description: description.trim() || undefined,
        spender,
        payment_method_id: paymentMethodId,
        frequency,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recurring ? 'Edit Recurring Expense' : 'New Recurring Expense'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
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
                  <SelectItem key={name} value={name!}>{name}</SelectItem>
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
                  <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethodId && <p className="text-sm text-destructive">{errors.paymentMethodId}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Input
              placeholder="What is this recurring expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={(d) => d && setStartDate(d)} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date (optional) */}
          <div className="space-y-2">
            <Label>End Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : 'No end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
            {endDate && (
              <Button variant="ghost" size="sm" onClick={() => setEndDate(undefined)}>
                Clear end date
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {recurring ? 'Save Changes' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
