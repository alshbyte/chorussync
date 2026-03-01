import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PWAInstallPrompt />
      <Header />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
