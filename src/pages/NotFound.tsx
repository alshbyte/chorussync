import { Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <Music className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-sm text-muted-foreground mb-6">Page not found</p>
      <Button onClick={() => navigate('/dashboard')} className="gap-2">
        Go Home
      </Button>
    </div>
  )
}
