import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Tags,
  Repeat,
  BarChart3,
  Activity as ActivityIcon,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { profile, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">SpendWise</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-[oklch(0.55_0.15_180)] to-[oklch(0.6_0.17_155)] text-white shadow-[0_4px_12px_oklch(0.55_0.15_180_/_0.3)]'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Separator />
      <div className="p-4">
        <div className="mb-3 truncate text-sm font-medium">
          {profile?.name || 'User'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
