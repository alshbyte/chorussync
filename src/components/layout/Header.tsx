import { Link } from 'react-router-dom'
import { Music } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl safe-top">
      <div className="mx-auto flex h-13 max-w-lg items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80">
            <Music className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            Chorus<span className="text-primary">Sync</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
