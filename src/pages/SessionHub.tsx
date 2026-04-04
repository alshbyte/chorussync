import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Radio, Play, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCommunityStore } from '@/stores/community-store'

export function SessionHub() {
  const navigate = useNavigate()
  const store = useCommunityStore()

  const activeSessions = store.activeSessions
  const myTemples = store.temples.filter(t => t.createdBy === store.userId)
  // Only show sessions with valid group & song references
  const sessionDetails = activeSessions
    .map((s) => ({
      ...s,
      group: store.groups.find((g) => g.id === s.groupId),
      song: store.songs.find((song) => song.id === s.songId),
    }))
    .filter((s) => s.group && s.song)

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <h1 className="text-xl font-semibold">Live Sessions</h1>

        {sessionDetails.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Radio className="h-7 w-7 text-primary/50" />
            </div>
            <p className="text-base font-semibold text-foreground">No active sessions</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
              Go to a group and tap "Start Session" to begin leading a recital.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-5 gap-2"
              onClick={() => navigate(myTemples.length > 0 ? `/temple/${myTemples[0].id}` : '/dashboard')}
            >
              <Users className="h-3.5 w-3.5" />
              {myTemples.length > 0 ? 'Go to My Temple' : 'Go to Dashboard'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sessionDetails.map((s) => (
              <button
                key={s.id}
                onClick={() => navigate(`/session/${s.groupId}`)}
                className="w-full flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/20 p-4 active:scale-[0.99] transition-all text-left"
              >
                <div className="relative">
                  <Radio className="h-5 w-5 text-primary" />
                  <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.song?.title || 'Song'}</p>
                  <p className="text-xs text-muted-foreground">{s.group?.name || 'Group'}</p>
                </div>
                <Play className="h-4 w-4 text-primary shrink-0" />
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
