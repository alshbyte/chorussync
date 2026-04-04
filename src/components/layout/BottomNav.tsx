import { NavLink } from 'react-router-dom'
import { Home, Library, Radio, Settings } from 'lucide-react'
import { useCommunityStore } from '@/stores/community-store'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/library', icon: Library, label: 'Library' },
  { to: '/session', icon: Radio, label: 'Sessions' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const activeSessions = useCommunityStore((s) => s.activeSessions)
  const hasLive = activeSessions.length > 0

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-[11px] font-medium transition-colors min-w-[56px] min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            <span>{label}</span>
            {/* Live indicator dot on Sessions tab */}
            {to === '/session' && hasLive && (
              <span className="absolute top-1.5 right-3 h-2 w-2 rounded-full bg-primary animate-pulse" />
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
