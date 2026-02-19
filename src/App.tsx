import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/hooks/useTheme'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

// Placeholder pages — will be replaced in later tasks
function Placeholder({ title }: { title: string }) {
  return <div><h2 className="text-2xl font-bold">{title}</h2><p className="mt-2 text-muted-foreground">Coming soon</p></div>
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
                  <Route path="/expenses" element={<Placeholder title="Expenses" />} />
                  <Route path="/expenses/new" element={<Placeholder title="Add Expense" />} />
                  <Route path="/categories" element={<Placeholder title="Categories" />} />
                  <Route path="/recurring" element={<Placeholder title="Recurring" />} />
                  <Route path="/reports" element={<Placeholder title="Reports" />} />
                  <Route path="/settings" element={<Placeholder title="Settings" />} />
                </Route>
              </Route>
            </Routes>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
