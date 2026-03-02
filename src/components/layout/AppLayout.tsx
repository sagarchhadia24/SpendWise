import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNav } from '@/components/layout/TopNav'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // iOS WebKit tap-click polyfill.
  // Recharts registers touch handlers via React's event delegation on #root.
  // iOS WebKit's gesture recognizer sees these root-level listeners and
  // intermittently drops the touchend→click conversion on interactive elements.
  // This polyfill detects dropped clicks and synthesizes them.
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window
    if (!isTouchDevice) return

    let startX = 0
    let startY = 0
    let pending: HTMLElement | null = null
    let timer: ReturnType<typeof setTimeout> | null = null

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0]
      if (t) { startX = t.clientX; startY = t.clientY }
    }

    function onTouchEnd(e: TouchEvent) {
      const t = e.changedTouches[0]
      if (!t) return
      // Ignore scroll gestures (finger moved > 10px)
      if (Math.abs(t.clientX - startX) > 10 || Math.abs(t.clientY - startY) > 10) return

      const el = (e.target as HTMLElement).closest<HTMLElement>(
        'button, a, [role="button"], [role="tab"]'
      )
      if (!el) return

      pending = el
      timer = setTimeout(() => {
        // Native click didn't fire within 80ms — iOS dropped it
        if (pending) { pending.click(); pending = null }
      }, 80)
    }

    function onClickCapture() {
      // Native click fired — cancel the synthetic one
      if (timer) { clearTimeout(timer); timer = null }
      pending = null
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    document.addEventListener('click', onClickCapture, { capture: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('click', onClickCapture)
      if (timer) clearTimeout(timer)
    }
  }, [])

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
        <main className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6" style={{ contain: 'content' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
