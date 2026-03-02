import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <WifiOff className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h1 className="text-xl font-semibold mb-2">You're offline</h1>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        ChorusSync needs an internet connection for real-time sync and AI features.
        Your song library is still available offline.
      </p>
      <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
        <RefreshCw className="h-4 w-4" /> Retry
      </Button>
    </div>
  )
}
