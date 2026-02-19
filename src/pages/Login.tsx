import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = (formData.get('email') as string).trim()
    const password = formData.get('password') as string

    const newErrors: Record<string, string> = {}
    if (!email) newErrors.email = 'Email is required'
    if (!password) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    const email = (document.getElementById('email') as HTMLInputElement)?.value?.trim()
    if (!email) {
      setErrors({ email: 'Enter your email to reset password' })
      return
    }

    setResettingPassword(true)
    try {
      await resetPassword(email)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setResettingPassword(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your SpendWise account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resettingPassword}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {resettingPassword ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <Input id="password" name="password" type="password" placeholder="Your password" />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
