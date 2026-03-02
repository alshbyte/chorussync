import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { WifiOff } from 'lucide-react'

export function AppShell() {
  const isOnline = useOnlineStatus()
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PWAInstallPrompt />
      {!isOnline && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center text-xs text-destructive flex items-center justify-center gap-2">
          <WifiOff className="h-3 w-3" /> You're offline — sync paused
        </div>
      )}
      <Header />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
