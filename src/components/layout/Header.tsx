import { Link } from 'react-router-dom'
import { Music } from 'lucide-react'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700">
            <Music className="h-4 w-4 text-white" />
          </div>
          <span className="font-serif text-lg font-bold">
            Chorus<span className="text-primary">Sync</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
