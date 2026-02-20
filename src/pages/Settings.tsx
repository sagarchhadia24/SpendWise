import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useProfile } from '@/hooks/useProfile'
import { usePaymentMethods } from '@/hooks/usePaymentMethods'
import { SUPPORTED_CURRENCIES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, X, Plus, Trash2 } from 'lucide-react'

export default function Settings() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>
      <ProfileSection />
      <FamilyMembersSection />
      <CurrencySection />
      <PaymentMethodsSection />
      <PasswordSection />
      <DangerZone />
    </div>
  )
}

function ProfileSection() {
  const { profile, updateProfile } = useProfile()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = (formData.get('name') as string).trim()
    if (!name) {
      toast.error('Name is required')
      return
    }
    setLoading(true)
    try {
      await updateProfile({ name })
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your display name</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={profile?.name || ''} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function FamilyMembersSection() {
  const { profile, updateProfile } = useProfile()
  const [newMember, setNewMember] = useState('')
  const [loading, setLoading] = useState(false)

  const members = profile?.family_members || []

  async function addMember() {
    const name = newMember.trim()
    if (!name) return
    if (members.includes(name)) {
      toast.error('Member already exists')
      return
    }
    setLoading(true)
    try {
      await updateProfile({ family_members: [...members, name] })
      setNewMember('')
      toast.success('Family member added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  async function removeMember(name: string) {
    setLoading(true)
    try {
      await updateProfile({ family_members: members.filter((m) => m !== name) })
      toast.success('Family member removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Members</CardTitle>
        <CardDescription>Add family members to tag expenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.length > 0 && (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm">{member}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => removeMember(member)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Member name"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMember() } }}
          />
          <Button onClick={addMember} disabled={loading || !newMember.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CurrencySection() {
  const { profile, updateProfile } = useProfile()
  const [loading, setLoading] = useState(false)

  async function handleChange(value: string) {
    setLoading(true)
    try {
      await updateProfile({ currency: value })
      toast.success('Currency updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update currency')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency</CardTitle>
        <CardDescription>Display currency for all amounts</CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={profile?.currency || 'USD'} onValueChange={handleChange} disabled={loading}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.symbol} {c.code} — {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

function PaymentMethodsSection() {
  const { paymentMethods, addPaymentMethod, removePaymentMethod, loading: methodsLoading } = usePaymentMethods()
  const [newMethod, setNewMethod] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    const name = newMethod.trim()
    if (!name) return
    setSaving(true)
    try {
      await addPaymentMethod(name)
      setNewMethod('')
      toast.success('Payment method added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    setSaving(true)
    try {
      await removePaymentMethod(id)
      toast.success('Payment method removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove. It may be linked to expenses.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage payment methods for expenses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!methodsLoading && paymentMethods.length > 0 && (
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm">{method.name}</span>
                {method.is_default ? (
                  <span className="text-xs text-muted-foreground">Default</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemove(method.id)}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="New payment method"
            value={newMethod}
            onChange={(e) => setNewMethod(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
          />
          <Button onClick={handleAdd} disabled={saving || !newMethod.trim()}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PasswordSection() {
  const { changePassword } = useProfile()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const password = formData.get('newPassword') as string
    const confirm = formData.get('confirmPassword') as string

    const newErrors: Record<string, string> = {}
    if (!password) newErrors.newPassword = 'Password is required'
    else if (password.length < 8) newErrors.newPassword = 'Password must be at least 8 characters'
    if (password !== confirm) newErrors.confirmPassword = 'Passwords do not match'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      await changePassword(password)
      toast.success('Password updated')
      e.currentTarget.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" name="newPassword" type="password" placeholder="At least 8 characters" />
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function DangerZone() {
  const { deleteAccount } = useProfile()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteAccount()
      toast.success('Account marked for deletion. You have 30 days to reactivate by logging in.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Permanently delete your account and all data</CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Your account will be marked for deletion. You have 30 days to reactivate
                by logging in again. After 30 days, all your data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
