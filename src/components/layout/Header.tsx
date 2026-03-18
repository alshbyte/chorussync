import { Link } from 'react-router-dom'
import { Music } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl safe-top">
      <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Music className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Chorus<span className="text-primary">Sync</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
