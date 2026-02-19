import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div className="p-8">Dashboard (coming soon)</div>} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
