import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Radix Dialog sets pointer-events: none on document.body while its
  // DismissableLayer is mounted. During the 300ms close animation the
  // layer hasn't unmounted yet, so the entire page stays non-interactive.
  // Reset immediately on close so touches aren't blocked.
  const setSheetOpen = (open: boolean) => {
    setMobileOpen(open)
    if (!open) {
      document.body.style.pointerEvents = ''
    }
  }

  return (
    <div className="flex h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-background">
        <Sidebar />
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={mobileOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
          <Sidebar onNavigate={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
