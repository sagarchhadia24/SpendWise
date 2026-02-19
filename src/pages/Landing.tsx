import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, Tags, BarChart3, Users } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const features = [
  {
    icon: Receipt,
    title: 'Track Expenses',
    description: 'Log daily expenses with categories, dates, and payment methods.',
  },
  {
    icon: Tags,
    title: 'Custom Categories',
    description: 'Organize spending with default and custom categories with icons and colors.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Charts',
    description: 'Visualize spending patterns with interactive charts and exportable reports.',
  },
  {
    icon: Users,
    title: 'Family Friendly',
    description: 'Tag expenses to family members and track household spending together.',
  },
]

export default function Landing() {
  const { user, loading } = useAuth()

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold">SpendWise</span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple expense tracking
          <br />
          for your family
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          SpendWise helps you track daily expenses, manage recurring payments,
          and understand your spending with interactive reports. No complexity, just clarity.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
